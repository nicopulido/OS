/**
 * memoryManager.js
 * Unified orchestrator that handles Process logic and routes Memory logic
 * to either SegmentationManager or PagingManager.
 */

import { PROCESS_TEMPLATES, createProcess, resetPidCounter } from './processes.js';
import { SegmentationManager } from './segmentation.js';
import { PagingManager } from './paging.js';

const TOTAL_MEMORY = 16 * 1024 * 1024; // 16 MiB
const MiB = 1024 * 1024;

export class MemoryManager {
  constructor() {
    // Defaults
    this.reset({ scheme: 'segmentation', osSizeMiB: 1, algorithm: 'firstFit' });
  }

  /**
   * Reset the simulation with new settings
   * @param {Object} opts { scheme, osSizeMiB, algorithm, pageSizeKB }
   */
  reset(opts) {
    resetPidCounter();
    this.scheme = opts.scheme; // 'segmentation' | 'paging'
    this.osSizeBytes = opts.osSizeMiB * MiB;
    this.algorithm = opts.algorithm;
    this.pageSizeKB = opts.pageSizeKB || 4;
    
    if (this.scheme === 'segmentation') {
      this.strategy = new SegmentationManager(TOTAL_MEMORY, this.osSizeBytes, this.algorithm);
    } else {
      this.strategy = new PagingManager(TOTAL_MEMORY, this.osSizeBytes, this.pageSizeKB);
    }

    this.eventLog = [];
    this.processes = PROCESS_TEMPLATES.map((t, i) => createProcess(t, i));
  }

  addProcess(opts) {
    const template = {
      name: opts.name,
      segments: {
        text: opts.text * 1024,
        data: opts.data * 1024,
        bss: opts.bss * 1024,
        heap: opts.heap * 1024,
        stack: opts.stack * 1024
      }
    };
    const colorIndex = this.processes.length;
    const proc = createProcess(template, colorIndex);
    this.processes.push(proc);
    
    this.log(`+ Proceso creado: ${proc.name} (PID ${proc.pid}) — ${proc.totalSize / 1024} KB`, '#2563eb');
    return proc;
  }

  openProcess(pid) {
    const proc = this.processes.find(p => p.pid === pid);
    if (!proc || proc.state === 'loaded') return;

    const success = this.strategy.allocate(proc);
    if (success) {
      proc.state = 'loaded';
      this.log(`✓ ${proc.name} (PID ${proc.pid}) cargado en memoria`, '#16a34a');
    } else {
      proc.state = 'failed';
      this.log(`✗ Error al cargar ${proc.name} (PID ${proc.pid}): Memoria insuficiente o muy fragmentada`, '#dc2626');
    }
  }

  closeProcess(pid) {
    const proc = this.processes.find(p => p.pid === pid);
    if (!proc || proc.state !== 'loaded') return;

    this.strategy.deallocate(proc);
    proc.state = 'closed';
    this.log(`- ${proc.name} (PID ${proc.pid}) cerrado y memoria liberada`, '#6b7280');
  }

  compact() {
    if (this.scheme === 'segmentation') {
      this.strategy.compact();
      this.log(`▼ Memoria compactada`, '#2563eb');
    }
  }

  log(message, color) {
    this.eventLog.push({ message, color });
    // Keep max 100 logs
    if (this.eventLog.length > 100) this.eventLog.shift();
  }

  getState() {
    return {
      scheme: this.scheme,
      blocks: this.strategy.getBlocks(),
      processes: this.processes,
      metrics: this.strategy.getMetrics(),
      eventLog: this.eventLog,
      pageSizeBytes: this.pageSizeKB * 1024
    };
  }
}
