import { ref, reactive } from 'vue';

function cargarSesionInicial() {
  try {
    const guardada = localStorage.getItem('sesion');
    return guardada ? JSON.parse(guardada) : null;
  } catch {
    localStorage.removeItem('sesion');
    return null;
  }
}

const sesion = ref(cargarSesionInicial());

export function useAuth() {
  const guardarSesion = (datos) => {
    try {
      const nueva = {
        access_token: datos.access_token,
        refresh_token: datos.refresh_token,
        rol: datos.rol,
        nombre: datos.nombre,
      };
      localStorage.setItem('sesion', JSON.stringify(nueva));
      sesion.value = nueva;
    } catch (err) {
      console.error('Error al guardar sesión en localStorage:', err);
    }
  };

  const cerrarSesion = () => {
    try {
      localStorage.removeItem('sesion');
    } catch (err) {
      console.error('Error al remover sesión:', err);
    }
    sesion.value = null;
  };

  return {
    sesion,
    guardarSesion,
    cerrarSesion,
  };
}

export default useAuth;
