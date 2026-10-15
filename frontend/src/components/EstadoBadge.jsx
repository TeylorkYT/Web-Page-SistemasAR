const colores = {
    activo: "#2e7d32",
    inactivo: "#757575",
    abierto: "#1565c0",
    cerrado: "#6a1b9a",
    baja: "#c62828",
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