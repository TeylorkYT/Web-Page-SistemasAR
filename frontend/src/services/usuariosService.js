import { usuarios } from "../data/datosFalsos";

export async function listarUsuarios() {
    return [...usuarios];
}