<template>
  <Layout
    rol="administrador"
    item-activo="dashboard"
    :nombre-usuario="nombreUsuario"
  >
    <div class="dashboard-admin-pagina">
      <!-- Encabezado principal -->
      <header class="dashboard-admin-header">
        <div>
          <h1 class="dashboard-admin-titulo">Centro de Control Administrativo</h1>
          <p class="dashboard-admin-subtitulo">
            Supervisión ejecutiva en tiempo real del flujo de soporte, despacho técnico y satisfacción del cliente.
          </p>
        </div>

        <div class="dashboard-header-acciones">
          <button
            type="button"
            class="btn-header-accion primario"
            @click="irA('/admin/asignacion')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Bandeja de Triaje</span>
            <span
              v-if="metricas.ticketsSinAsignar > 0"
              style="background-color: #ffffff; color: var(--color-primario-oscuro, #008f7e); padding: 1px 7px; border-radius: 10px; font-size: 11px; font-weight: 800;"
            >
              {{ metricas.ticketsSinAsignar }}
            </span>
          </button>

          <button
            type="button"
            class="btn-header-accion"
            @click="irA('/admin/tickets')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Historial</span>
          </button>

          <button
            type="button"
            class="btn-header-accion"
            @click="irA('/admin/reportes')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Reportes</span>
          </button>

          <button
            type="button"
            class="btn-header-accion btn-recargar"
            style="color: #64748b; font-size: 0.8rem;"
            title="Recargar métricas en vivo"
            @click="cargarDatos"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>{{ ultimaActualizacion }}</span>
          </button>
        </div>
      </header>

      <!-- Alerta Operativa de Triaje (si hay tickets sin asignar o críticos) -->
      <div
        v-if="!cargando && (metricas.ticketsSinAsignar > 0 || metricas.ticketsCriticos > 0)"
        class="dashboard-alerta-triaje"
      >
        <div class="alerta-triaje-izq">
          <div class="alerta-triaje-icono-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <div class="alerta-triaje-titulo">
              Atención Operativa Requerida
            </div>
            <div class="alerta-triaje-desc">
              Hay <strong>{{ metricas.ticketsSinAsignar }}</strong> ticket(s) sin asignar en espera de triaje
              <template v-if="metricas.ticketsCriticos > 0">
                y <strong>{{ metricas.ticketsCriticos }}</strong> ticket(s) con prioridad Crítica
              </template>
              que requieren gestión inmediata.
            </div>
          </div>
        </div>
        <button
          type="button"
          class="btn-alerta-accion"
          @click="irA('/admin/asignacion')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <span>Ir a Asignación de Técnicos →</span>
        </button>
      </div>

      <!-- 1. CINCO TARJETAS DE MÉTRICAS EJECUTIVAS -->
      <section class="dashboard-kpi-grid" aria-label="Métricas clave">
        <!-- Tickets Registrados -->
        <div class="tarjeta-kpi-ejecutiva navy">
          <div class="kpi-encabezado">
            <span class="kpi-etiqueta">Total Tickets</span>
            <div class="kpi-icono navy">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
          </div>
          <div class="kpi-valor">
            {{ cargando ? "..." : metricas.ticketsTotales }}
          </div>
          <div class="kpi-subtexto">
            {{ metricas.ticketsAbiertos }} abiertos · {{ metricas.ticketsCerrados + metricas.ticketsResueltos }} resueltos
          </div>
        </div>

        <!-- Sin Asignar (Triaje) -->
        <div class="tarjeta-kpi-ejecutiva orange">
          <div class="kpi-encabezado">
            <span class="kpi-etiqueta">Sin Asignar</span>
            <div class="kpi-icono orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-valor" :style="{ color: metricas.ticketsSinAsignar > 0 ? '#ea580c' : '#059669' }">
            {{ cargando ? "..." : metricas.ticketsSinAsignar }}
          </div>
          <div class="kpi-subtexto">
            {{ metricas.ticketsSinAsignar > 0 ? 'Requieren asignación técnica' : 'Todos asignados al día' }}
          </div>
        </div>

        <!-- En Atención Activa -->
        <div class="tarjeta-kpi-ejecutiva blue">
          <div class="kpi-encabezado">
            <span class="kpi-etiqueta">En Atención</span>
            <div class="kpi-icono blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-valor" style="color: #0284c7;">
            {{ cargando ? "..." : metricas.ticketsEnProceso }}
          </div>
          <div class="kpi-subtexto">
            Por {{ metricas.tecnicosActivos }} técnicos en servicio
          </div>
        </div>

        <!-- Tasa de Efectividad / Cierre -->
        <div class="tarjeta-kpi-ejecutiva teal">
          <div class="kpi-encabezado">
            <span class="kpi-etiqueta">Efectividad</span>
            <div class="kpi-icono teal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <div class="kpi-valor" style="color: #00bba6;">
            {{ cargando ? "..." : metricas.tasaResolucion }}%
          </div>
          <div class="kpi-subtexto">
            {{ metricas.ticketsResueltos + metricas.ticketsCerrados }} casos finalizados
          </div>
        </div>

        <!-- Satisfacción CSAT -->
        <div class="tarjeta-kpi-ejecutiva gold">
          <div class="kpi-encabezado">
            <span class="kpi-etiqueta">Satisfacción CSAT</span>
            <div class="kpi-icono gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div class="kpi-valor" style="color: #d97706; display: flex; align-items: center; gap: 4px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>{{ cargando ? "..." : metricas.promedioCalificacion }}</span>
          </div>
          <div class="kpi-subtexto">
            Sobre {{ metricas.totalCalificaciones }} calificaciones recibidas
          </div>
        </div>
      </section>

      <!-- 2. FILA 1: GRÁFICOS Y DISTRIBUCIÓN -->
      <section class="dashboard-grid-dos-columnas">
        <!-- Gráfico Comparativo Dual -->
        <div class="dashboard-tarjeta-contenedor">
          <div class="tarjeta-header-flex">
            <h2 class="tarjeta-titulo-con-icono">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span>Flujo de Incidencias: Ingresados vs Resueltos</span>
            </h2>
            <div style="display: flex; gap: 6px;">
              <button
                type="button"
                :style="{
                  padding: '4px 12px',
                  borderRadius: '14px',
                  border: comparativoSemanal ? '1px solid var(--color-primario, #00bba6)' : '1px solid #e2e8f0',
                  backgroundColor: comparativoSemanal ? '#e6f9f6' : '#ffffff',
                  color: comparativoSemanal ? '#007a6c' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }"
                @click="comparativoSemanal = true"
              >
                Semanal
              </button>
              <button
                type="button"
                :style="{
                  padding: '4px 12px',
                  borderRadius: '14px',
                  border: !comparativoSemanal ? '1px solid var(--color-primario, #00bba6)' : '1px solid #e2e8f0',
                  backgroundColor: !comparativoSemanal ? '#e6f9f6' : '#ffffff',
                  color: !comparativoSemanal ? '#007a6c' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }"
                @click="comparativoSemanal = false"
              >
                Mensual
              </button>
            </div>
          </div>

          <div class="grafico-area-moderna">
            <div
              v-for="(grupo, idx) in datosGrafico"
              :key="grupo.etiqueta || idx"
              class="grafico-grupo-barra"
            >
              <div class="grafico-barras-duales">
                <div
                  class="barra-dual abiertos"
                  :style="{ height: `${grupo.alturaAbiertos}%` }"
                  :title="`${grupo.abiertos} ingresados/abiertos`"
                />
                <div
                  class="barra-dual cerrados"
                  :style="{ height: `${grupo.alturaCerrados}%` }"
                  :title="`${grupo.cerrados} resueltos/cerrados`"
                />
              </div>
              <span class="grafico-barra-etiqueta">{{ grupo.etiqueta }}</span>
            </div>
          </div>

          <!-- Leyenda del Gráfico -->
          <div class="grafico-leyenda">
            <div class="leyenda-item">
              <span class="leyenda-punto abiertos"></span>
              <span>Ingresados / Abiertos</span>
            </div>
            <div class="leyenda-item">
              <span class="leyenda-punto cerrados"></span>
              <span>Resueltos / Cerrados</span>
            </div>
          </div>
        </div>

        <!-- Distribución de Carga por Prioridad y Áreas -->
        <div class="dashboard-tarjeta-contenedor">
          <div class="tarjeta-header-flex">
            <h2 class="tarjeta-titulo-con-icono">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <span>Nivel de Criticidad y Áreas de Demanda</span>
            </h2>
            <button
              type="button"
              style="background: none; border: none; font-size: 12px; font-weight: 700; color: var(--color-primario, #00bba6); cursor: pointer;"
              @click="irA('/admin/reportes')"
            >
              Ver análisis →
            </button>
          </div>

          <!-- Barras de Prioridad -->
          <div class="prioridad-barras-resumen">
            <div class="prioridad-fila">
              <span class="prioridad-etiqueta" style="color: #dc2626;">
                <span class="prioridad-indicador-punto" style="background-color: #dc2626;"></span>
                Crítica
              </span>
              <div class="prioridad-barra-fondo">
                <div
                  class="prioridad-barra-relleno"
                  :style="{
                    width: `${calcularPorcentajePrioridad(metricas.conteoPrioridades?.Critica)}%`,
                    backgroundColor: '#dc2626'
                  }"
                />
              </div>
              <span class="prioridad-conteo">{{ metricas.conteoPrioridades?.Critica || 0 }}</span>
            </div>

            <div class="prioridad-fila">
              <span class="prioridad-etiqueta" style="color: #ea580c;">
                <span class="prioridad-indicador-punto" style="background-color: #ea580c;"></span>
                Alta
              </span>
              <div class="prioridad-barra-fondo">
                <div
                  class="prioridad-barra-relleno"
                  :style="{
                    width: `${calcularPorcentajePrioridad(metricas.conteoPrioridades?.Alta)}%`,
                    backgroundColor: '#ea580c'
                  }"
                />
              </div>
              <span class="prioridad-conteo">{{ metricas.conteoPrioridades?.Alta || 0 }}</span>
            </div>

            <div class="prioridad-fila">
              <span class="prioridad-etiqueta" style="color: #00bba6;">
                <span class="prioridad-indicador-punto" style="background-color: #00bba6;"></span>
                Media
              </span>
              <div class="prioridad-barra-fondo">
                <div
                  class="prioridad-barra-relleno"
                  :style="{
                    width: `${calcularPorcentajePrioridad(metricas.conteoPrioridades?.Media)}%`,
                    backgroundColor: '#00bba6'
                  }"
                />
              </div>
              <span class="prioridad-conteo">{{ metricas.conteoPrioridades?.Media || 0 }}</span>
            </div>

            <div class="prioridad-fila">
              <span class="prioridad-etiqueta" style="color: #64748b;">
                <span class="prioridad-indicador-punto" style="background-color: #94a3b8;"></span>
                Baja
              </span>
              <div class="prioridad-barra-fondo">
                <div
                  class="prioridad-barra-relleno"
                  :style="{
                    width: `${calcularPorcentajePrioridad(metricas.conteoPrioridades?.Baja)}%`,
                    backgroundColor: '#94a3b8'
                  }"
                />
              </div>
              <span class="prioridad-conteo">{{ metricas.conteoPrioridades?.Baja || 0 }}</span>
            </div>
          </div>

          <!-- Top Categorías -->
          <div>
            <div style="font-size: 0.82rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.04em;">
              Categorías con mayor volumen
            </div>
            <div class="categorias-lista-compacta">
              <div
                v-for="cat in (metricas.categoriasIncidencias || []).slice(0, 3)"
                :key="cat.id"
                class="categoria-item-compacto"
              >
                <span class="categoria-nombre">{{ cat.nombre }}</span>
                <span class="categoria-badge">{{ cat.total }} tickets ({{ cat.porcentaje }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. FILA 2: OPERACIONES EN VIVO (COLA DE TRIAJE Y DESPACHO TÉCNICO) -->
      <section class="dashboard-grid-dos-columnas">
        <!-- Columna Izquierda: Cola de Atención Prioritaria -->
        <div class="dashboard-tarjeta-contenedor">
          <div class="tarjeta-header-flex">
            <h2 class="tarjeta-titulo-con-icono">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Cola de Atención Prioritaria</span>
            </h2>
            <div class="pestanas-triaje">
              <button
                type="button"
                class="btn-pestana-triaje"
                :class="{ activa: filtroTriaje === 'sin_asignar' }"
                @click="filtroTriaje = 'sin_asignar'"
              >
                Sin Asignar ({{ metricas.ticketsSinAsignar }})
              </button>
              <button
                type="button"
                class="btn-pestana-triaje"
                :class="{ activa: filtroTriaje === 'criticos' }"
                @click="filtroTriaje = 'criticos'"
              >
                Críticos / Alta
              </button>
              <button
                type="button"
                class="btn-pestana-triaje"
                :class="{ activa: filtroTriaje === 'todos' }"
                @click="filtroTriaje = 'todos'"
              >
                Todos en cola
              </button>
            </div>
          </div>

          <div v-if="ticketsTriajeFiltrados.length === 0" style="padding: 36px 16px; text-align: center; color: #64748b;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background-color: #ecfdf5; color: #059669; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <strong style="color: #0f172a; display: block;">¡Sin tickets pendientes en esta vista!</strong>
            <span style="font-size: 13px;">Todos los requerimientos están asignados o resueltos.</span>
          </div>

          <div v-else class="tabla-triaje-contenedor">
            <table class="tabla-triaje">
              <thead>
                <tr>
                  <th scope="col">Ticket</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Prioridad</th>
                  <th scope="col">Técnico</th>
                  <th scope="col" style="text-align: right;">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="t in ticketsTriajeFiltrados.slice(0, 5)"
                  :key="t.id_ticket"
                >
                  <td>
                    <div style="font-weight: 700; color: var(--color-primario, #00bba6);">
                      #{{ t.id_ticket }}
                    </div>
                    <div style="font-size: 12px; color: #1e293b; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="t.titulo">
                      {{ t.titulo }}
                    </div>
                  </td>
                  <td style="font-size: 12px; color: #475569;">
                    {{ t.cliente_nombre || 'Cliente' }}
                  </td>
                  <td>
                    <span :style="{ color: obtenerColorPrioridad(t.prioridad), fontWeight: 700, fontSize: '12px' }">
                      ● {{ t.prioridad }}
                    </span>
                  </td>
                  <td>
                    <span
                      v-if="t.tecnico_nombre"
                      style="font-size: 12px; font-weight: 600; color: var(--color-sidebar-fondo, #071e33); display: inline-flex; align-items: center; gap: 4px;"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                      {{ t.tecnico_nombre }}
                    </span>
                    <span
                      v-else
                      style="font-size: 11px; font-weight: 700; color: #b91c1c; background-color: #fef2f2; padding: 2px 8px; border-radius: 4px; border: 1px solid #fecaca; display: inline-flex; align-items: center; gap: 4px;"
                    >
                      <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #ef4444;"></span>
                      Sin Asignar
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button
                      v-if="!t.id_tecnico"
                      type="button"
                      style="padding: 4px 10px; border-radius: 6px; background-color: #ea580c; color: #ffffff; border: none; font-size: 11px; font-weight: 700; cursor: pointer;"
                      @click="irA(`/admin/tickets/${t.id_ticket}/asignar`)"
                    >
                      Asignar →
                    </button>
                    <button
                      v-else
                      type="button"
                      style="padding: 4px 10px; border-radius: 6px; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-size: 11px; font-weight: 600; cursor: pointer;"
                      @click="irA('/admin/tickets')"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 14px; text-align: right;">
            <button
              type="button"
              style="background: none; border: none; color: var(--color-primario, #00bba6); font-size: 13px; font-weight: 700; cursor: pointer;"
              @click="irA('/admin/tickets')"
            >
              Ver todos los tickets (Historial completo →)
            </button>
          </div>
        </div>

        <!-- Columna Derecha: Despacho y Monitoreo de Técnicos en Vivo -->
        <div class="dashboard-tarjeta-contenedor">
          <div class="tarjeta-header-flex">
            <h2 class="tarjeta-titulo-con-icono">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
                <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
              </svg>
              <span>Despacho de Técnicos en Tiempo Real</span>
            </h2>
            <button
              type="button"
              style="background: none; border: none; font-size: 12px; font-weight: 700; color: var(--color-primario, #00bba6); cursor: pointer;"
              @click="irA('/admin/usuarios')"
            >
              Gestionar equipo →
            </button>
          </div>

          <div class="tecnicos-despacho-lista">
            <div
              v-for="tec in metricas.tecnicosMonitoreo"
              :key="tec.id"
              class="tecnico-despacho-card"
            >
              <div class="tecnico-info-izq">
                <div class="tecnico-avatar">
                  {{ obtenerIniciales(tec.nombre) }}
                </div>
                <div class="tecnico-nombre-cargo">
                  <strong>{{ tec.nombre }}</strong>
                  <span>{{ tec.especialidad }}</span>
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 12px; font-weight: 700; margin-bottom: 2px;">
                  <span :class="['punto-estado-vivo', (tec.estado || '').toLowerCase()]"></span>
                  <span style="color: #334155; text-transform: capitalize;">
                    {{ (tec.estado || 'Disponible').replace(/_/g, ' ') }}
                  </span>
                </div>

                <div style="font-size: 11px; color: #64748b;">
                  <template v-if="tec.ticketActual && tec.ticketActual !== '-'">
                    En ticket:
                    <router-link
                      :to="`/admin/tickets/${obtenerIdTicketLimpio(tec.ticketActual)}/asignar`"
                      style="color: var(--color-primario, #00bba6); font-weight: 700; text-decoration: none;"
                    >
                      {{ tec.ticketActual }}
                    </router-link>
                  </template>
                  <template v-else>
                    <span style="color: #10b981; font-weight: 600;">Listo para asignar</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. FILA 3: FEED DE SATISFACCIÓN Y FEEDBACK RECIENTE -->
      <section class="dashboard-tarjeta-contenedor" style="margin-top: 8px;">
        <div class="tarjeta-header-flex">
          <div>
            <h2 class="tarjeta-titulo-con-icono">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Evaluaciones Recientes de Calidad de Servicio</span>
            </h2>
            <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">
              Feedback directo de los clientes tras el cierre de requerimientos técnicos.
            </p>
          </div>
          <button
            type="button"
            style="background: none; border: none; font-size: 13px; font-weight: 700; color: var(--color-primario, #00bba6); cursor: pointer;"
            @click="irA('/admin/calificaciones')"
          >
            Ver todas las calificaciones ({{ metricas.totalCalificaciones }}) →
          </button>
        </div>

        <div v-if="!metricas.calificacionesRecientes || metricas.calificacionesRecientes.length === 0" style="padding: 24px; text-align: center; color: #64748b;">
          Sin calificaciones registradas aún.
        </div>

        <div v-else class="calificaciones-grid-preview">
          <div
            v-for="cal in metricas.calificacionesRecientes"
            :key="cal.id_calificacion"
            class="tarjeta-calificacion-mini"
            :class="{ 'alerta-baja': cal.puntuacion <= 2 }"
          >
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 2px;">
                  <svg
                    v-for="n in 5"
                    :key="n"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    :fill="n <= cal.puntuacion ? '#f59e0b' : '#e2e8f0'"
                    :stroke="n <= cal.puntuacion ? '#f59e0b' : '#cbd5e1'"
                    stroke-width="1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <span style="font-size: 11px; color: #94a3b8;">
                  {{ cal.fecha_calificacion ? cal.fecha_calificacion.substring(0, 10) : '' }}
                </span>
              </div>

              <p style="margin: 0 0 10px; font-size: 13px; color: #334155; font-style: italic; line-height: 1.4;">
                "{{ cal.comentario || 'Atención técnica satisfactoria.' }}"
              </p>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; font-size: 11px; display: flex; justify-content: space-between; color: #64748b;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <strong>{{ cal.cliente_nombre || 'Cliente' }}</strong>
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                {{ cal.tecnico_nombre || 'Técnico' }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import { useAuth } from '../../context/useAuth';
import { obtenerMetricasDashboard } from '../../services/adminService';
import './DashboardAdmin.css';

const router = useRouter();
const { sesion } = useAuth();

const metricas = ref({
  ticketsTotales: 0,
  ticketsAbiertos: 0,
  ticketsEnProceso: 0,
  ticketsResueltos: 0,
  ticketsCerrados: 0,
  ticketsSinAsignar: 0,
  ticketsCriticos: 0,
  ticketsAltos: 0,
  tasaResolucion: 0,
  tecnicosActivos: 0,
  promedioCalificacion: '5.0',
  totalCalificaciones: 0,
  calificacionesRecientes: [],
  graficoSemanal: [],
  graficoMensual: [],
  conteoPrioridades: { Critica: 0, Alta: 0, Media: 0, Baja: 0 },
  categoriasIncidencias: [],
  tecnicosMonitoreo: [],
  ticketsUrgentes: []
});

const cargando = ref(true);
const comparativoSemanal = ref(true);
const filtroTriaje = ref('sin_asignar');
const ultimaActualizacion = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

const nombreUsuario = computed(() => sesion.value?.nombre || 'Administrador');

const cargarDatos = async () => {
  cargando.value = true;
  try {
    const datos = await obtenerMetricasDashboard();
    metricas.value = { ...metricas.value, ...datos };
    ultimaActualizacion.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    console.error('Error al cargar métricas del dashboard:', err);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarDatos();
});

const datosGrafico = computed(() => {
  return comparativoSemanal.value
    ? metricas.value.graficoSemanal || []
    : metricas.value.graficoMensual || [];
});

const ticketsTriajeFiltrados = computed(() => {
  const lista = metricas.value.ticketsUrgentes || [];
  if (filtroTriaje.value === 'sin_asignar') {
    return lista.filter((t) => !t.id_tecnico);
  }
  if (filtroTriaje.value === 'criticos') {
    return lista.filter((t) => t.prioridad === 'Critica' || t.prioridad === 'Alta');
  }
  return lista;
});

const calcularPorcentajePrioridad = (conteo) => {
  const total = metricas.value.ticketsTotales || 1;
  return Math.min(100, Math.round(((conteo || 0) / total) * 100));
};

const obtenerColorPrioridad = (prioridad) => {
  if (prioridad === 'Critica') return '#dc2626';
  if (prioridad === 'Alta') return '#ea580c';
  if (prioridad === 'Media') return '#00bba6';
  return '#64748b';
};

const obtenerIniciales = (nombre) => {
  if (!nombre) return 'TI';
  const partes = String(nombre).trim().split(' ');
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return partes[0].substring(0, 2).toUpperCase();
};

const obtenerIdTicketLimpio = (ticketActual) => {
  return ticketActual ? ticketActual.replace(/^TKT-/i, '') : '1';
};

const irA = (ruta) => {
  router.push(ruta);
};
</script>

