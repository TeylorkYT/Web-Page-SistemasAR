const colores = {
    activo: "#2e7d32",
    inactivo: "#757575",
    disponible: "#2e7d32",
    agotado: "#ef6c00",
    de_baja: "#c62828",
    abierto: "#1565c0",
    en_proceso: "#00838f",
    resuelto: "#558b2f",
    cerrado: "#6a1b9a",
};

export default function EstadoBadge({ estado }) {
    const texto = String(estado || "");
    const color = colores[texto.toLowerCase()] || "#555";

    return (
        <span
            style={{
                background: color,
                color: "white",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "0.85rem",
            }}
        >
            {texto}
        </span>
    );
}