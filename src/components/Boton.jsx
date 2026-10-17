/**
 * ==============================================================================
 * SISTEMASAR - COMPONENTE DE BOTÓN REUTILIZABLE (Boton.jsx)
 * ==============================================================================
 * Desarrollado por: Jaider (Responsable de componentes y layout base)
 * 
 * Descripción:
 * Botón rectangular con esquinas redondeadas reutilizable para todas las vistas
 * de la aplicación (crear ticket, guardar, cancelar, nuevo usuario, etc.).
 * ==============================================================================
 */

import React from 'react';
import './Boton.css';

/**
 * Componente Boton
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Texto o contenido interior del botón
 * @param {string} [props.texto] - Texto alternativo si no se pasa como children
 * @param {('primario'|'secundario'|'peligro')} [props.variante='primario'] - Estilo visual del botón
 * @param {('button'|'submit'|'reset')} [props.tipo='button'] - Tipo nativo de botón HTML
 * @param {React.ReactNode} [props.icono] - Icono opcional que se muestra a la izquierda del texto
 * @param {Function} [props.onClick] - Función que se ejecuta al presionar el botón
 * @param {boolean} [props.deshabilitado=false] - Si es true, inhabilita los clics
 * @param {boolean} [props.anchoCompleto=false] - Si es true, ocupa el 100% del contenedor padre
 * @param {string} [props.className=''] - Clases CSS adicionales personalizadas
 * 
 * @returns {JSX.Element} Elemento de botón renderizado
 */
export default function Boton({
  children,
  texto,
  variante = 'primario',
  tipo = 'button',
  icono,
  onClick,
  deshabilitado = false,
  anchoCompleto = false,
  className = '',
  style,
  estilo,
  ...otrasProps
}) {
  const estiloFinal = style || estilo;

  // Construcción dinámica de clases CSS según la variante seleccionada
  const clasesBoton = [
    'boton-reutilizable',
    `boton-${variante}`,
    anchoCompleto ? 'boton-ancho-completo' : '',
    className
  ].filter(Boolean).join(' ');

  // Manejador del evento clic
  const manejarClick = (evento) => {
    if (deshabilitado) {
      evento.preventDefault();
      return;
    }
    if (onClick) {
      onClick(evento);
    }
  };

  return (
    <button
      type={tipo}
      className={clasesBoton}
      onClick={manejarClick}
      disabled={deshabilitado}
      style={estiloFinal}
      {...otrasProps}
    >
      {/* Si se proporciona un icono, se renderiza antes del texto */}
      {icono && <span className="boton-icono">{icono}</span>}
      
      {/* Contenido principal: texto recibido por children o por prop texto */}
      <span>{children || texto}</span>
    </button>
  );
}
