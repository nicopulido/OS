import initCPUSimulation from '../cpuSimulation.js';

function CPUSimView({ adapter, navigate }) {
  const container = document.createElement('section');
  container.className = 'view';
  let cleanup = () => {};
  let isActive = true;

  container.innerHTML = `
    <section class="panel cpu-nav-panel">
      <button id="cpu-back-button" type="button" class="back-button">Volver</button>
      <p><strong>Modo actual:</strong> ${adapter.getMode()}</p>
    </section>

    <header class="hero">
      <h1>Simulador de Procesos por Ticks</h1>
      <p>Crea procesos, agrega eventos de bloqueo y ejecuta el sistema paso a paso.</p>
    </header>

    <section class="panel controls">
      <h2>Crear Proceso</h2>
      <form id="create-process-form">
        <label>
          PID
          <input id="process-id" type="number" min="1" required />
        </label>
        <label>
          Nombre
          <input id="process-name" type="text" required />
        </label>
        <label>
          Tiempo de ejecucion
          <input id="process-time" type="number" min="5" max="30" value="10" required />
        </label>
        <button type="submit">Crear proceso</button>
      </form>
    </section>

    <section class="panel controls">
      <h2>Agregar Bloqueo</h2>
      <form id="blocking-form">
        <label>
          Proceso
          <select id="blocking-process" required>
            <option value="">Selecciona un proceso</option>
          </select>
        </label>
        <label>
          Inicio del bloqueo (tick)
          <input id="blocking-start" type="number" min="0" required />
        </label>
        <label>
          Duracion del bloqueo
          <input id="blocking-duration" type="number" min="1" required />
        </label>
        <button type="submit">Agregar evento de bloqueo</button>
      </form>
    </section>

    <section class="panel controls actions">
      <h2>Ejecucion</h2>
      <label>
        Algoritmo de planificacion
        <select id="scheduler-select">
          <option value="FCFS">FCFS</option>
          <option value="SJF">SJF</option>
          <option value="SRTF">SRTF</option>
        </select>
      </label>
      <div class="buttons">
        <button id="load-defaults-button" type="button">Cargar procesos default</button>
        <button id="run-button" type="button">Iniciar simulacion</button>
        <button id="step-button" type="button">Ejecutar 1 tick</button>
        <button id="stop-button" type="button">Detener</button>
      </div>
      <p><strong>Tick actual:</strong> <span id="tick-counter">0</span></p>
      <p><strong>Tiempo total simulacion:</strong> <span id="simulation-uptime">0</span></p>
      <p><strong>CPU actual:</strong> <span id="cpu-status">Idle</span></p>
    </section>

    <section class="panel full-width">
      <h2>Tabla de PCB</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>PC</th>
              <th>Restante</th>
              <th>Bloqueado restante</th>
              <th>Eventos de bloqueo</th>
            </tr>
          </thead>
          <tbody id="pcb-table-body"></tbody>
        </table>
      </div>
    </section>

    <section class="panel full-width">
      <h2>Tabla de metricas</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>PID</th>
              <th>Nombre</th>
              <th>Tiempo ejecucion</th>
              <th>Tiempo en ready</th>
              <th>Tiempo total bloqueado</th>
              <th>Instante inicio</th>
              <th>Instante fin</th>
              <th>Retorno</th>
              <th>Tiempo respuesta</th>
              <th>Tiempo perdido</th>
              <th>Penalidad</th>
              <th>% uso CPU</th>
            </tr>
          </thead>
          <tbody id="metrics-table-body"></tbody>
        </table>
      </div>
    </section>

    <section class="panel full-width">
      <h2>Linea de tiempo de procesos</h2>
      <div class="timeline-wrapper">
        <table class="timeline-table">
          <thead id="timeline-head"></thead>
          <tbody id="timeline-body"></tbody>
        </table>
      </div>
    </section>

    <section class="panel full-width">
      <h2>Log del simulador</h2>
      <pre id="log-panel" class="log-panel"></pre>
    </section>
  `;

  // Initialize after the view is mounted in #app.
  const initTimer = window.setTimeout(() => {
    if (!isActive) {
      return;
    }
    cleanup = initCPUSimulation();
  }, 0);

  const backButton = container.querySelector('#cpu-back-button');
  backButton.addEventListener('click', () => {
    isActive = false;
    window.clearTimeout(initTimer);
    cleanup();
    navigate('HOME');
  });

  return container;
}

export default CPUSimView;
