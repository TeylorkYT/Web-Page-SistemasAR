// Funciones con datos falsos de este módulo
const usuariosPrueba = [
  {
    id_usuario: 1,
    nombre: "Carlos",
    apellido: "Ramírez",
    correo_electronico: "cliente@prueba.com",
    contrasena: "Prueba123*",
    rol: "cliente",
    estado: "Activo",
  },
  {
    id_usuario: 2,
    nombre: "Andrés",
    apellido: "Gómez",
    correo_electronico: "tecnico@prueba.com",
    contrasena: "Prueba123*",
    rol: "tecnico",
    estado: "Activo",
  },
  {
    id_usuario: 3,
    nombre: "Laura",
    apellido: "Martinez",
    correo_electronico: "admin@prueba.com",
    contrasena: "Prueba123*",
    rol: "administrador",
    estado: "Activo",
  },
];

export async function iniciarSesion(correo, contrasena) {
  const correoLimpio = (correo || "").trim().toLowerCase();
  const usuario = usuariosPrueba.find(
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
  const existe = usuariosPrueba.some(
    (u) =>
      u.correo_electronico.toLowerCase() ===
      (datos.correo_electronico || "").trim().toLowerCase()
  );

  if (existe) {
    throw new Error("Este correo electrónico ya está registrado");
  }

  const nuevoUsuario = {
    id_usuario: usuariosPrueba.length + 1,
    nombre: datos.nombre,
    apellido: datos.apellido,
    correo_electronico: datos.correo_electronico,
    rol: "Cliente",
    fecha_registro: new Date().toISOString().split("T")[0],
    estado: "Activo",
  };
  return nuevoUsuario;
}