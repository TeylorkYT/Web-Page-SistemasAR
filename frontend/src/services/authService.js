import { cliente } from "../api/client";
import { usuarios } from "../data/datosFalsos";

export async function iniciarSesion(correo_electronico, contrasena) {
  try {
    const { data } = await cliente.post("/auth/login", { correo_electronico, contrasena });
    return data;
  } catch (error) {
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
  return {
    mensaje: `Se han enviado las instrucciones de recuperación a ${correoLimpio}.`,
  };
}

export async function registrarCliente(datos) {
  const existe = usuarios.some(
    (u) =>
      u.correo_electronico.toLowerCase() ===
      (datos.correo_electronico || "").trim().toLowerCase()
  );

  if (existe) {
    throw new Error("Este correo electrónico ya está registrado");
  }

  const nuevoUsuario = {
    id_usuario: usuarios.length + 1,
    nombre: datos.nombre,
    apellido: datos.apellido,
    correo_electronico: datos.correo_electronico,
    rol: "Cliente",
    fecha_registro: new Date().toISOString().split("T")[0],
    estado: "Activo",
  };
  return nuevoUsuario;
}