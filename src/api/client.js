import axios from "axios";
import { API_URL } from "../services/api";
import { despacharPeticionMock } from "./mockDataStore";

export const cliente = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 2000,
});

cliente.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("sesion");
    const sesion = raw ? JSON.parse(raw) : null;
    if (sesion?.access_token) {
      config.headers.Authorization = `Bearer ${sesion.access_token}`;
    }
  } catch {
    localStorage.removeItem("sesion");
  }
  return config;
});

let renovando = null;

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config;

    // Si el backend no está disponible (servidor no encendido, Network Error, ECONNREFUSED)
    // despachamos transparentemente la petición mediante el motor de datos simulados
    if (
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.code === "ECONNABORTED" ||
      [502, 503, 504].includes(error.response?.status)
    ) {
      try {
        const respuestaMock = await despacharPeticionMock(original);
        return respuestaMock;
      } catch (mockError) {
        return Promise.reject(mockError);
      }
    }

    let sesion = null;
    try {
      const raw = localStorage.getItem("sesion");
      sesion = raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem("sesion");
    }

    const esRutaDeAuth = original?.url
      ? original.url.includes("/auth/login") ||
        original.url.includes("/auth/refresh") ||
        original.url.includes("/auth/register")
      : false;

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
      } catch {
        renovando = null;
        localStorage.removeItem("sesion");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
