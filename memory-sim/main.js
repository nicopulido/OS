/**
 * main.js
 * UI rendering and event handling for the memory simulator.
 */

import { MemoryManager } from './memoryManager.js';

const manager = new MemoryManager();

/* ================================================================
   DOM references
   ================================================================ */
const $ = id => document.getElementById(id);

const $memoryScheme = $('memoryScheme');
const $segmentationControls = $('segmentationControls');
const $pagingControls = $('pagingControls');
const $algorithm = $('algorithm');
const $pageSize = $('pageSize');
const $osSize = $('osSize');
const $resetBtn = $('resetBtn');
const $compactBtn = $('compactBtn');
const $eventLog = $('eventLog');
const $memoryBar = $('memoryBar');
const $memTooltip = $('memTooltip');
const $metrics = $('metrics');
const $processCards = $('processCards');
const $tableTitle = $('tableTitle');
const $memoryTableWrap = $('memoryTableWrap');
const $stepBadge = $('stepBadge');

// Add-process form
const $procName = $('procName');
const $procText = $('procText');
const $procData = $('procData');
const $procBss = $('procBss');
const $procHeap = $('procHeap');
const $procStack = $('procStack');
const $addProcBtn = $('addProcBtn');

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

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/* ================================================================
   Rendering
   ================================================================ */
function render() {
  const state = manager.getState();
  
  $stepBadge.textContent = `Esquema: ${state.scheme === 'segmentation' ? 'Segmentación' : 'Paginación'}`;
  
  renderMemoryBar(state);
  renderMetrics(state);
  renderProcessCards(state);
  renderTable(state);
  renderLogs(state);
}

function renderMemoryBar(state) {
  const total = 16 * MB;
  $memoryBar.innerHTML = '';

  for (const block of state.blocks) {
    const pct = (block.size / total) * 100;
    const div = document.createElement('div');
    div.className = 'mem-block';
    
    if (state.scheme === 'paging' && !block.isOS && !block.isFree) {
        div.classList.add('frame-block');
    }

    const addrSpan = `<span class="block-addr">${fmtHex(block.startAddress)}</span>`;
    let labelText = '';

    if (block.isOS) {
      div.classList.add('os-block');
      labelText = 'SO';
    } else if (block.isFree) {
      div.classList.add('free-block');
      labelText = pct > 4 ? 'Libre' : '';
    } else {
      div.classList.add('proc-block');
      div.style.borderLeftColor = block.process.color;
      
      if (state.scheme === 'segmentation') {
        labelText = `${block.process.name} [${block.segmentName}]`;
      } else {
        labelText = pct > 2 ? `${block.process.name} (${block.frameCount} marcos)` : '';
      }
    }

    div.innerHTML = `${addrSpan}<span class="block-label">${labelText}</span>`;
    div.style.flex = `0 0 ${pct}%`;

    div.addEventListener('mouseenter', (e) => showTooltip(e, block, state.scheme));
    div.addEventListener('mousemove',  (e) => positionTooltip(e));
    div.addEventListener('mouseleave', hideTooltip);

    $memoryBar.appendChild(div);
  }
}

function showTooltip(e, block, scheme) {
  const endAddr = block.startAddress + block.size - 1;
  let label = block.isOS ? 'Sistema Operativo' : block.isFree ? 'Hueco Libre' : block.process.name;
  let extraRows = '';

  if (!block.isOS && !block.isFree) {
    if (scheme === 'segmentation') {
      extraRows += `<div class="tip-row"><span>Segmento:</span><span>${block.segmentName}</span></div>`;
    } else {
      extraRows += `<div class="tip-row"><span>Marcos:</span><span>${block.frameCount}</span></div>`;
    }
  }

  $memTooltip.innerHTML = `
    <strong>${label}</strong>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:5px 0">
    <div class="tip-row"><span>Inicio:</span><span>${fmtHex(block.startAddress)}</span></div>
    <div class="tip-row"><span>Fin:</span><span>${fmtHex(endAddr)}</span></div>
    <div class="tip-row"><span>Tamaño:</span><span>${fmtBytes(block.size)}</span></div>
    ${extraRows}
  `;

  positionTooltip(e);
  $memTooltip.classList.add('visible');
}

function positionTooltip(e) {
  const pad = 14;
  const tw = $memTooltip.offsetWidth || 220;
  const th = $memTooltip.offsetHeight || 120;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  if (x + tw > window.innerWidth - 10)  x = e.clientX - tw - pad;
  if (y + th > window.innerHeight - 10) y = e.clientY - th - pad;
  $memTooltip.style.left = x + 'px';
  $memTooltip.style.top  = y + 'px';
}

function hideTooltip() {
  $memTooltip.classList.remove('visible');
}

function renderMetrics(state) {
  const m = state.metrics;
  const totalBytes = 16 * MB;
  let html = `
    <div class="metric-row"><span>Total:</span><span class="mono">${fmtBytes(totalBytes)}</span></div>
    <div class="metric-row"><span>Usada:</span><span class="mono">${fmtBytes(m.usedBytes)}</span></div>
    <div class="metric-row"><span>Libre:</span><span class="mono">${fmtBytes(m.freeBytes)}</span></div>
  `;
  if (state.scheme === 'segmentation' && m.externalFragmentation) {
    html += `<div class="metric-row frag-warn">⚠ Frag. externa: ${m.freeHolesCount} huecos libres</div>`;
  }
  if (state.scheme === 'paging' && m.internalFragBytes > 0) {
    html += `<div class="metric-row frag-internal">↳ Frag. interna: ${fmtBytes(m.internalFragBytes)} desperdiciados</div>`;
  }
  $metrics.innerHTML = html;
}

function renderProcessCards(state) {
  $processCards.innerHTML = '';

  for (const proc of state.processes) {
    const isLoaded = proc.state === 'loaded';
    const isFailed = proc.state === 'failed';
    const isClosed = proc.state === 'closed';

    const card = document.createElement('div');
    card.className = `proc-card state-card-${proc.state}`;

    const badgeCls = isLoaded ? 'state-loaded' : isFailed ? 'state-failed' : 'state-closed';
    const badgeTxt = isLoaded ? 'En Memoria' : isFailed ? 'Falló (No hay espacio)' : 'Cerrado';

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
        <span class="state-badge ${badgeCls}">${badgeTxt}</span>
      </div>
      <div class="card-actions">
        ${isLoaded 
          ? `<button class="btn btn-close" data-pid="${proc.pid}">✖ Cerrar</button>` 
          : `<button class="btn btn-open" data-pid="${proc.pid}">▶ Abrir</button>`}
      </div>
    `;

    $processCards.appendChild(card);
  }

  // Wire up buttons
  document.querySelectorAll('.btn-open').forEach(btn => {
    btn.addEventListener('click', (e) => {
      manager.openProcess(parseInt(e.target.dataset.pid, 10));
      render();
    });
  });
  document.querySelectorAll('.btn-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      manager.closeProcess(parseInt(e.target.dataset.pid, 10));
      render();
    });
  });
}

function renderTable(state) {
  if (state.scheme === 'segmentation') {
    $tableTitle.textContent = "Tabla de Segmentos";
    let html = `<table class="part-table">
      <thead><tr>
        <th>Bloque ID</th><th>Inicio (Hex)</th><th>Tamaño</th><th>Estado / Segmento</th><th>Proceso</th>
      </tr></thead><tbody>`;

    state.blocks.forEach(b => {
      const procName = b.isOS ? 'Kernel' : b.isFree ? '—' : esc(b.process.name);
      const statusBadge = b.isOS 
        ? '<span class="badge badge-os">SO</span>' 
        : b.isFree 
          ? '<span class="badge badge-free">Hueco Libre</span>' 
          : `<span class="badge badge-occupied">${esc(b.segmentName)}</span>`;

      html += `<tr>
        <td>${b.id}</td>
        <td>${fmtHex(b.startAddress)}</td>
        <td>${fmtBytes(b.size)}</td>
        <td>${statusBadge}</td>
        <td>${procName}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    $memoryTableWrap.innerHTML = html;

  } else {
    $tableTitle.textContent = "Tabla de Páginas (Asignaciones)";
    let html = `<table class="part-table">
      <thead><tr>
        <th>PID</th><th>Proceso</th><th>Páginas</th><th>Marcos Físicos Asignados</th>
      </tr></thead><tbody>`;

    const loadedProcs = state.processes.filter(p => p.state === 'loaded');
    if (loadedProcs.length === 0) {
      html += `<tr><td colspan="4" style="text-align:center; color:#999;">No hay procesos cargados</td></tr>`;
    }

    loadedProcs.forEach(p => {
      const pagesCount = Math.ceil(p.totalSize / state.pageSizeBytes);
      const framesStr = p.pageTable.length > 5 
        ? `${p.pageTable.slice(0, 5).join(', ')}... (+${p.pageTable.length - 5} más)` 
        : p.pageTable.join(', ');

      html += `<tr>
        <td>${p.pid}</td>
        <td>${esc(p.name)}</td>
        <td>${pagesCount}</td>
        <td>[${framesStr}]</td>
      </tr>`;
    });

    html += '</tbody></table>';
    $memoryTableWrap.innerHTML = html;
  }
}

function renderLogs(state) {
  $eventLog.innerHTML = '';
  state.eventLog.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.style.color = ev.color;
    div.textContent = ev.message;
    $eventLog.appendChild(div);
  });
  $eventLog.scrollTop = $eventLog.scrollHeight;
}

/* ================================================================
   Event Handlers
   ================================================================ */

function doReset() {
  const scheme = $memoryScheme.value;
  const osSizeMiB = parseInt($osSize.value, 10) || 1;
  const algorithm = $algorithm.value;
  const pageSizeKB = parseInt($pageSize.value, 10) || 4;

  if (scheme === 'segmentation') {
    $segmentationControls.classList.remove('hidden');
    $pagingControls.classList.add('hidden');
  } else {
    $segmentationControls.classList.add('hidden');
    $pagingControls.classList.remove('hidden');
  }

  manager.reset({ scheme, osSizeMiB, algorithm, pageSizeKB });
  render();
}

function handleAddProcess() {
  const name = $procName.value.trim();
  if (!name) return;

  manager.addProcess({
    name,
    text: parseInt($procText.value, 10) || 64,
    data: parseInt($procData.value, 10) || 16,
    bss: parseInt($procBss.value, 10) || 8,
    heap: parseInt($procHeap.value, 10) || 32,
    stack: parseInt($procStack.value, 10) || 16
  });

  $procName.value = 'MyProc' + (manager.processes.length + 1);
  render();
}

/* ================================================================
   Wire up events
   ================================================================ */
$memoryScheme.addEventListener('change', doReset);
$algorithm.addEventListener('change', doReset);
$pageSize.addEventListener('change', doReset);
$osSize.addEventListener('change', doReset);
$resetBtn.addEventListener('click', doReset);
$compactBtn.addEventListener('click', () => { manager.compact(); render(); });
$addProcBtn.addEventListener('click', handleAddProcess);

/* ================================================================
   Initial render
   ================================================================ */
doReset();
