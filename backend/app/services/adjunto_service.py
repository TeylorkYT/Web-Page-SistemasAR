import os
import re
import uuid
from fastapi import HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core import config
from app.models.adjunto_ticket import AdjuntoTicket
from app.models.ticket import Ticket
from app.models.usuario import Usuario
from app.schemas.ticket import AdjuntoOut
from app.services.historial_service import registrar_historial
from app.services.ticket_service import validar_acceso_ticket

MAX_TAMANO_BYTES = 5 * 1024 * 1024  # 5 MB = 5,242,880 bytes
MAX_ADJUNTOS_POR_TICKET = 3
CHUNK_SIZE = 64 * 1024  # 64 KB

MIME_SIGNATURES = [
    (b"\xff\xd8\xff", "image/jpeg", ".jpg"),
    (b"\x89PNG\r\n\x1a\n", "image/png", ".png"),
    (b"%PDF-", "application/pdf", ".pdf"),
]


def sanitizar_nombre_archivo(nombre_original: str | None) -> str:
    if not nombre_original:
        return "archivo_adjunto"
    # Remover posibles componentes de ruta
    nombre = os.path.basename(nombre_original.replace("\\", "/"))
    # Remover caracteres peligrosos o de control
    nombre = re.sub(r'[\x00-\x1f<>:"/\\|?*]', "_", nombre)
    nombre = nombre.strip().strip(".")
    if not nombre:
        nombre = "archivo_adjunto"
    # Truncar a máximo 150 caracteres
    if len(nombre) > 150:
        base, ext = os.path.splitext(nombre)
        if len(ext) < 15:
            base = base[: 150 - len(ext)]
            nombre = f"{base}{ext}"
        else:
            nombre = nombre[:150]
    return nombre


def validar_magic_bytes(header: bytes) -> tuple[str, str]:
    for firma, mime, ext in MIME_SIGNATURES:
        if header.startswith(firma):
            return mime, ext
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y PDF.",
    )


def subir_adjunto(
    db: Session,
    usuario: Usuario,
    id_ticket: int,
    archivo: UploadFile,
) -> AdjuntoOut:
    ticket = db.get(Ticket, id_ticket)
    validar_acceso_ticket(usuario, ticket)

    if ticket.estado == "Cerrado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden agregar adjuntos a un ticket cerrado",
        )

    # Conteo de adjuntos existentes
    cant_adjuntos = db.scalar(
        select(func.count(AdjuntoTicket.id_adjunto)).where(
            AdjuntoTicket.id_ticket == id_ticket
        )
    ) or 0
    if cant_adjuntos >= MAX_ADJUNTOS_POR_TICKET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El ticket ya ha alcanzado el límite máximo de {MAX_ADJUNTOS_POR_TICKET} adjuntos",
        )

    # Lectura del primer bloque para validar magic bytes
    primer_chunk = archivo.file.read(CHUNK_SIZE)
    if not primer_chunk:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo proporcionado está vacío",
        )

    tipo_mime, extension = validar_magic_bytes(primer_chunk)

    nombre_sanitizado = sanitizar_nombre_archivo(archivo.filename)
    nombre_guardado = f"{uuid.uuid4().hex}{extension}"

    os.makedirs(config.UPLOAD_DIR, exist_ok=True)
    ruta_disco = os.path.join(config.UPLOAD_DIR, nombre_guardado)
    ruta_disco_abs = os.path.abspath(ruta_disco)
    upload_dir_abs = os.path.abspath(config.UPLOAD_DIR)

    # Prevención de path traversal
    if not ruta_disco_abs.startswith(upload_dir_abs):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ruta de guardado no válida",
        )

    tamano_total = len(primer_chunk)
    if tamano_total > MAX_TAMANO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo excede el tamaño máximo permitido de 5 MB",
        )

    try:
        with open(ruta_disco_abs, "wb") as f_out:
            f_out.write(primer_chunk)
            while True:
                chunk = archivo.file.read(CHUNK_SIZE)
                if not chunk:
                    break
                tamano_total += len(chunk)
                if tamano_total > MAX_TAMANO_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El archivo excede el tamaño máximo permitido de 5 MB",
                    )
                f_out.write(chunk)
    except Exception:
        if os.path.exists(ruta_disco_abs):
            try:
                os.remove(ruta_disco_abs)
            except OSError:
                pass
        raise

    # Guardar metadatos en base de datos
    try:
        # Re-verificar conteo dentro de transacción por seguridad de concurrencia
        cant_actual = db.scalar(
            select(func.count(AdjuntoTicket.id_adjunto)).where(
                AdjuntoTicket.id_ticket == id_ticket
            )
        ) or 0
        if cant_actual >= MAX_ADJUNTOS_POR_TICKET:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El ticket ya ha alcanzado el límite máximo de {MAX_ADJUNTOS_POR_TICKET} adjuntos",
            )

        adjunto = AdjuntoTicket(
            id_ticket=id_ticket,
            id_usuario=usuario.id_usuario,
            nombre_archivo=nombre_sanitizado,
            ruta_url=nombre_guardado,
            tipo_mime=tipo_mime,
            tamano_bytes=tamano_total,
        )
        db.add(adjunto)

        registrar_historial(
            db=db,
            id_ticket=id_ticket,
            tipo_accion="Comentario",
            id_usuario=usuario.id_usuario,
            detalles=f"Adjunto agregado: {nombre_sanitizado}",
        )

        db.commit()
        db.refresh(adjunto)
        return AdjuntoOut.model_validate(adjunto)
    except Exception:
        db.rollback()
        if os.path.exists(ruta_disco_abs):
            try:
                os.remove(ruta_disco_abs)
            except OSError:
                pass
        raise


def listar_adjuntos(
    db: Session,
    usuario: Usuario,
    id_ticket: int,
) -> list[AdjuntoOut]:
    ticket = db.get(Ticket, id_ticket)
    validar_acceso_ticket(usuario, ticket)

    stmt = (
        select(AdjuntoTicket)
        .where(AdjuntoTicket.id_ticket == id_ticket)
        .order_by(AdjuntoTicket.id_adjunto.asc())
    )
    adjuntos = list(db.scalars(stmt).all())
    return [AdjuntoOut.model_validate(a) for a in adjuntos]


def descargar_adjunto(
    db: Session,
    usuario: Usuario,
    id_ticket: int,
    id_adjunto: int,
) -> FileResponse:
    ticket = db.get(Ticket, id_ticket)
    validar_acceso_ticket(usuario, ticket)

    adjunto = db.scalar(
        select(AdjuntoTicket).where(
            AdjuntoTicket.id_ticket == id_ticket,
            AdjuntoTicket.id_adjunto == id_adjunto,
        )
    )
    if not adjunto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adjunto no encontrado",
        )

    ruta_disco = os.path.join(config.UPLOAD_DIR, adjunto.ruta_url)
    ruta_disco_abs = os.path.abspath(ruta_disco)
    upload_dir_abs = os.path.abspath(config.UPLOAD_DIR)

    if not ruta_disco_abs.startswith(upload_dir_abs) or not os.path.isfile(ruta_disco_abs):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado en el servidor",
        )

    return FileResponse(
        path=ruta_disco_abs,
        media_type=adjunto.tipo_mime,
        filename=adjunto.nombre_archivo,
        headers={"X-Content-Type-Options": "nosniff"},
    )
