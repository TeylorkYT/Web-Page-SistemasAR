import axios from "axios";
import { API_URL } from "../services/api";

export const cliente = axios.create({ baseURL: `${API_URL}/api/v1` });

cliente.interceptors.request.use((config) => {
  const sesion = JSON.parse(localStorage.getItem("sesion") || "null");
  if (sesion?.access_token) {
    config.headers.Authorization = `Bearer ${sesion.access_token}`;
  }
  return config;
});

let renovando = null;

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config;
    const sesion = JSON.parse(localStorage.getItem("sesion") || "null");
    const esRutaDeAuth = original?.url ? original.url.includes("/auth/") : false;

    if (
      error.response?.status === 401 &&
      sesion?.refresh_token &&
      !original?._reintentado &&
      !esRutaDeAuth
    ) {
      original._reintentado = true;
      try {
        renovando =
          renovando ||
          axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: sesion.refresh_token });
        const { data } = await renovando;
        renovando = null;
        localStorage.setItem("sesion", JSON.stringify(data));
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return cliente(original);
      } catch (e) {
        renovando = null;
        localStorage.removeItem("sesion");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
