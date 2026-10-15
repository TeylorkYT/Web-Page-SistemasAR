import { usuarios } from "../data/datosFalsos";

export async function iniciarSesion(correo, contrasena) {
  const correoLimpio = (correo || "").trim().toLowerCase();
  const usuario = usuarios.find(
    (u) =>
      u.correo_electronico.toLowerCase() === correoLimpio &&
      u.contrasena === contrasena
  );

  if (!usuario) {
    throw new Error("Correo o contraseña incorrectos");
  }

  return {
    rol: usuario.rol.toLowerCase(),
    nombre: `${usuario.nombre} ${usuario.apellido}`,
  };
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