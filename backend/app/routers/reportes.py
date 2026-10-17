from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.core.deps import requiere_roles
from app.db.database import get_db
from app.models.usuario import Usuario
from app.services import exportacion_service, reporte_service

router = APIRouter(prefix="/api/v1/reportes", tags=["reportes"])

TIPOS_REPORTES_VALIDOS = {
    "por_agente": reporte_service.reporte_por_agente,
    "por_prioridad": reporte_service.reporte_por_prioridad,
    "tiempos_resolucion": reporte_service.reporte_tiempos_resolucion,
    "estado_general": reporte_service.reporte_estado_general,
    "incidencias_area_categoria": reporte_service.reporte_incidencias_area_categoria,
}


def _validar_fechas(desde: str | None, hasta: str | None) -> None:
    for nombre, valor in (("desde", desde), ("hasta", hasta)):
        if valor:
            try:
                datetime.fromisoformat(valor)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Parámetro '{nombre}' inválido. Use formato ISO (AAAA-MM-DD)",
                )


@router.get("/{tipo_informe}/exportar")
def exportar_reporte(
    tipo_informe: str,
    formato: str = Query(..., description="Formato de exportación: 'pdf' o 'excel'"),
    desde: str | None = Query(default=None),
    hasta: str | None = Query(default=None),
    db: Session = Depends(get_db),
    admin: Usuario = Depends(requiere_roles("Administrador", "administrador")),
):
    formato_normalizado = (formato or "").strip().lower()
    if formato_normalizado not in ["excel", "xlsx", "pdf"]:
        raise HTTPException(
            status_code=400,
            detail="Formato de exportación inválido. Use 'excel' o 'pdf'",
        )

    if tipo_informe not in TIPOS_REPORTES_VALIDOS:
        raise HTTPException(
            status_code=400,
            detail="Tipo de informe no válido. Opciones: por_agente, por_prioridad, tiempos_resolucion, estado_general, incidencias_area_categoria",
        )

    _validar_fechas(desde, hasta)

    funcion_servicio = TIPOS_REPORTES_VALIDOS[tipo_informe]
    datos = funcion_servicio(db, desde, hasta)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if formato_normalizado in ["excel", "xlsx"]:
        archivo_bytes = exportacion_service.generar_excel(tipo_informe, datos, desde, hasta)
        nombre_archivo = f"reporte_{tipo_informe}_{timestamp}.xlsx"
        return Response(
            content=archivo_bytes.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{nombre_archivo}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    else:
        archivo_bytes = exportacion_service.generar_pdf(tipo_informe, datos, desde, hasta)
        nombre_archivo = f"reporte_{tipo_informe}_{timestamp}.pdf"
        return Response(
            content=archivo_bytes.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{nombre_archivo}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )


@router.get("/{tipo_informe}", response_model=Any)
def obtener_reporte(
    tipo_informe: str,
    desde: str | None = Query(default=None),
    hasta: str | None = Query(default=None),
    db: Session = Depends(get_db),
    admin: Usuario = Depends(requiere_roles("Administrador", "administrador")),
):
    if tipo_informe not in TIPOS_REPORTES_VALIDOS:
        raise HTTPException(
            status_code=400,
            detail="Tipo de informe no válido. Opciones: por_agente, por_prioridad, tiempos_resolucion, estado_general, incidencias_area_categoria",
        )

    _validar_fechas(desde, hasta)

    funcion_servicio = TIPOS_REPORTES_VALIDOS[tipo_informe]
    return funcion_servicio(db, desde, hasta)
