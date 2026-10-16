/**
 * ==============================================================================
 * SISTEMASAR - VISTA 12: ACTUALIZAR AVANCE (ActualizarAvance.jsx)
 * ==============================================================================
 * Desarrollado por: Cristian (Responsable del Módulo Técnico)
 *
 * Cumple con los requerimientos del Daily 2:
 * - Formulario para registrar el avance técnico en el historial y bitácora del ticket.
 * - Validación de campos obligatorios con retroalimentación visual.
 * - Consume datos exclusivamente desde la capa de servicios (tecnicoService.js).
 * - Opciones de cambiar el estado al mismo tiempo que se registra el avance.
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Boton from "../../components/Boton";
import {
  obtenerDetalleTicket,
  registrarAvance,
  obtenerTecnicoActual
} from "../../services/tecnicoService";
import "./ActualizarAvance.css";

export default function ActualizarAvance() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [tecnico, setTecnico] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [cargandoTicket, setCargandoTicket] = useState(true);

  // Campos de formulario
  const [tipoAccion, setTipoAccion] = useState("Reparacion");
  const [detalles, setDetalles] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    let cancelado = false;

    obtenerTecnicoActual().then((datos) => {
      if (!cancelado) setTecnico(datos);
    });

    obtenerDetalleTicket(id)
      .then((datos) => {
        if (!cancelado) {
          setTicket(datos);
          setNuevoEstado(datos.estado);
          setCargandoTicket(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          console.error("Error al cargar ticket:", err);
          setCargandoTicket(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorValidacion("");
    setMensajeExito("");

    if (!detalles.trim()) {
      setErrorValidacion("Por favor escribe la descripción detallada del trabajo o avance realizado.");
      return;
    }

    if (detalles.trim().length < 10) {
      setErrorValidacion("El detalle del avance debe contener al menos 10 caracteres explicativos.");
      return;
    }

    setGuardando(true);

    try {
      await registrarAvance(id, {
        detalles,
        tipoAccion,
        nuevoEstado: nuevoEstado !== ticket.estado ? nuevoEstado : null
      });

      setMensajeExito("¡Avance técnico registrado con éxito en el historial del ticket!");
      setDetalles("");

      // Tras 1.5 segundos volver al detalle del ticket
      setTimeout(() => {
        navigate(`/tecnico/tickets/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error al registrar avance:", err);
      setErrorValidacion(err.message || "Ocurrió un error al guardar el avance.");
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambioMenu = (itemId) => {
    if (itemId === "dashboard" || itemId === "tickets-asignados") {
      navigate("/tecnico");
    } else if (itemId === "inventario-repuestos") {
      navigate("/tecnico/inventario");
    }
  };

  return (
    <Layout
      rol="tecnico"
      itemActivo="tickets-asignados"
      nombreUsuario={tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Diana Paz"}
      onCambiarItem={manejarCambioMenu}
    >
      <div className="avance-tecnico-contenedor">
        {/* Encabezado */}
        <header className="avance-tecnico-header">
          <div>
            <h1 className="avance-tecnico-titulo">Registrar Avance de Soporte Técnico</h1>
            <p className="avance-tecnico-subtitulo">
              Añade notas de diagnóstico, reparación y actualiza el progreso en la bitácora del ticket.
            </p>
          </div>
          <div>
            <Boton
              variante="secundario"
              onClick={() => navigate(`/tecnico/tickets/${id}`)}
              texto="⬅ Volver al Ticket"
            />
          </div>
        </header>

        {/* Tarjeta de Referencia del Ticket */}
        {ticket && (
          <section className="ticket-resumen-banner">
            <div className="resumen-ticket-info">
              <span className="ticket-id-tag" style={{ fontSize: "1rem" }}>
                Ticket #{ticket.id_ticket}
              </span>
              <span className="resumen-ticket-titulo">{ticket.titulo}</span>
            </div>
            <div>
              <span className={`badge-estado ${ticket.estado}`}>
                {ticket.estado.replace("_", " ")}
              </span>
            </div>
          </section>
        )}

        {/* Notificación de Éxito */}
        {mensajeExito && (
          <div className="alerta-formulario exito" role="status">
            <span>✅ {mensajeExito} Redirigiendo al detalle...</span>
          </div>
        )}

        {/* Formulario */}
        <section className="avance-formulario-card">
          <form onSubmit={manejarEnvio} noValidate>
            {/* Tipo de Acción */}
            <div className="grupo-campo">
              <label htmlFor="tipo-accion">Tipo de Acción / Avance *</label>
              <div className="campo-descripcion">
                Selecciona la categoría del trabajo realizado sobre el equipo o servicio.
              </div>
              <select
                id="tipo-accion"
                className="avance-select"
                value={tipoAccion}
                onChange={(e) => setTipoAccion(e.target.value)}
                disabled={guardando}
              >
                <option value="Diagnostico">Diagnóstico y Pruebas</option>
                <option value="Reparacion">Reparación / Corrección Técnica</option>
                <option value="Mantenimiento">Mantenimiento Preventivo / Limpieza</option>
                <option value="Solicitud_Repuesto">Solicitud / Uso de Repuesto de Inventario</option>
                <option value="Comentario">Nota Informativa / Seguimiento</option>
              </select>
            </div>

            {/* Nuevo Estado Opcional */}
            <div className="grupo-campo">
              <label htmlFor="nuevo-estado">Actualizar Estado del Ticket (Opcional)</label>
              <div className="campo-descripcion">
                Puedes cambiar el estado del ticket inmediatamente al guardar este avance.
              </div>
              <select
                id="nuevo-estado"
                className="avance-select"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                disabled={guardando}
              >
                <option value="Abierto">Abierto</option>
                <option value="En_Proceso">En Proceso (Trabajo en curso)</option>
                <option value="Resuelto">Resuelto (Problema solucionado satisfactoriamente)</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            {/* Detalles del Avance */}
            <div className="grupo-campo">
              <label htmlFor="detalles-avance">Descripción Detallada del Avance *</label>
              <div className="campo-descripcion">
                Describe con precisión qué acciones técnicas realizaste, componentes inspeccionados o resultados de pruebas.
              </div>
              <textarea
                id="detalles-avance"
                className="avance-textarea"
                placeholder="Ejemplo: Se realizó desarme preventivo, limpieza del sistema de refrigeración y cambio de pasta térmica. El equipo superó la prueba de estrés de temperatura sin fallas."
                value={detalles}
                onChange={(e) => {
                  setDetalles(e.target.value);
                  if (errorValidacion) setErrorValidacion("");
                }}
                disabled={guardando}
              />
              {errorValidacion && <div className="campo-error-mensaje">⚠️ {errorValidacion}</div>}
            </div>

            {/* Botones de Acción */}
            <div className="acciones-formulario">
              <Boton
                variante="secundario"
                tipo="button"
                onClick={() => navigate(`/tecnico/tickets/${id}`)}
                deshabilitado={guardando}
                texto="Cancelar"
              />
              <Boton
                variante="primario"
                tipo="submit"
                deshabilitado={guardando}
                texto={guardando ? "Guardando avance..." : "💾 Guardar Avance Técnico"}
              />
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}