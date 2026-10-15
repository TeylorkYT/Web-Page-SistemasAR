/**
 * ==============================================================================
 * SISTEMASAR - PÁGINA DE PRUEBA DEL LAYOUT (Ejemplo.jsx)
 * ==============================================================================
 * Desarrollado por: Jaider (Layout base del frontend)
 * 
 * Muestra el contenido dentro del Layout adaptado al rol seleccionado.
 * ==============================================================================
 */

import React from 'react';
import Boton from '../components/Boton';
import './Ejemplo.css';

/**
 * Componente de vista de ejemplo
 * 
 * @param {Object} props
 * @param {('administrador'|'tecnico'|'cliente')} [props.rol='administrador'] - Rol actual
 */
export default function Ejemplo({ rol = 'administrador' }) {
  return (
    <div className="vista-ejemplo">
      <div className="vista-encabezado">
        <div>
          <h1 className="vista-titulo">
            {rol === 'administrador' && 'Dashboard del Administrador'}
            {rol === 'tecnico' && 'Dashboard del Técnico'}
            {rol === 'cliente' && 'Resumen de Mis Tickets (Cliente)'}
          </h1>
          <p className="vista-subtitulo">
            Visualización del Layout base para el rol: <strong>{rol}</strong>
          </p>
        </div>

        {/* Acciones principales con el componente Boton rectangular reutilizable */}
        <div className="vista-acciones">
          {rol === 'cliente' && (
            <Boton variante="primario" icono="+" texto="Crear ticket nuevo" />
          )}
          {rol === 'tecnico' && (
            <Boton variante="primario" texto="Actualizar estado de ticket" />
          )}
          {rol === 'administrador' && (
            <>
              <Boton variante="secundario" texto="Exportar métricas" />
              <Boton variante="primario" icono="+" texto="Nuevo usuario" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
