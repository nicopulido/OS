/**
 * memoryManager.js
 * Core simulation engine — manages partitions, process lifecycle,
 * allocation, deallocation, compaction, and timeline recording.
 *
 * This module is DOM-free: it only manages state and returns data
 * that main.js uses for rendering.
 */

import { PROCESS_TEMPLATES, PROCESS_COLORS, createProcess, resetPidCounter } from './processes.js';
import { firstFit, bestFit, worstFit } from './allocationStrategies.js';

const TOTAL_MEMORY = 16 * 1024 * 1024; // 16 MiB in bytes
const MiB = 1024 * 1024;
const KB  = 1024;

const STRATEGIES = { firstFit, bestFit, worstFit };

// Predefined partition sizes for variable mode (in MiB)
const VARIABLE_SIZES_MIB = [4, 4, 2, 2, 2, 2, 1, 1, 1, 1];

/* ------------------------------------------------------------------ */
/*  Partition helpers                                                  */
/* ------------------------------------------------------------------ */

let partitionIdCounter = 0;

function makePartition(start, size, opts = {}) {
  return {
    id: partitionIdCounter++,
    startAddress: start,
    size,
    isFree: opts.isFree !== undefined ? opts.isFree : true,
    isOS: opts.isOS || false,
    process: opts.process || null,
  };
}

/* ------------------------------------------------------------------ */
/*  MemoryManager class                                               */
/* ------------------------------------------------------------------ */

export class MemoryManager {
  constructor() {
    this.reset(1, 'fixed', 'firstFit', false);
  }

  /* ====== Initialisation / Reset ====== */

  /**
   * @param {number} osSizeMiB      - OS reservation in MiB (1–6)
   * @param {string} partitionMode  - 'fixed' | 'variable' | 'dynamic'
   * @param {string} strategyName   - 'firstFit' | 'bestFit' | 'worstFit'
   * @param {boolean} compaction    - Enable compaction (dynamic only)
   */
  reset(osSizeMiB, partitionMode, strategyName, compaction) {
    partitionIdCounter = 0;
    resetPidCounter();

    this.osSizeBytes = osSizeMiB * MiB;
    this.partitionMode = partitionMode;
    this.strategyName = strategyName;
    this.compactionEnabled = compaction;
    this.currentStep = 0;
    this.timeline = [];
    this.eventLog = [];
    this.autoRunning = false;

    /** Memory snapshots: one per step for the history view */
    this.memorySnapshots = [];

    // Build partitions
    this.partitions = [];
    this._buildPartitions();

    // Build live processes from templates
    this.processes = PROCESS_TEMPLATES.map((t, i) => createProcess(t, i));
  }

  /* ---- Partition builders per mode ---- */

  _buildPartitions() {
    const osP = makePartition(0, this.osSizeBytes, { isFree: false, isOS: true });
    this.partitions = [osP];

    const available = TOTAL_MEMORY - this.osSizeBytes;

    switch (this.partitionMode) {
      case 'fixed':
        this._buildFixed(available);
        break;
      case 'variable':
        this._buildVariable(available);
        break;
      case 'dynamic':
        this._buildDynamic(available);
        break;
    }
  }

  /** Fixed: 1 MiB blocks */
  _buildFixed(available) {
    const blockSize = MiB;
    let addr = this.osSizeBytes;
    while (addr + blockSize <= TOTAL_MEMORY) {
      this.partitions.push(makePartition(addr, blockSize));
      addr += blockSize;
    }
  }

  /**
   * Variable predefined: take sizes from VARIABLE_SIZES_MIB in order,
   * skipping any that don't fit in remaining space.
   */
  _buildVariable(available) {
    let addr = this.osSizeBytes;
    let remaining = available;

    for (const sizeMiB of VARIABLE_SIZES_MIB) {
      const sizeBytes = sizeMiB * MiB;
      if (sizeBytes <= remaining) {
        this.partitions.push(makePartition(addr, sizeBytes));
        addr += sizeBytes;
        remaining -= sizeBytes;
      }
    }
    if (remaining > 0) {
      this.partitions.push(makePartition(addr, remaining));
    }
  }

  /** Dynamic: one big free block */
  _buildDynamic(available) {
    this.partitions.push(makePartition(this.osSizeBytes, available));
  }

  /* ====== Add a custom process at runtime ====== */

  /**
   * Adds a new process to the simulation.
   * @param {object} opts - { name, text, data, bss, heap, stack, burst, interval } (sizes in KB)
   */
  addProcess(opts) {
    const template = {
      name: opts.name,
      segments: {
        text:  opts.text  * KB,
        data:  opts.data  * KB,
        bss:   opts.bss   * KB,
      },
      heap:  opts.heap  * KB,
      stack: opts.stack * KB,
      burst: opts.burst,
      interval: opts.interval,
    };
    const colorIndex = this.processes.length;
    const proc = createProcess(template, colorIndex);
    this.processes.push(proc);
    return proc;
  }

  /* ====== Allocation ====== */

  /**
   * Attempts to allocate a process using the configured strategy.
   * @returns {boolean} true if allocated
   */
  _tryAllocate(process) {
    const strategyFn = STRATEGIES[this.strategyName];
    const idx = strategyFn(this.partitions, process.totalSize);
    if (idx === -1) return false;

    const partition = this.partitions[idx];

    if (this.partitionMode === 'dynamic') {
      // In dynamic mode, split the free block into process-sized + remainder
      const remainder = partition.size - process.totalSize;

      partition.size = process.totalSize;
      partition.isFree = false;
      partition.process = process;
      process.partitionId = partition.id;

      // If there's leftover space, insert a new free block after
      if (remainder > 0) {
        const freeBlock = makePartition(
          partition.startAddress + partition.size,
          remainder
        );
        this.partitions.splice(idx + 1, 0, freeBlock);
      }
    } else {
      // Fixed / Variable: simply occupy the partition (internal frag possible)
      partition.isFree = false;
      partition.process = process;
      process.partitionId = partition.id;
    }

    return true;
  }

  /* ====== Deallocation ====== */

  _deallocate(process) {
    const partition = this.partitions.find(p => p.id === process.partitionId);
    if (!partition) return;

    partition.isFree = true;
    partition.process = null;
    process.partitionId = null;

    // In dynamic mode, merge adjacent free blocks
    if (this.partitionMode === 'dynamic') {
      this._mergeAdjacentFree();
    }
  }

  /**
   * Merge adjacent free blocks in dynamic mode.
   *
   * Walk through partitions; whenever two consecutive free (non-OS) blocks
   * are found, merge the second into the first by extending its size,
   * then remove the second. Repeat until no more merges are possible.
   */
  _mergeAdjacentFree() {
    let i = 0;
    while (i < this.partitions.length - 1) {
      const curr = this.partitions[i];
      const next = this.partitions[i + 1];
      if (curr.isFree && !curr.isOS && next.isFree && !next.isOS) {
        curr.size += next.size;
        this.partitions.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }

  /* ====== Compaction (dynamic only) ====== */

  /**
   * Compaction consolidates all free space into one contiguous block
   * at the end of memory by sliding occupied blocks toward the OS block.
   *
   * Steps:
   *  1. Collect all occupied (non-OS) partitions in address order.
   *  2. Place them contiguously starting right after the OS block.
   *  3. Create one free block covering all remaining space.
   *  4. Update process.partitionId references.
   */
  _compact() {
    const occupied = this.partitions
      .filter(p => !p.isFree && !p.isOS)
      .sort((a, b) => a.startAddress - b.startAddress);

    const newPartitions = [this.partitions[0]]; // OS partition
    let addr = this.osSizeBytes;

    for (const p of occupied) {
      const np = makePartition(addr, p.size, {
        isFree: false,
        process: p.process,
      });
      if (p.process) p.process.partitionId = np.id;
      newPartitions.push(np);
      addr += p.size;
    }

    const freeSpace = TOTAL_MEMORY - addr;
    if (freeSpace > 0) {
      newPartitions.push(makePartition(addr, freeSpace));
    }

    this.partitions = newPartitions;
  }

  /* ====== Take a snapshot of current memory layout ====== */

  _takeSnapshot() {
    this.memorySnapshots.push({
      step: this.currentStep,
      partitions: this.partitions.map(p => ({
        startAddress: p.startAddress,
        size: p.size,
        isFree: p.isFree,
        isOS: p.isOS,
        processName: p.process ? p.process.name : null,
        processColor: p.process ? p.process.color : null,
      })),
    });
  }

  /* ====== Simulation step ====== */

  /**
   * Advances the simulation by one tick.
   *
   * Phase 1 — Burst advancement:
   *   Loaded processes decrement their burstRemaining.
   *   If burst reaches 0, the process exits memory and begins its interval.
   *
   * Phase 2 — Interval countdown & allocation attempts:
   *   Waiting processes with intervalRemaining > 0 decrement it.
   *   When intervalRemaining reaches 0, the process tries to enter memory.
   *   If allocation fails (and compaction doesn't help), failures++
   *   and the interval resets.
   *
   * @returns {Array} events generated this step
   */
  step() {
    this.currentStep++;
    const events = [];
    const stepFailures = new Set();
    let compacted = false;

    // ---- Phase 1: Burst advancement ----
    for (const proc of this.processes) {
      if (proc.state === 'loaded') {
        proc.burstRemaining--;
        if (proc.burstRemaining <= 0) {
          this._deallocate(proc);
          proc.state = 'waiting';
          proc.intervalRemaining = proc.interval;
          const msg = `[${this.currentStep}] ${proc.name} (PID ${proc.pid}) salió`;
          events.push({ type: 'exit', message: msg, color: '#dc2626' });
        }
      }
    }

    // ---- Phase 2: Interval countdown & allocation ----
    for (const proc of this.processes) {
      if (proc.state !== 'waiting') continue;

      if (proc.intervalRemaining > 0) {
        proc.intervalRemaining--;
        if (proc.intervalRemaining > 0) continue;
      }

      let allocated = this._tryAllocate(proc);

      if (!allocated && this.compactionEnabled && this.partitionMode === 'dynamic') {
        this._compact();
        compacted = true;
        allocated = this._tryAllocate(proc);
      }

      if (allocated) {
        proc.state = 'loaded';
        proc.burstRemaining = proc.burst;
        const msg = `[${this.currentStep}] ${proc.name} (PID ${proc.pid}) cargado`;
        events.push({ type: 'load', message: msg, color: '#16a34a' });
      } else {
        proc.failures++;
        proc.intervalRemaining = proc.interval;
        stepFailures.add(proc.pid);
        const msg = `[${this.currentStep}] ${proc.name} (PID ${proc.pid}) falló`;
        events.push({ type: 'fail', message: msg, color: '#d97706' });
      }
    }

    if (compacted) {
      const msg = `[${this.currentStep}] Compactación ejecutada`;
      events.push({ type: 'compact', message: msg, color: '#2563eb' });
    }

    // ---- Phase 3: Record timeline ----
    const states = {};
    for (const proc of this.processes) {
      if (stepFailures.has(proc.pid)) {
        states[proc.pid] = 'failed';
      } else if (proc.state === 'loaded') {
        states[proc.pid] = 'loaded';
      } else {
        states[proc.pid] = 'waiting';
      }
    }
    this.timeline.push({ step: this.currentStep, states, compacted });

    // ---- Phase 4: Take memory snapshot for history view ----
    this._takeSnapshot();

    this.eventLog.push(...events);
    return events;
  }

  /* ====== Metrics ====== */

  getMetrics() {
    const usedBytes = this.partitions
      .filter(p => !p.isFree)
      .reduce((sum, p) => sum + p.size, 0);
    const freeBytes = TOTAL_MEMORY - usedBytes;
    const freeBlocks = this.partitions.filter(p => p.isFree && !p.isOS);
    const largestFree = freeBlocks.length
      ? Math.max(...freeBlocks.map(p => p.size))
      : 0;

    /**
     * Internal fragmentation = wasted space inside occupied partitions.
     * Only meaningful in fixed/variable modes where a process may be
     * smaller than its assigned partition.
     */
    const internalFragBytes = this.partitions
      .filter(p => !p.isFree && !p.isOS && p.process)
      .reduce((sum, p) => sum + (p.size - p.process.totalSize), 0);

    return {
      totalBytes: TOTAL_MEMORY,
      usedBytes,
      freeBytes,
      freeBlockCount: freeBlocks.length,
      largestFreeBlock: largestFree,
      externalFragmentation: freeBlocks.length > 1,
      internalFragBytes,
    };
  }

  /* ====== State snapshot (for rendering) ====== */

  getState() {
    return {
      partitions: this.partitions,
      processes: this.processes,
      metrics: this.getMetrics(),
      timeline: this.timeline.slice(-20),
      currentStep: this.currentStep,
      eventLog: this.eventLog,
      partitionMode: this.partitionMode,
      compactionEnabled: this.compactionEnabled,
      memorySnapshots: this.memorySnapshots,
    };
  }
}
