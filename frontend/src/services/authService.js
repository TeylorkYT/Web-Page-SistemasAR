import { cliente } from "../api/client";

export async function iniciarSesion(correo_electronico, contrasena) {
  try {
    const { data } = await cliente.post("/auth/login", { correo_electronico, contrasena });
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    if (detalle) throw new Error(detalle);
    const estado = error.response?.status;
    if (estado === 401) throw new Error("Correo o contraseña incorrectos");
    if (estado === 403) throw new Error("Tu cuenta está inactiva. Habla con el administrador");
    throw new Error("No se pudo conectar con el servidor");
  }
}

export async function obtenerPerfil() {
  const { data } = await cliente.get("/auth/me");
  return data;
}

export async function solicitarRecuperacion(correo) {
  const correoLimpio = (correo || "").trim();
  if (!correoLimpio) {
    throw new Error("El correo electrónico es obligatorio");
  }
  try {
    const { data } = await cliente.post("/auth/recuperar", { correo_electronico: correoLimpio });
    return {
      mensaje: data.detail || `Se han enviado las instrucciones de recuperación a ${correoLimpio}.`,
    };
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(detalle || "Ocurrió un error al procesar tu solicitud.");
  }
}

export const recuperarContrasena = solicitarRecuperacion;

export async function restablecerContrasena(token, contrasena) {
  try {
    const { data } = await cliente.post("/auth/restablecer", {
      token: (token || "").trim(),
      contrasena,
    });
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "El enlace de recuperación es inválido o ha expirado.");
  }
}

export async function registrarCliente(datos) {
  try {
    const payload = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo_electronico: (datos.correo_electronico || "").trim(),
      contrasena: datos.contrasena || "Prueba123*",
      telefono: datos.telefono || "3000000000",
      direccion: datos.direccion || "Dirección de prueba",
      area_departamento: datos.area_departamento || "General",
    };
    const { data } = await cliente.post("/auth/register", payload);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    if (typeof detalle === "string") throw new Error(detalle);
    if (Array.isArray(detalle)) {
      throw new Error(detalle.map((d) => d.msg).join(", "));
    }
    throw new Error("Error al registrar el cliente.");
  }
}