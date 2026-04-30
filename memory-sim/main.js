/**
 * main.js
 * UI rendering and event handling for the memory simulator.
 * All DOM manipulation lives here — memoryManager.js is DOM-free.
 *
 * Color scheme:
 *   OS     → yellow
 *   Loaded → green
 *   Free   → gray
 *   Failed → red (on process cards only)
 */

import { MemoryManager } from './memoryManager.js';

const manager = new MemoryManager();
let autoInterval = null;

/* ================================================================
   DOM references
   ================================================================ */
const $ = id => document.getElementById(id);

const $partitionMode = $('partitionMode');
const $algorithm     = $('algorithm');
const $compactionWrap= $('compactionWrap');
const $compaction    = $('compactionToggle');
const $osSize        = $('osSize');
const $stepBtn       = $('stepBtn');
const $autoBtn       = $('autoBtn');
const $resetBtn      = $('resetBtn');
const $eventLog      = $('eventLog');
const $memoryBar     = $('memoryBar');
const $memTooltip    = $('memTooltip');
const $metrics       = $('metrics');
const $processCards  = $('processCards');
const $partTableWrap = $('partitionTableWrap');
const $stepBadge     = $('stepBadge');
const $memoryHistory = $('memoryHistory');

// Add-process form
const $procName     = $('procName');
const $procText     = $('procText');
const $procData     = $('procData');
const $procBss      = $('procBss');
const $procHeap     = $('procHeap');
const $procStack    = $('procStack');
const $procBurst    = $('procBurst');
const $procInterval = $('procInterval');
const $addProcBtn   = $('addProcBtn');

/* ================================================================
   Helpers
   ================================================================ */
const KB = 1024, MB = 1024 * KB;

function fmtBytes(b) {
  if (b >= MB) return (b / MB).toFixed(2) + ' MiB';
  if (b >= KB) return (b / KB).toFixed(1) + ' KiB';
  return b + ' B';
}

function fmtHex(addr) {
  return '0x' + addr.toString(16).toUpperCase().padStart(6, '0');
}

function fmtDec(addr) {
  return addr.toLocaleString();
}

/** Combined hex + decimal for display in blocks */
function fmtAddr(addr) {
  return `${fmtHex(addr)} (${fmtDec(addr)})`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/* ================================================================
   Rendering
   ================================================================ */

function render() {
  const state = manager.getState();
  renderStepBadge(state);
  renderMemoryBar(state);
  renderMetrics(state);
  renderProcessCards(state);
  renderPartitionTable(state);
  renderMemoryHistory(state);
}

/* ---- Step badge ---- */
function renderStepBadge(state) {
  $stepBadge.textContent = `Paso ${state.currentStep}`;
}

/* ---- Memory Bar (vertical, BOTTOM TO TOP, with hex+decimal addresses) ---- */
function renderMemoryBar(state) {
  const total = state.metrics.totalBytes;
  $memoryBar.innerHTML = '';

  for (const p of state.partitions) {
    const pct = (p.size / total) * 100;
    const div = document.createElement('div');
    div.className = 'mem-block';

    // Address label: hex + decimal
    const addrText = `${fmtHex(p.startAddress)} | ${fmtDec(p.startAddress)}`;
    const addrSpan = `<span class="block-addr">${addrText}</span>`;
    let labelText = '';

    if (p.isOS) {
      div.classList.add('os-block');
      labelText = 'SO';
    } else if (p.isFree) {
      div.classList.add('free-block');
      labelText = pct > 4 ? 'Libre' : '';
    } else {
      // Process block — ALL loaded processes are green
      div.classList.add('proc-block');
      labelText = p.process.name;
    }

    div.innerHTML = `${addrSpan}<span class="block-label">${labelText}</span>`;
    div.style.flex = `0 0 ${pct}%`;

    div.addEventListener('mouseenter', (e) => showTooltip(e, p));
    div.addEventListener('mouseleave', hideTooltip);

    $memoryBar.appendChild(div);
  }
}

function showTooltip(e, partition) {
  const endAddr = partition.startAddress + partition.size - 1;
  let label = partition.isOS ? 'Sistema Operativo'
    : partition.isFree ? 'Libre'
    : `${partition.process.name} (PID ${partition.process.pid})`;

  // Internal fragmentation for occupied partitions
  let fragLine = '';
  if (!partition.isFree && !partition.isOS && partition.process) {
    const frag = partition.size - partition.process.totalSize;
    if (frag > 0) {
      fragLine = `<br/>Frag. interna: ${fmtBytes(frag)}`;
    }
  }

  $memTooltip.innerHTML = `
    <strong>${label}</strong><br/>
    Inicio: ${fmtAddr(partition.startAddress)}<br/>
    Fin: ${fmtAddr(endAddr)}<br/>
    Tamaño: ${fmtBytes(partition.size)}${fragLine}
  `;

  const rect = e.target.getBoundingClientRect();
  const wrapRect = $memoryBar.parentElement.getBoundingClientRect();
  $memTooltip.style.top = (rect.top - wrapRect.top) + 'px';
  $memTooltip.classList.add('visible');
}

function hideTooltip() {
  $memTooltip.classList.remove('visible');
}

/* ---- Metrics (with internal fragmentation) ---- */
function renderMetrics(state) {
  const m = state.metrics;
  let html = `
    <div class="metric-row"><span>Total:</span><span class="mono">${fmtBytes(m.totalBytes)}</span></div>
    <div class="metric-row"><span>Usada:</span><span class="mono">${fmtBytes(m.usedBytes)}</span></div>
    <div class="metric-row"><span>Libre:</span><span class="mono">${fmtBytes(m.freeBytes)}</span></div>
  `;
  if (m.externalFragmentation) {
    html += `<div class="metric-row frag-warn">⚠ Frag. externa: ${m.freeBlockCount} bloques</div>`;
  }
  if (m.internalFragBytes > 0) {
    html += `<div class="metric-row frag-internal">↳ Frag. interna: ${fmtBytes(m.internalFragBytes)}</div>`;
  }
  $metrics.innerHTML = html;
}

/* ---- Process Cards ---- */
function renderProcessCards(state) {
  $processCards.innerHTML = '';

  // Track which processes just failed this step (for red card highlighting)
  const lastTimeline = state.timeline.length > 0
    ? state.timeline[state.timeline.length - 1]
    : null;

  for (const proc of state.processes) {
    const isLoaded = proc.state === 'loaded';
    const justFailed = lastTimeline && lastTimeline.states[proc.pid] === 'failed';

    const card = document.createElement('div');

    // Card color by state: green=loaded, red=has failures, gray=waiting
    let cardState = 'state-card-waiting';
    if (isLoaded) {
      cardState = 'state-card-loaded';
    } else if (proc.failures > 0) {
      cardState = 'state-card-failed';
    }
    card.className = `proc-card ${cardState}`;

    const progressPct = isLoaded
      ? ((proc.burst - proc.burstRemaining) / proc.burst) * 100
      : proc.interval > 0
        ? ((proc.interval - proc.intervalRemaining) / proc.interval) * 100
        : 0;

    const progressColor = isLoaded ? '#22c55e' : proc.failures > 0 ? '#fca5a5' : '#d1d5db';
    const progressLabel = isLoaded
      ? `Burst: ${proc.burst - proc.burstRemaining}/${proc.burst}`
      : `Espera: ${proc.interval - proc.intervalRemaining}/${proc.interval}`;

    card.innerHTML = `
      <div class="card-header">
        <span class="proc-name">
          <span class="color-dot" style="background:${proc.color}"></span>
          ${esc(proc.name)}
        </span>
        <span class="pid-badge">PID ${proc.pid}</span>
      </div>
      <div class="card-info">
        <span>${fmtBytes(proc.totalSize)}</span>
        <span class="state-badge ${isLoaded ? 'state-loaded' : 'state-waiting'}">
          ${isLoaded ? 'En memoria' : 'Esperando'}
        </span>
      </div>
      <div class="progress-wrap">
        <div class="progress-fill" style="width:${progressPct}%;background:${progressColor}"></div>
      </div>
      <div class="progress-label">
        <span>${progressLabel}</span>
        <span class="${proc.failures > 0 ? 'failures' : ''}">Fallos: ${proc.failures}</span>
      </div>
    `;

    $processCards.appendChild(card);
  }
}

/* ---- Memory History (horizontal bar per step) ---- */
function renderMemoryHistory(state) {
  const snapshots = state.memorySnapshots;
  if (snapshots.length === 0) {
    $memoryHistory.innerHTML = '<p style="color:#999;font-size:.75rem;">Ejecuta pasos para ver el historial.</p>';
    return;
  }

  const total = state.metrics.totalBytes;
  const recent = snapshots.slice(-30);

  let html = '';
  for (const snap of recent) {
    html += `<div class="history-entry">`;
    html += `<span class="history-step-label">${snap.step}</span>`;
    html += `<div class="history-bar">`;

    for (const p of snap.partitions) {
      const pct = (p.size / total) * 100;
      let cls = '';
      let label = '';

      if (p.isOS) {
        cls = 'os';
        label = pct > 5 ? 'SO' : '';
      } else if (p.isFree) {
        cls = 'free';
      } else {
        cls = 'proc';
        label = pct > 6 ? p.processName : '';
      }

      html += `<div class="history-block ${cls}" style="width:${pct}%;" title="${p.isOS ? 'SO' : p.isFree ? 'Libre' : p.processName} — ${fmtHex(p.startAddress)} — ${fmtBytes(p.size)}">${label}</div>`;
    }

    html += `</div></div>`;
  }

  $memoryHistory.innerHTML = html;
  $memoryHistory.scrollTop = $memoryHistory.scrollHeight;
}

/* ---- Partition Table (with internal fragmentation column) ---- */
function renderPartitionTable(state) {
  let html = `<table class="part-table">
    <thead><tr>
      <th>#</th><th>Inicio (hex)</th><th>Inicio (dec)</th><th>Tamaño</th><th>Estado</th><th>Proceso</th><th>Frag. Int.</th>
    </tr></thead><tbody>`;

  state.partitions.forEach((p, i) => {
    const statusBadge = p.isOS
      ? '<span class="badge badge-os">SO</span>'
      : p.isFree
        ? '<span class="badge badge-free">Libre</span>'
        : `<span class="badge badge-occupied">${esc(p.process.name)}</span>`;

    const procName = p.isOS ? 'Kernel' : p.isFree ? '—' : esc(p.process.name);

    let fragCell = '<td class="frag-cell zero">—</td>';
    if (!p.isFree && !p.isOS && p.process) {
      const frag = p.size - p.process.totalSize;
      if (frag > 0) {
        fragCell = `<td class="frag-cell">${fmtBytes(frag)}</td>`;
      } else {
        fragCell = '<td class="frag-cell zero">0</td>';
      }
    }

    html += `<tr>
      <td>${i}</td>
      <td>${fmtHex(p.startAddress)}</td>
      <td>${fmtDec(p.startAddress)}</td>
      <td>${fmtBytes(p.size)}</td>
      <td>${statusBadge}</td>
      <td>${procName}</td>
      ${fragCell}
    </tr>`;
  });

  html += '</tbody></table>';
  $partTableWrap.innerHTML = html;
}

/* ---- Event log ---- */
function appendLog(events) {
  for (const ev of events) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.style.color = ev.color;
    div.textContent = ev.message;
    $eventLog.appendChild(div);
  }
  while ($eventLog.childElementCount > 100) {
    $eventLog.removeChild($eventLog.firstChild);
  }
  $eventLog.scrollTop = $eventLog.scrollHeight;
}

/* ================================================================
   Event Handlers
   ================================================================ */

function doReset() {
  stopAuto();
  const osMiB = parseInt($osSize.value, 10) || 1;
  const mode = $partitionMode.value;
  const algo = $algorithm.value;
  const compact = $compaction.checked;
  manager.reset(Math.max(1, Math.min(6, osMiB)), mode, algo, compact);
  $eventLog.innerHTML = '';
  render();
}

function doStep() {
  const events = manager.step();
  appendLog(events);
  render();
}

function toggleAuto() {
  if (autoInterval) {
    stopAuto();
  } else {
    startAuto();
  }
}

function startAuto() {
  autoInterval = setInterval(doStep, 600);
  $autoBtn.textContent = '⏸ Pausa';
  $autoBtn.classList.add('running');
}

function stopAuto() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
  $autoBtn.textContent = '⏵ Auto';
  $autoBtn.classList.remove('running');
}

function updateCompactionVisibility() {
  if ($partitionMode.value === 'dynamic') {
    $compactionWrap.classList.remove('hidden');
  } else {
    $compactionWrap.classList.add('hidden');
    $compaction.checked = false;
  }
}

/* ---- Add Process handler ---- */
function handleAddProcess() {
  const name = $procName.value.trim();
  if (!name) return;

  const opts = {
    name,
    text:     parseInt($procText.value, 10) || 64,
    data:     parseInt($procData.value, 10) || 16,
    bss:      parseInt($procBss.value, 10) || 8,
    heap:     parseInt($procHeap.value, 10) || 32,
    stack:    parseInt($procStack.value, 10) || 16,
    burst:    parseInt($procBurst.value, 10) || 3,
    interval: parseInt($procInterval.value, 10) || 2,
  };

  const proc = manager.addProcess(opts);
  const totalKB = (opts.text + opts.data + opts.bss + opts.heap + opts.stack);
  appendLog([{
    type: 'info',
    message: `+ ${proc.name} (PID ${proc.pid}) agregado — ${totalKB} KB`,
    color: '#2563eb',
  }]);

  $procName.value = 'MyProc' + proc.pid;
  render();
}

/* ================================================================
   Wire up events
   ================================================================ */
$stepBtn.addEventListener('click', doStep);
$autoBtn.addEventListener('click', toggleAuto);
$resetBtn.addEventListener('click', doReset);
$addProcBtn.addEventListener('click', handleAddProcess);

$partitionMode.addEventListener('change', () => {
  updateCompactionVisibility();
  doReset();
});
$algorithm.addEventListener('change', doReset);
$compaction.addEventListener('change', doReset);
$osSize.addEventListener('change', doReset);

/* ================================================================
   Initial render
   ================================================================ */
updateCompactionVisibility();
render();
