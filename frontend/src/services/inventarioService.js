import { inventario } from "../data/datosFalsos";

export async function listarInventario() {
    return [...inventario];
}