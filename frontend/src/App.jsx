/**
 * ==============================================================================
 * SISTEMASAR - COMPONENTE PRINCIPAL (App.jsx)
 * ==============================================================================
 * Desarrollado por: Jaider (Layout base del frontend)
 *
 * En este archivo montamos el componente Layout con soporte para los 3 roles:
 * - Cliente
 * - Técnico
 * - Administrador
 *
 * Puedes alternar entre ellos usando el selector en el encabezado superior.
 * ==============================================================================
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import Estado from './pages/Estado';

/**
 * Componente principal de la aplicación
 */
function App() {
  // Estado para controlar qué rol está activo: 'administrador', 'tecnico' o 'cliente'
  const [rolActivo, setRolActivo] = useState('administrador');

  // Estado para controlar qué ítem del menú lateral está seleccionado
  const [seccionActiva, setSeccionActiva] = useState('dashboard');

  // Manejador para alternar rol y resetear sección activa a 'dashboard'
  const manejarCambioRol = (nuevoRol) => {
    setRolActivo(nuevoRol);
    setSeccionActiva('dashboard');
  };

  return (
    <Layout
      rol={rolActivo}
      onCambiarRol={manejarCambioRol}
      itemActivo={seccionActiva}
      onCambiarItem={(nuevoItem) => setSeccionActiva(nuevoItem)}
      nombreUsuario="Jaider Joan Getial"
    >
      {/* Contenido principal inyectado dentro del Layout */}
      <Estado />
    </Layout>
  );
}

export default App;
