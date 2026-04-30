import simulator from './simulator/core/MemorySimulator.js';

const dom = {
  statusLine: document.getElementById('status-line'),
  statsGrid: document.getElementById('stats-grid'),
  algorithmSelect: document.getElementById('algorithm-select'),
  autoCompactCheckbox: document.getElementById('auto-compact-checkbox'),
  osSizeInput: document.getElementById('os-size-input'),
  processForm: document.getElementById('process-form'),
  configForm: document.getElementById('config-form'),
  processNameInput: document.getElementById('process-name-input'),
  processPidInput: document.getElementById('process-pid-input'),
  processArrivalInput: document.getElementById('process-arrival-input'),
  processLifetimeInput: document.getElementById('process-lifetime-input'),
  segmentTextInput: document.getElementById('segment-text-input'),
  segmentDataInput: document.getElementById('segment-data-input'),
  segmentBssInput: document.getElementById('segment-bss-input'),
  segmentHeapInput: document.getElementById('segment-heap-input'),
  segmentStackInput: document.getElementById('segment-stack-input'),
  loadDefaultsButton: document.getElementById('load-defaults-button'),
  stepButton: document.getElementById('step-button'),
  runAllButton: document.getElementById('run-all-button'),
  compactButton: document.getElementById('compact-button'),
  resetButton: document.getElementById('reset-button'),
  ganttTable: document.getElementById('gantt-table'),
  processTableBody: document.getElementById('process-table-body'),
  partitionTableBody: document.getElementById('partition-table-body'),
  memoryBar: document.getElementById('memory-bar'),
  summaryList: document.getElementById('summary-list'),
  memoryTickSelect: document.getElementById('memory-tick-select'),
  memoryPrevButton: document.getElementById('memory-prev-button'),
  memoryNextButton: document.getElementById('memory-next-button'),
  memoryRefreshButton: document.getElementById('memory-refresh-button'),
  memoryTickLabel: document.getElementById('memory-tick-label'),
};

let state = null;
let currentMemorySnapshot = 'current';

function formatBytes(bytes) {
  return `${bytes.toLocaleString('en-US')} B`;
}

function formatAddress(address) {
  return `${address.baseAddressHex} / ${address.baseAddress.toLocaleString('en-US')}`;
}

function setStatus(message) {
  dom.statusLine.textContent = message;
}

function buildStatCard(label, value) {
  const card = document.createElement('article');
  card.className = 'stat-card';
  card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  return card;
}


function renderMemoryTimeline(state) {
  const container = document.getElementById('memory-timeline');
  container.innerHTML = '';
  if (!state) return;
  const ticks = state.tick || 0;
  for (let displayTick = 1; displayTick <= ticks; displayTick++) {
    const snapshotTick = displayTick - 1;
    const snap = (state.memorySnapshots || []).find(s => s.tick === snapshotTick);
    const parts = snap ? snap.partitions : state.partitions || [];

    const box = document.createElement('div');
    box.className = 'mini-map';

    const header = document.createElement('div');
    header.className = 'mini-map-header';
    header.textContent = `t${displayTick}`;
    box.appendChild(header);

    const stack = document.createElement('div');
    stack.className = 'mini-map-stack';

    // render 16 rows (1 MiB each) as small blocks
    const rowSize = 1024 * 1024; // 1 MiB
    const rows = 16;
    for (let r = 0; r < rows; r++) {
      const base = r * rowSize;
      // find partition covering this base
      const p = parts.find(part => base >= part.baseAddress && base < (part.baseAddress + part.size));
      const row = document.createElement('div');
      row.className = 'mini-part';
      if (p) {
        if (p.isSystem) row.classList.add('pd-system');
        else if (p.pid) row.classList.add('pd-process');
        else row.classList.add('pd-free');
      } else {
        row.classList.add('pd-free');
      }
      stack.appendChild(row);
    }

    box.appendChild(stack);
    container.appendChild(box);
  }
}

function renderStats() {
  const memory = state.memory;
  dom.statsGrid.innerHTML = '';
  dom.statsGrid.append(
    buildStatCard('Tick', `t${state.tick}`),
    buildStatCard('S.O.', `${formatBytes(memory.osBytes)} / ${state.config.osSizeMiB.toFixed(2)} MiB`),
    buildStatCard('Ocupado', formatBytes(memory.occupiedBytes)),
    buildStatCard('Libre', formatBytes(memory.freeBytes)),
    buildStatCard('Algoritmo', `${state.config.algorithm}${state.config.autoCompact ? ' + compactación automática' : ''}`),
    buildStatCard('Mayor hueco', formatBytes(memory.largestHoleBytes))
  );
}

function getMemoryPartitionsForDisplay() {
  if (currentMemorySnapshot === 'current') {
    return state.partitions;
  }
  const displayTick = parseInt(currentMemorySnapshot, 10);
  if (!Number.isFinite(displayTick) || displayTick <= 0) return state.partitions;

  const snapshotTick = displayTick - 1; // user-facing ticks start at 1
  const snapshots = state.memorySnapshots || [];
  const snapshot = snapshots.find((s) => s.tick === snapshotTick) || (state.timeline || []).find((t) => t.tick === snapshotTick);

  if (snapshot && Array.isArray(snapshot.partitions)) {
    return snapshot.partitions;
  }

  // Fallback to current if snapshot not found
  return state.partitions;
}

function renderMemoryBar() {
  // Replace visual bar with a partition descriptor table of 16 fixed 1 MiB partitions
  dom.memoryBar.innerHTML = '';

  const TABLE_PARTITIONS = 16;
  const ONE_MIB = 1048576; // 1 MiB in bytes

  const table = document.createElement('table');
  table.className = 'partition-descriptor-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Partición</th><th>Proceso / PID</th><th>Tamaño</th><th>Dirección base</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const partsForDisplay = getMemoryPartitionsForDisplay();
  for (let i = 0; i < TABLE_PARTITIONS; i++) {
    const base = i * ONE_MIB;
    const size = ONE_MIB;

    // Determine occupant by checking current partitions (state.partitions)
    let occupantLabel = 'Libre';
    const sizeLabel = `${size.toLocaleString('en-US')} B`;
    const baseHex = `0x${base.toString(16).padStart(6, '0').toUpperCase()}`;

    if (Array.isArray(partsForDisplay)) {
      const covering = partsForDisplay.find((p) => p.baseAddress <= base && (p.baseAddress + (p.sizeBytes || p.size || 0)) > base);
      if (covering) {
        if (covering.kind === 'system' || covering.isSystem) {
          occupantLabel = 'S.O.';
        } else if (covering.kind === 'process' || covering.pid) {
          occupantLabel = `${covering.name ?? 'P'} (${covering.pid ?? '-'})`;
        } else {
          occupantLabel = 'Libre';
        }
      }
    }

    const row = document.createElement('tr');
    row.innerHTML = `<td>P${i}</td><td>${occupantLabel}</td><td>${sizeLabel}</td><td>${baseHex}</td>`;
    // add color class for row based on occupant
    if (occupantLabel === 'S.O.') {
      row.classList.add('pd-system');
    } else if (occupantLabel === 'Libre') {
      row.classList.add('pd-free');
    } else {
      row.classList.add('pd-process');
    }
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  dom.memoryBar.appendChild(table);
}

function renderProcessTable() {
  dom.processTableBody.innerHTML = '';

  const rows = [...state.processes].sort((left, right) => left.pid - right.pid);

  for (const process of rows) {
    const row = document.createElement('tr');
    const segmentSummary = process.segmentRows
      .map((segment) => `${segment.segment.toUpperCase()}: ${segment.sizeLabel}`)
      .join(' | ');

    row.innerHTML = `
      <td>${process.pid}</td>
      <td>${process.name}</td>
      <td>${process.status}</td>
      <td>t${process.arrivalTick}</td>
      <td>${process.lifetimeTicks}</td>
      <td>${formatBytes(process.totalSizeBytes)}</td>
      <td>${segmentSummary}</td>
    `;

    dom.processTableBody.appendChild(row);
  }
}

function renderPartitionTable() {
  dom.partitionTableBody.innerHTML = '';

  const partsForDisplay = getMemoryPartitionsForDisplay();

  for (const partition of partsForDisplay) {
    const row = document.createElement('tr');
    const statusLabel = partition.kind === 'system' ? 'S.O.' : partition.kind === 'process' ? 'Ocupado' : 'Libre';
    row.innerHTML = `
      <td>${partition.pid ?? '-'}</td>
      <td>${statusLabel}</td>
      <td>${partition.baseAddressHex} / ${partition.baseAddress.toLocaleString('en-US')}</td>
      <td>${partition.sizeLabel}</td>
      <td>${partition.name}</td>
    `;
    dom.partitionTableBody.appendChild(row);
  }
}

function renderGantt() {
  const processes = [...state.processes].sort((left, right) => left.pid - right.pid);
  const timeline = state.timeline;
  dom.ganttTable.innerHTML = '';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Proceso</th>';

  for (const entry of timeline) {
    const th = document.createElement('th');
    th.textContent = `t${entry.tick}`;
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);
  dom.ganttTable.appendChild(thead);

  const tbody = document.createElement('tbody');

  for (const process of processes) {
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.className = 'row-label';
    labelCell.textContent = `${process.name} (${process.pid})`;
    row.appendChild(labelCell);

    for (const entry of timeline) {
      const status = entry.eventsByPid[String(process.pid)] ?? entry.eventsByPid[process.pid] ?? null;
      const cell = document.createElement('td');
      cell.className = 'gantt-cell';

      if (status === 'loaded') {
        cell.classList.add('gantt-loaded');
        cell.textContent = 'X';
        cell.title = 'Cargado con éxito';
      } else if (status === 'rejected') {
        cell.classList.add('gantt-rejected');
        cell.textContent = '';
        cell.title = 'Rechazado';
      } else if (status === 'released') {
        cell.classList.add('gantt-released');
        cell.textContent = '•';
        cell.title = 'Liberado';
      } else {
        cell.classList.add('gantt-empty');
        cell.textContent = '';
        cell.title = 'Sin evento';
      }

      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }

  dom.ganttTable.appendChild(tbody);
}

function renderSummary() {
  dom.summaryList.innerHTML = '';
  const items = [
    ['Dirección inicial', state.config.osBaseHex],
    ['Dirección final', state.config.osEndHex],
    ['Particiones', String(state.partitions.length)],
    ['Procesos', String(state.processes.length)],
    ['Tiempo actual', `t${state.tick}`],
    ['Tamaño total', state.memory.totalLabel],
  ];

  for (const [label, value] of items) {
    const item = document.createElement('div');
    item.className = 'summary-item';
    item.innerHTML = `<span>${label}</span><span>${value}</span>`;
    dom.summaryList.appendChild(item);
  }
}

function syncFormsFromState() {
  dom.algorithmSelect.value = state.config.algorithm;
  dom.autoCompactCheckbox.checked = state.config.autoCompact;
  dom.osSizeInput.value = state.config.osSizeMiB.toString();
  dom.processPidInput.value = String(state.nextPid);
  dom.processArrivalInput.value = String(state.tick);
}

function updateMemorySnapshotControls() {
  dom.memoryTickSelect.innerHTML = '';
  const currentOption = document.createElement('option');
  currentOption.value = 'current';
  currentOption.textContent = `Actual (t${state.tick})`;
  dom.memoryTickSelect.appendChild(currentOption);

  // Populate user-facing sequential ticks from 1..state.tick (inclusive)
  for (let i = 1; i <= state.tick; i++) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `t${i}`;
    dom.memoryTickSelect.appendChild(option);
  }

  dom.memoryTickSelect.value = currentMemorySnapshot;
  updateMemoryTickLabel();
}

function updateMemoryTickLabel() {
  if (currentMemorySnapshot === 'current') {
    dom.memoryTickLabel.textContent = `Mostrando: t${state.tick} (actual)`;
  } else {
    dom.memoryTickLabel.textContent = `Mostrando: t${currentMemorySnapshot}`;
  }
}

function renderAll() {
  renderStats();
  updateMemorySnapshotControls();
  renderMemoryBar();
  renderProcessTable();
  renderPartitionTable();
  renderGantt();
  renderMemoryTimeline(state);
  renderSummary();
  syncFormsFromState();
}

async function refreshState(actionLabel = 'Estado actualizado.') {
  state = simulator.getState();
  renderAll();
  setStatus(actionLabel);
}

function readNumberInput(input) {
  return Number(input.value);
}

function readProcessPayload() {
  return {
    pid: readNumberInput(dom.processPidInput),
    name: dom.processNameInput.value.trim(),
    arrivalTick: readNumberInput(dom.processArrivalInput),
    lifetimeTicks: readNumberInput(dom.processLifetimeInput),
    segments: {
      text: readNumberInput(dom.segmentTextInput),
      data: readNumberInput(dom.segmentDataInput),
      bss: readNumberInput(dom.segmentBssInput),
      heap: readNumberInput(dom.segmentHeapInput),
      stack: readNumberInput(dom.segmentStackInput),
    },
  };
}

async function applyConfigAndReset() {
  const payload = {
    osSizeMiB: readNumberInput(dom.osSizeInput),
    algorithm: dom.algorithmSelect.value,
    autoCompact: dom.autoCompactCheckbox.checked,
  };

  simulator.reset(payload);
  state = simulator.getState();
  currentMemorySnapshot = 'current';
  renderAll();
  setStatus('Configuración aplicada y memoria reiniciada.');
}

async function createProcess() {
  const payload = readProcessPayload();
  
  try {
    const process = simulator.createProcess(payload);
    state = simulator.getState();
    currentMemorySnapshot = 'current';
    renderAll();
    setStatus(`Proceso ${process.name} (${process.pid}) creado.`);
  } catch (error) {
    throw error;
  }
}

async function runStep() {
  state = simulator.step();
  currentMemorySnapshot = 'current';
  renderAll();
  setStatus(`Se ejecutó el paso t${state.tick - 1}.`);
}

async function runAll() {
  setStatus('Ejecutando simulación completa...');
  // Safety cap to avoid infinite loops
  const MAX_TICKS = 5000;
  let iterations = 0;

  // Keep stepping until all processes are finished (no waiting, no resident)
  while (state.processes && state.processes.some(p => p.status !== 'finished')) {
    // stop if too many iterations
    if (iterations++ > MAX_TICKS) {
      setStatus('Interrumpido: excedido límite de ticks.');
      break;
    }

    state = simulator.step();
  }

  // Final refresh
  state = simulator.getState();
  currentMemorySnapshot = 'current';
  renderAll();
  setStatus(`Simulación completa. Tiempo final: t${state.tick - 1}.`);
}

async function compactNow() {
  simulator.compactMemory();
  state = simulator.getState();
  currentMemorySnapshot = 'current';
  renderAll();
  setStatus('Compactación ejecutada manualmente.');
}

async function loadDefaults() {
  state = simulator.loadDefaultProcesses();
  currentMemorySnapshot = 'current';
  renderAll();
  setStatus('Se cargaron los 5 procesos iniciales.');
}

async function resetEmpty() {
  const payload = {
    osSizeMiB: readNumberInput(dom.osSizeInput),
    algorithm: dom.algorithmSelect.value,
    autoCompact: dom.autoCompactCheckbox.checked,
  };

  simulator.reset(payload);
  state = simulator.getState();
  currentMemorySnapshot = 'current';
  renderAll();
  setStatus('Memoria reiniciada sin procesos cargados.');
}

function navigateMemorySnapshot(direction) {
  // available display ticks are 1..state.tick
  const availableTicks = [];
  for (let i = 1; i <= state.tick; i++) availableTicks.push(i);
  if (availableTicks.length === 0) return;

  let nextSnapshot;

  if (currentMemorySnapshot === 'current') {
    if (direction === 'prev') {
      nextSnapshot = availableTicks[availableTicks.length - 1];
    } else {
      return; // can't go next from current
    }
  } else {
    const currentTick = parseInt(currentMemorySnapshot, 10);
    const currentIndex = availableTicks.indexOf(currentTick);

    if (direction === 'prev' && currentIndex > 0) {
      nextSnapshot = availableTicks[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < availableTicks.length - 1) {
      nextSnapshot = availableTicks[currentIndex + 1];
    } else if (direction === 'next' && currentIndex === availableTicks.length - 1) {
      nextSnapshot = 'current';
    }
  }

  if (nextSnapshot !== undefined && String(nextSnapshot) !== String(currentMemorySnapshot)) {
    currentMemorySnapshot = nextSnapshot;
    updateMemorySnapshotControls();
    renderMemoryBar();
  }
}

function wireEvents() {
  dom.configForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      await applyConfigAndReset();
    } catch (error) {
      setStatus(`Error de configuración: ${error.message}`);
    }
  });

  dom.processForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      await createProcess();
    } catch (error) {
      setStatus(`No se pudo crear el proceso: ${error.message}`);
    }
  });

  dom.stepButton.addEventListener('click', async () => {
    try {
      await runStep();
    } catch (error) {
      setStatus(`No se pudo avanzar la simulación: ${error.message}`);
    }
  });

  dom.runAllButton.addEventListener('click', async () => {
    try {
      await runAll();
    } catch (error) {
      setStatus(`No se pudo ejecutar la simulación completa: ${error.message}`);
    }
  });

  dom.compactButton.addEventListener('click', async () => {
    try {
      await compactNow();
    } catch (error) {
      setStatus(`No se pudo compactar: ${error.message}`);
    }
  });

  dom.loadDefaultsButton.addEventListener('click', async () => {
    try {
      await loadDefaults();
    } catch (error) {
      setStatus(`No se pudieron cargar los procesos iniciales: ${error.message}`);
    }
  });

  dom.resetButton.addEventListener('click', async () => {
    try {
      await resetEmpty();
    } catch (error) {
      setStatus(`No se pudo reiniciar: ${error.message}`);
    }
  });

  dom.memoryTickSelect.addEventListener('change', (event) => {
    currentMemorySnapshot = event.target.value;
    updateMemorySnapshotControls();
    renderMemoryBar();
  });

  dom.memoryPrevButton.addEventListener('click', () => {
    navigateMemorySnapshot('prev');
  });

  dom.memoryNextButton.addEventListener('click', () => {
    navigateMemorySnapshot('next');
  });

  dom.memoryRefreshButton.addEventListener('click', () => {
    try {
      state = simulator.getState();
      currentMemorySnapshot = 'current';
      renderAll();
      setStatus('Snapshots actualizados.');
    } catch (error) {
      setStatus(`No se pudieron actualizar los snapshots: ${error.message}`);
    }
  });
}

async function init() {
  wireEvents();

  try {
    state = simulator.getState();
    renderAll();
    setStatus('Simulador listo. Carga los procesos iniciales o crea uno nuevo.');
  } catch (error) {
    setStatus(`Error al inicializar el simulador: ${error.message}`);
  }
}

init();
