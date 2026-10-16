import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Boton from "../../components/Boton";
import { obtenerPerfilCliente, obtenerEquiposCliente } from "../../services/clienteService";

export default function PerfilCliente() {
  const [perfil, setPerfil] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [datosPerfil, datosEquipos] = await Promise.all([
          obtenerPerfilCliente(1), // Simulamos ser Laura
          obtenerEquiposCliente(1)
        ]);
        setPerfil(datosPerfil);
        setEquipos(datosEquipos);
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  if (cargando) {
    return (
      <Layout>
        <div style={{ padding: "20px", textAlign: "center" }}>Cargando perfil...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "20px", fontFamily: "var(--fuente-principal, sans-serif)", maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "24px", color: "var(--color-texto-principal, #0f172a)" }}>
          Mi Perfil
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          
          {/* Tarjeta de Datos Personales */}
          <div style={{
            backgroundColor: "white", padding: "24px", borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--color-borde, #e2e8f0)"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "var(--color-primario, #0a369d)",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", marginRight: "16px"
              }}>
                {perfil?.nombre?.charAt(0)}{perfil?.apellido?.charAt(0)}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>{perfil?.nombre} {perfil?.apellido}</h2>
                <span style={{
                  display: "inline-block", padding: "4px 8px", backgroundColor: "#e0f2fe", color: "#0369a1",
                  borderRadius: "12px", fontSize: "12px", fontWeight: "bold", marginTop: "4px"
                }}>
                  {perfil?.rol}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              <InfoItem etiqueta="Correo Electrónico" valor={perfil?.correo_electronico} />
              <InfoItem etiqueta="Teléfono" valor={perfil?.telefono} />
              <InfoItem etiqueta="Dirección" valor={perfil?.direccion} />
              <InfoItem etiqueta="Área / Departamento" valor={perfil?.area_departamento} />
              <InfoItem etiqueta="Miembro desde" valor={perfil?.fecha_registro} />
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", textAlign: "right" }}>
              <Boton variante="secundario">Editar Perfil</Boton>
            </div>
          </div>

          {/* Tarjeta de Mis Equipos Registrados */}
          <div style={{
            backgroundColor: "white", padding: "24px", borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--color-borde, #e2e8f0)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Mis Equipos Registrados</h2>
              <Boton variante="primario" estilo={{ padding: "6px 12px", fontSize: "12px" }}>+ Añadir Equipo</Boton>
            </div>

            {equipos.length > 0 ? (
              <div style={{ display: "grid", gap: "12px" }}>
                {equipos.map(equipo => (
                  <div key={equipo.id_equipo} style={{
                    padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontWeight: "bold", color: "#0f172a", fontSize: "15px" }}>
                        {equipo.tipo} - {equipo.marca} {equipo.modelo}
                      </p>
                      <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>S/N: {equipo.serial}</p>
                    </div>
                    <span style={{
                      padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold",
                      backgroundColor: equipo.estado_equipo === "Operativo" ? "#dcfce7" : equipo.estado_equipo === "En_Reparacion" ? "#fef08a" : "#fee2e2",
                      color: equipo.estado_equipo === "Operativo" ? "#166534" : equipo.estado_equipo === "En_Reparacion" ? "#854d0e" : "#991b1b"
                    }}>
                      {equipo.estado_equipo.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
                No tienes equipos registrados.
              </p>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}

// Subcomponente para los items de información
function InfoItem({ etiqueta, valor }) {
  return (
    <div>
      <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>{etiqueta}</p>
      <p style={{ margin: 0, fontSize: "15px", color: "#0f172a" }}>{valor || "No especificado"}</p>
    </div>
  );
}