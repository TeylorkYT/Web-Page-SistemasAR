export default function Tabla({ columnas, filas, mensajeVacio = "No hay registros para mostrar" }) {
    if (!filas || filas.length === 0) {
        return <p>{mensajeVacio}</p>;
    }

    return (
        <table>
            <thead>
                <tr>
                    {columnas.map((col) => (
                        <th key={col.campo}>{col.titulo}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filas.map((fila) => (
                    <tr key={fila.id}>
                        {columnas.map((col) => (
                            <td key={col.campo}>
                                {col.render ? col.render(fila) : fila[col.campo]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}