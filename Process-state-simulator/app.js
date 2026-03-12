import OperativeSystem from './OperativeSystem.js';

const os = new OperativeSystem();

const createForm = document.getElementById('create-process-form');
const processIdInput = document.getElementById('process-id');
const processNameInput = document.getElementById('process-name');
const processSelect = document.getElementById('process-select');
const switchProcessBtn = document.getElementById('switch-process-btn');
const leftClickBtn = document.getElementById('left-click-btn');
const rightClickBtn = document.getElementById('right-click-btn');
const processList = document.getElementById('process-list');
const eventLog = document.getElementById('event-log');
const runningProcessLabel = document.getElementById('running-process');

function addLog(message) {
  const item = document.createElement('li');
  item.textContent = message;
  eventLog.prepend(item);
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
    item.textContent = `PID ${pcb.pid} | Nombre: ${pcb.process.name} | Estado: ${pcb.state}`;
    processList.appendChild(item);
  });
}

function renderRunningProcess() {
  if (!os.CPU.currentPCB) {
    runningProcessLabel.textContent = 'En ejecucion: ninguno';
    return;
  }

  const pcb = os.CPU.currentPCB;
  runningProcessLabel.textContent = `En ejecucion: PID ${pcb.pid} - ${pcb.process.name}`;
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
    addLog('Datos invalidos para crear proceso.');
    return;
  }

  const pidExists = os.processes.some((pcb) => pcb.pid === pid);
  if (pidExists) {
    addLog(`Ya existe un proceso con PID ${pid}.`);
    return;
  }

  os.createProcess(pid, name);
  addLog(`Proceso creado: PID ${pid}, nombre ${name}.`);

  createForm.reset();
  refreshUI();
});

switchProcessBtn.addEventListener('click', () => {
  const selectedPid = Number(processSelect.value);

  if (!selectedPid) {
    addLog('Selecciona un proceso para cambiar.');
    return;
  }

  os.changeProcess(selectedPid);
  addLog(`Cambio al proceso PID ${selectedPid}.`);
  refreshUI();
});

leftClickBtn.addEventListener('click', () => {
  addLog('Click izquierdo del raton simulado.');
});

rightClickBtn.addEventListener('click', () => {
  addLog('Click derecho del raton simulado.');
});

refreshUI();
