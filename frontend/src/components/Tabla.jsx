export default function Tabla({ columnas, filas, mensajeVacio = "No hay registros para mostrar" }) {
    if (!filas || filas.length === 0) {
        return <p>{mensajeVacio}</p>;
    }

    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    {columnas.map((col) => (
                        <th key={col.campo} style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>
                            {col.titulo}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filas.map((fila, index) => (
                    <tr key={index}>
                        {columnas.map((col) => (
                            <td key={col.campo} style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                                {col.render ? col.render(fila) : fila[col.campo]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}