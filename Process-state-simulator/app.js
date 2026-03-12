import OperativeSystem from './OperativeSystem.js';

const os = new OperativeSystem();

const createForm = document.getElementById('create-process-form');
const processIdInput = document.getElementById('process-id');
const processNameInput = document.getElementById('process-name');
const processSelect = document.getElementById('process-select');
const switchProcessBtn = document.getElementById('switch-process-btn');
const terminateProcessBtn = document.getElementById('terminate-process-btn');
const tickSpeedSelect = document.getElementById('tick-speed');
const tick1Btn = document.getElementById('tick-1-btn');
const tick10Btn = document.getElementById('tick-10-btn');
const tick1000Btn = document.getElementById('tick-1000-btn');
const tickStatusLabel = document.getElementById('tick-status');
const leftClickBtn = document.getElementById('left-click-btn');
const rightClickBtn = document.getElementById('right-click-btn');
const processList = document.getElementById('process-list');
const consoleOutput = document.getElementById('console-output');
const runningProcessLabel = document.getElementById('running-process');
const controls = document.querySelectorAll('button, input, select');

let isTicking = false;

function formatConsoleArg(arg) {
  if (typeof arg === 'string') {
    return arg;
  }

  try {
    return JSON.stringify(arg);
  } catch (_error) {
    return String(arg);
  }
}

function setupConsoleMirror() {
  const originalLog = console.log.bind(console);

  console.log = (...args) => {
    originalLog(...args);

    const line = args.map(formatConsoleArg).join(' ');
    const currentText = consoleOutput.textContent.trim();
    const lines = currentText ? currentText.split('\n') : [];
    lines.push(line);

    if (lines.length > 200) {
      lines.splice(0, lines.length - 200);
    }

    consoleOutput.textContent = lines.join('\n');
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  };
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setControlsDisabled(disabled) {
  controls.forEach((control) => {
    control.disabled = disabled;
  });
}

function getTickDelayMs() {
  const speed = Number(tickSpeedSelect.value);
  return 1000 / speed;
}

async function runTicks(totalTicks) {
  if (isTicking) {
    return;
  }

  if (!os.CPU.currentPCB) {
    tickStatusLabel.textContent = 'No hay proceso en CPU para avanzar ticks.';
    return;
  }

  isTicking = true;
  setControlsDisabled(true);
  tickStatusLabel.textContent = `Ejecutando ${totalTicks} ticks...`;

  try {
    const tickDelayMs = getTickDelayMs();

    for (let tick = 1; tick <= totalTicks; tick += 1) {
      tickStatusLabel.textContent = `Tick ${tick}/${totalTicks} en progreso...`;
      await wait(tickDelayMs);
      os.CPU.executeSimulation();
      refreshUI();
    }

  } finally {
    isTicking = false;
    setControlsDisabled(false);
    tickStatusLabel.textContent = 'Ticks inactivos';
    refreshUI();
  }
}

function renderProcessOptions() {
  processSelect.innerHTML = '';

  if (os.processes.length === 0) {
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Sin procesos';
    processSelect.appendChild(emptyOption);
    return;
  }

  os.processes.forEach((pcb) => {
    const option = document.createElement('option');
    option.value = String(pcb.pid);
    option.textContent = `PID ${pcb.pid} - ${pcb.process.name}`;
    processSelect.appendChild(option);
  });
}

function renderProcessList() {
  processList.innerHTML = '';

  if (os.processes.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No hay procesos creados.';
    processList.appendChild(empty);
    return;
  }

  os.processes.forEach((pcb) => {
    const item = document.createElement('li');
    item.textContent = `PID ${pcb.pid} | Nombre: ${pcb.process.name} | Estado: ${pcb.state} | PC: ${pcb.programCounter}`;
    processList.appendChild(item);
  });
}

function renderRunningProcess() {
  if (!os.CPU.currentPCB) {
    runningProcessLabel.textContent = 'En ejecucion: ninguno';
    return;
  }

  const pcb = os.CPU.currentPCB;
  runningProcessLabel.textContent = `En ejecucion: PID ${pcb.pid} - ${pcb.process.name} | PC: ${pcb.programCounter}`;
}

function refreshUI() {
  renderProcessOptions();
  renderProcessList();
  renderRunningProcess();
}

createForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const pid = Number(processIdInput.value);
  const name = processNameInput.value.trim();

  if (!Number.isInteger(pid) || pid <= 0 || !name) {
    return;
  }

  const pidExists = os.processes.some((pcb) => pcb.pid === pid);
  if (pidExists) {
    return;
  }

  os.createProcess(pid, name);

  createForm.reset();
  refreshUI();
});

switchProcessBtn.addEventListener('click', () => {
  const selectedPid = Number(processSelect.value);

  if (!selectedPid) {
    return;
  }

  os.changeProcess(selectedPid);
  refreshUI();
});

terminateProcessBtn.addEventListener('click', () => {
  os.terminateProcess();
  refreshUI();
});

leftClickBtn.addEventListener('click', () => {
  tickStatusLabel.textContent = 'Raton: boton izquierdo presionado.';
});

rightClickBtn.addEventListener('click', () => {
  tickStatusLabel.textContent = 'Raton: boton derecho presionado.';
});

tick1Btn.addEventListener('click', () => {
  runTicks(1);
});

tick10Btn.addEventListener('click', () => {
  runTicks(10);
});

tick1000Btn.addEventListener('click', () => {
  runTicks(1000);
});

setupConsoleMirror();
refreshUI();
