/**
 * ==============================================================================
 * SISTEMASAR - SERVICIO DE CONEXIÓN CON EL BACKEND (api.js)
 * ==============================================================================
 * Define la dirección base para comunicarse con la API de FastAPI.
 * ==============================================================================
 */

// URL principal del servidor backend (FastAPI en local)
// En producción define VITE_API_URL (ej. https://sistemasar.net). Vacío = mismo origen vía Nginx.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
