// Funciones con datos falsos de este módulo
export const datosSimulados = [];

export async function iniciarSesion(correo, contrasena) {
  return { token: "token-falso", rol: "cliente", nombre: "Usuario de prueba" };
}