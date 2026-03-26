import OperatingSystem from '../OperatingSystem.js';
import PROCESS_STATES from '../PROCESS_STATES.js';
import FCFSScheduler from '../schedulers/FCFSScheduler.js';
import SJFScheduler from '../schedulers/SJFScheduler.js';
import SRTFScheduler from '../schedulers/SRTFScheduler.js';

const os = new OperatingSystem();

const createProcessForm = document.getElementById('create-process-form');
const blockingForm = document.getElementById('blocking-form');
const processSelect = document.getElementById('blocking-process');
const schedulerSelect = document.getElementById('scheduler-select');
const loadDefaultsButton = document.getElementById('load-defaults-button');
const runButton = document.getElementById('run-button');
const stepButton = document.getElementById('step-button');
const stopButton = document.getElementById('stop-button');
const tickCounter = document.getElementById('tick-counter');
const cpuStatus = document.getElementById('cpu-status');
const pcbTableBody = document.getElementById('pcb-table-body');
const timelineHead = document.getElementById('timeline-head');
const timelineBody = document.getElementById('timeline-body');
const logPanel = document.getElementById('log-panel');

const DEFAULT_TICK_MS = 700;
const MIN_EXEC_TIME = 5;
const MAX_EXEC_TIME = 30;
const DEFAULT_PROCESS_DEFINITIONS = [
  { id: 106, name: 'Proceso F', execution: 20, blocks: [[5, 10], [10, 7], [15, 3]], creationTick: 0 },
  { id: 105, name: 'Proceso E', execution: 11, blocks: [[4, 5], [10, 1]], creationTick: 1 },
  { id: 107, name: 'Proceso G', execution: 9, blocks: [[5, 15]], creationTick: 2 },
  { id: 103, name: 'Proceso C', execution: 17, blocks: [[1, 5], [10, 10], [15, 3]], creationTick: 3 },
  { id: 104, name: 'Proceso D', execution: 8, blocks: [[3, 7], [5, 4]], creationTick: 4 },
  { id: 101, name: 'Proceso A', execution: 15, blocks: [[3, 3], [10, 2]], creationTick: 5 },
  { id: 102, name: 'Proceso B', execution: 5, blocks: [[1, 6], [3, 1]], creationTick: 6 },
];
let tick = 0;
let intervalId = null;
const timelineHistory = [];
let defaultsLoaded = false;
let pendingDefaultProcesses = [];
let pendingManualProcesses = [];
let hasCreationInCurrentTick = false;

const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);
const schedulerFactories = {
  FCFS: () => new FCFSScheduler(),
  SJF: () => new SJFScheduler(),
  SRTF: () => new SRTFScheduler(),
};

function appendLog(message, type = 'info') {
  const stamp = `[t=${tick}]`;
  const row = `${stamp} ${String(message)}\n`;
  logPanel.textContent += row;
  logPanel.scrollTop = logPanel.scrollHeight;

  if (type === 'error') {
    logPanel.style.borderLeft = '3px solid #ef4444';
  }
}

console.log = (...args) => {
  originalLog(...args);
  appendLog(args.join(' '), 'info');
};

console.error = (...args) => {
  originalError(...args);
  appendLog(args.join(' '), 'error');
};

function allProcessesTerminated() {
  return os.allProcesses.length > 0 && os.allProcesses.every((pcb) => pcb.state === PROCESS_STATES.TERMINATED);
}

function refreshProcessSelect() {
  const previous = processSelect.value;
  processSelect.innerHTML = '<option value="">Selecciona un proceso</option>';

  for (const pcb of os.allProcesses) {
    const option = document.createElement('option');
    option.value = String(pcb.pid);
    option.textContent = `${pcb.pid} - ${pcb.process.name}`;
    processSelect.appendChild(option);
  }

  if (previous && [...processSelect.options].some((o) => o.value === previous)) {
    processSelect.value = previous;
  }
}

function formatBlockingEvents(events) {
  if (!events.length) {
    return '-';
  }

  return events.map((evt) => `${evt.startTime}/${evt.duration}`).join(', ');
}

function renderTable() {
  pcbTableBody.innerHTML = '';

  for (const pcb of os.allProcesses) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${pcb.pid}</td>
      <td>${pcb.process.name}</td>
      <td class="state-${pcb.state}">${pcb.state}</td>
      <td>${pcb.programCounter}</td>
      <td>${pcb.remainingExecutionTime}</td>
      <td>${pcb.remainingblockedTime}</td>
      <td>${formatBlockingEvents(pcb.process.blockingEvents)}</td>
    `;

    pcbTableBody.appendChild(row);
  }
}

function getStateCellClass(state) {
  if (state === PROCESS_STATES.NEW) {
    return 'timeline-state-created';
  }

  if (state === PROCESS_STATES.RUNNING) {
    return 'timeline-state-running';
  }

  if (state === PROCESS_STATES.BLOCKED) {
    return 'timeline-state-blocked';
  }

  if (state === PROCESS_STATES.READY) {
    return 'timeline-state-ready';
  }

  if (state === PROCESS_STATES.WAITING) {
    return 'timeline-state-neutral';
  }

  return 'timeline-state-neutral';
}

function captureTimelineSnapshot() {
  const statesByPid = {};
  for (const pcb of os.allProcesses) {
    statesByPid[pcb.pid] = pcb.state;
  }

  const currentTickEntry = timelineHistory.find((entry) => entry.tick === tick);
  if (currentTickEntry) {
    currentTickEntry.statesByPid = statesByPid;
    return;
  }

  timelineHistory.push({ tick, statesByPid });
}

function renderTimeline() {
  timelineHead.innerHTML = '';
  timelineBody.innerHTML = '';

  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Proceso</th>';

  for (const entry of timelineHistory) {
    const th = document.createElement('th');
    th.textContent = String(entry.tick);
    headerRow.appendChild(th);
  }

  timelineHead.appendChild(headerRow);

  for (const pcb of os.allProcesses) {
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.className = 'timeline-label';
    labelCell.textContent = `${pcb.process.name} (${pcb.pid})`;
    row.appendChild(labelCell);

    for (const entry of timelineHistory) {
      const state = entry.statesByPid[pcb.pid] || '';
      const td = document.createElement('td');
      td.className = `timeline-cell ${state ? getStateCellClass(state) : 'timeline-state-empty'}`;
      td.title = state || 'SIN ESTADO';
      td.setAttribute('aria-label', state || 'SIN ESTADO');
      td.textContent = '';
      row.appendChild(td);
    }

    timelineBody.appendChild(row);
  }
}

function renderStatus() {
  tickCounter.textContent = String(tick);
  cpuStatus.textContent = os.CPU.currentPCB
    ? `${os.CPU.currentPCB.process.name} (PID ${os.CPU.currentPCB.pid})`
    : 'Idle';

  renderTable();
  renderTimeline();
  refreshProcessSelect();
}

function setRunningState(isRunning) {
  runButton.disabled = isRunning;
  stepButton.disabled = isRunning;
  stopButton.disabled = !isRunning;
}

function performTick() {
  createScheduledProcessForCurrentTick();
  // Snapshot current instant so creations are visible in this tick.
  captureTimelineSnapshot();
  os.tick();
  tick += 1;
  hasCreationInCurrentTick = false;
  captureTimelineSnapshot();
  renderStatus();

  if (allProcessesTerminated()) {
    appendLog('Simulacion finalizada: todos los procesos terminaron.');
    stopSimulation();
  }
}

function startSimulation() {
  if (intervalId || os.allProcesses.length === 0) {
    if (os.allProcesses.length === 0) {
      appendLog('No hay procesos. Crea uno manualmente o pulsa "Cargar procesos default".', 'error');
    }
    return;
  }

  appendLog(`Iniciando simulacion automatica (${DEFAULT_TICK_MS}ms por tick).`);
  setRunningState(true);
  intervalId = window.setInterval(performTick, DEFAULT_TICK_MS);
}

function stopSimulation() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }

  setRunningState(false);
}

function seedDefaultProcesses() {
  pendingDefaultProcesses = [...DEFAULT_PROCESS_DEFINITIONS]
    .sort((a, b) => a.creationTick - b.creationTick);

  appendLog('Carga por defecto preparada. Los procesos se crearan segun el avance de ticks.');
}

function createDefaultProcess(processDef) {
  os.createProcess(processDef.id, processDef.name, processDef.execution);
  const pcb = os.allProcesses.find((item) => item.pid === processDef.id);
  if (pcb) {
    for (const [start, duration] of processDef.blocks) {
      pcb.process.addBlockingEvent(start, duration);
    }
  }

  appendLog(`Creado ${processDef.name} (ejecucion ${processDef.execution}) en t=${tick}.`);
  hasCreationInCurrentTick = true;
}

function createManualProcess(processDef) {
  os.createProcess(processDef.id, processDef.name, processDef.execution);
  appendLog(`Creado ${processDef.name} manualmente en t=${tick}.`);
  hasCreationInCurrentTick = true;
}

function createScheduledProcessForCurrentTick() {
  if (hasCreationInCurrentTick) {
    return;
  }

  if (pendingManualProcesses.length > 0) {
    const sortedManuals = [...pendingManualProcesses].sort((a, b) => a.creationTick - b.creationTick);
    const nextManual = sortedManuals.find((item) => item.creationTick <= tick);
    if (nextManual) {
      pendingManualProcesses = pendingManualProcesses.filter((item) => item.id !== nextManual.id);
      createManualProcess(nextManual);
      return;
    }
  }

  if (!pendingDefaultProcesses.length) {
    return;
  }

  const sortedDefaults = [...pendingDefaultProcesses].sort((a, b) => a.creationTick - b.creationTick);
  const nextDefault = sortedDefaults.find((item) => item.creationTick <= tick);
  if (nextDefault) {
    pendingDefaultProcesses = pendingDefaultProcesses.filter((item) => item.id !== nextDefault.id);
    createDefaultProcess(nextDefault);
  }
}

function ensureDefaultProcessesLoaded() {
  if (defaultsLoaded) {
    appendLog('Los procesos por defecto ya fueron cargados.');
    return;
  }

  seedDefaultProcesses();
  createScheduledProcessForCurrentTick();
  defaultsLoaded = true;
  captureTimelineSnapshot();
  renderStatus();
}

function applyScheduler(algorithm, shouldLog = true) {
  const factory = schedulerFactories[algorithm];
  if (!factory) {
    appendLog(`Algoritmo no soportado: ${algorithm}.`, 'error');
    return;
  }

  os.setScheduler(factory());
  if (shouldLog) {
    appendLog(`Algoritmo de planificacion cambiado a ${algorithm}.`);
  }
}

createProcessForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const id = Number(document.getElementById('process-id').value);
  const name = document.getElementById('process-name').value.trim();
  const executionTime = Number(document.getElementById('process-time').value);

  if (!name) {
    appendLog('No se pudo crear el proceso: nombre vacio.', 'error');
    return;
  }

  if (executionTime < MIN_EXEC_TIME || executionTime > MAX_EXEC_TIME) {
    appendLog(`No se pudo crear el proceso: tiempo de ejecucion debe estar entre ${MIN_EXEC_TIME} y ${MAX_EXEC_TIME}.`, 'error');
    return;
  }

  const duplicate = os.allProcesses.some((pcb) => pcb.pid === id);
  if (duplicate) {
    appendLog(`No se pudo crear el proceso: PID ${id} ya existe.`, 'error');
    return;
  }

  if (hasCreationInCurrentTick) {
    const deferredManual = {
      id,
      name,
      execution: executionTime,
      creationTick: tick + 1,
    };
    pendingManualProcesses.push(deferredManual);
    appendLog(`Se aplazo la creacion manual de ${name} a t=${deferredManual.creationTick} para mantener 1 creacion por tick.`);
    createProcessForm.reset();
    renderStatus();
    return;
  }

  createManualProcess({ id, name, execution: executionTime });
  createProcessForm.reset();

  if (!intervalId) {
    performTick();
  } else {
    renderStatus();
  }
});

blockingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const selectedPid = Number(processSelect.value);
  const start = Number(document.getElementById('blocking-start').value);
  const duration = Number(document.getElementById('blocking-duration').value);
  const pcb = os.allProcesses.find((item) => item.pid === selectedPid);

  if (!pcb) {
    appendLog('Selecciona un proceso valido para agregar bloqueo.', 'error');
    return;
  }

  pcb.process.addBlockingEvent(start, duration);
  appendLog(`Evento de bloqueo agregado a PID ${pcb.pid}: inicio=${start}, duracion=${duration}.`);
  blockingForm.reset();
  renderStatus();
});

runButton.addEventListener('click', startSimulation);
stopButton.addEventListener('click', stopSimulation);
stepButton.addEventListener('click', () => {
  if (intervalId || allProcessesTerminated() || os.allProcesses.length === 0) {
    if (!intervalId && os.allProcesses.length === 0) {
      appendLog('No hay procesos. Crea uno manualmente o pulsa "Cargar procesos default".', 'error');
    }
    return;
  }

  performTick();
});

loadDefaultsButton.addEventListener('click', () => {
  ensureDefaultProcessesLoaded();
});

schedulerSelect.addEventListener('change', (event) => {
  applyScheduler(event.target.value);
});

setRunningState(false);
applyScheduler(schedulerSelect.value, false);
captureTimelineSnapshot();
renderStatus();
appendLog('Interfaz lista. Crea procesos y empieza la simulacion.');
