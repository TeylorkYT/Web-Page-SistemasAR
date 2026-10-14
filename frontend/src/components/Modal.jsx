export default function Modal({ abierto, cerrar, titulo, children }) {
  if (!abierto) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white", padding: "20px", borderRadius: "8px",
        minWidth: "300px", maxWidth: "500px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>{titulo}</h3>
          <button onClick={cerrar} style={{ cursor: "pointer" }}>X</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}