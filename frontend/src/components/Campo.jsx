export default function Campo({ etiqueta, tipo = "text", valor, onChange, placeholder, error, requerido }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      {etiqueta && (
        <label style={{ display: "block", marginBottom: "5px" }}>
          {etiqueta} {requerido && <span style={{ color: "red" }}>*</span>}
        </label>
      )}
      <input
        type={tipo}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        required={requerido}
        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
      />
      {error && <p style={{ color: "red", fontSize: "14px", margin: "5px 0 0 0" }}>{error}</p>}
    </div>
  );
}