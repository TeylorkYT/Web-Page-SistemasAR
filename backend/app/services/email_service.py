import html
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core import config

logger = logging.getLogger(__name__)


def _enviar_correo_smtp(destinatario: str, asunto: str, cuerpo_html: str, cuerpo_texto: str) -> bool:
    """Envía un correo mediante SMTP de forma segura y tolerante a fallos."""
    if not config.SMTP_HOST or not config.SMTP_HOST.strip():
        logger.info(
            f"[SMTP OMITIDO] No hay SMTP_HOST configurado. Correo para {destinatario} omitido con asunto: '{asunto}'."
        )
        return False

    try:
        mensaje = MIMEMultipart("alternative")
        mensaje["Subject"] = asunto
        mensaje["From"] = config.SMTP_FROM
        mensaje["To"] = destinatario

        # Parte texto plano y parte HTML
        mensaje.attach(MIMEText(cuerpo_texto, "plain", "utf-8"))
        mensaje.attach(MIMEText(cuerpo_html, "html", "utf-8"))

        puerto = int(config.SMTP_PORT)
        with smtplib.SMTP(config.SMTP_HOST, puerto, timeout=10) as servidor:
            if config.SMTP_TLS:
                servidor.starttls()
            if config.SMTP_USER and config.SMTP_PASSWORD:
                servidor.login(config.SMTP_USER, config.SMTP_PASSWORD)
            servidor.send_message(mensaje)

        logger.info(f"[SMTP ENVIADO] Correo exitoso a {destinatario} - '{asunto}'")
        return True
    except Exception as e:
        logger.warning(
            f"[SMTP ERROR] No se pudo enviar el correo a {destinatario} ('{asunto}'): {str(e)}"
        )
        return False


def _plantilla_base(contenido_html: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
    .contenedor {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }}
    .cabecera {{ background-color: #0a369d; color: #ffffff; padding: 24px; text-align: center; }}
    .cabecera h1 {{ margin: 0; font-size: 20px; letter-spacing: 0.5px; }}
    .cuerpo {{ padding: 28px 24px; color: #1e293b; line-height: 1.6; font-size: 15px; }}
    .btn {{ display: inline-block; background-color: #0284c7; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
    .pie {{ background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="contenedor">
    <div class="cabecera">
      <h1>SistemasAR · Mesa de Ayuda</h1>
    </div>
    <div class="cuerpo">
      {contenido_html}
    </div>
    <div class="pie">
      Este es un mensaje automático del sistema de soporte técnico SistemasAR.<br>
      Por favor no respondas a este correo.
    </div>
  </div>
</body>
</html>"""


def enviar_correo_recuperacion(destinatario: str, nombre: str, token_reset: str) -> bool:
    """Envía el enlace seguro para restablecer la contraseña."""
    nombre_seguro = html.escape(nombre)
    enlace = f"{config.FRONTEND_URL}/restablecer?token={token_reset}"

    contenido_html = f"""
      <p>Hola <strong>{nombre_seguro}</strong>,</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en SistemasAR.</p>
      <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
      <p style="text-align: center;">
        <a href="{enlace}" class="btn">Restablecer mi contraseña</a>
      </p>
      <p style="font-size: 13px; color: #64748b;">
        Este enlace es de uso único y vencerá en 30 minutos. Si tú no solicitaste este cambio, puedes ignorar este mensaje; tu contraseña actual se mantendrá segura.
      </p>
    """

    cuerpo_texto = f"""Hola {nombre},
Recibimos una solicitud para restablecer tu contraseña en SistemasAR.
Para crear una nueva contraseña ingresa al siguiente enlace (válido por 30 minutos):
{enlace}

Si no solicitaste este cambio, puedes ignorar este mensaje."""

    return _enviar_correo_smtp(
        destinatario=destinatario,
        asunto="Recuperación de contraseña · SistemasAR",
        cuerpo_html=_plantilla_base(contenido_html),
        cuerpo_texto=cuerpo_texto,
    )


def enviar_correo_evento_ticket(
    destinatario: str,
    nombre: str,
    id_ticket: int,
    titulo_ticket: str,
    evento: str,
    detalles: str,
) -> bool:
    """Envía notificación por correo cuando un ticket es asignado, comentado, resuelto o cerrado."""
    nombre_seguro = html.escape(nombre)
    titulo_seguro = html.escape(titulo_ticket)
    evento_seguro = html.escape(evento)
    detalles_seguro = html.escape(detalles)

    contenido_html = f"""
      <p>Hola <strong>{nombre_seguro}</strong>,</p>
      <p>Hay una novedad en tu ticket <strong>#{id_ticket} - {titulo_seguro}</strong>:</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: 600; color: #0f172a;">{evento_seguro}</p>
        <p style="margin: 6px 0 0; color: #475569;">{detalles_seguro}</p>
      </div>
      <p style="text-align: center;">
        <a href="{config.FRONTEND_URL}/cliente/tickets/{id_ticket}" class="btn">Ver detalle del ticket</a>
      </p>
    """

    cuerpo_texto = f"""Hola {nombre},
Hay una novedad en tu ticket #{id_ticket} - {titulo_ticket}:
Evento: {evento}
Detalles: {detalles}

Puedes ingresar a la plataforma para ver el estado completo:
{config.FRONTEND_URL}/cliente/tickets/{id_ticket}"""

    return _enviar_correo_smtp(
        destinatario=destinatario,
        asunto=f"Actualización del Ticket #{id_ticket}: {evento} · SistemasAR",
        cuerpo_html=_plantilla_base(contenido_html),
        cuerpo_texto=cuerpo_texto,
    )


def enviar_correo_bienvenida(destinatario: str, nombre: str) -> bool:
    """Envía correo de bienvenida tras el registro exitoso."""
    nombre_seguro = html.escape(nombre)
    contenido_html = f"""
      <p>¡Bienvenido/a, <strong>{nombre_seguro}</strong>!</p>
      <p>Tu cuenta en la mesa de ayuda de SistemasAR ha sido creada correctamente.</p>
      <p>Desde la plataforma podrás reportar incidencias técnicas, hacer seguimiento en tiempo real y calificar la atención brindada.</p>
      <p style="text-align: center;">
        <a href="{config.FRONTEND_URL}/login" class="btn">Iniciar sesión</a>
      </p>
    """

    cuerpo_texto = f"""¡Bienvenido/a, {nombre}!
Tu cuenta en SistemasAR ha sido creada correctamente.
Inicia sesión en: {config.FRONTEND_URL}/login"""

    return _enviar_correo_smtp(
        destinatario=destinatario,
        asunto="¡Bienvenido a SistemasAR!",
        cuerpo_html=_plantilla_base(contenido_html),
        cuerpo_texto=cuerpo_texto,
    )
