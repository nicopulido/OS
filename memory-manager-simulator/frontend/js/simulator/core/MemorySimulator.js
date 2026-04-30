import { MemoryProcess } from '../models/MemoryProcess.js';
import { MemoryPartition } from '../models/MemoryPartition.js';
import { bestFit } from '../algorithms/bestFit.js';
import { firstFit } from '../algorithms/firstFit.js';
import { worstFit } from '../algorithms/worstFit.js';
import {
  BYTES_IN_MIB,
  DEFAULT_OS_BYTES,
  TOTAL_MEMORY_BYTES,
  bytesToHexAddress,
  clampBytes,
  formatBytes,
} from './memoryUnits.js';

const DEFAULT_PROCESS_DEFINITIONS = [
  {
    pid: 101,
    name: 'Kernel_Task',
    arrivalTick: 0,
    lifetimeTicks: 6,
    segments: {
      text: 196608,
      data: 98304,
      bss: 32768,
      heap: 131072,
      stack: 65536,
    },
  },
  {
    pid: 102,
    name: 'DB_Service',
    arrivalTick: 1,
    lifetimeTicks: 5,
    segments: {
      text: 245760,
      data: 131072,
      bss: 65536,
      heap: 262144,
      stack: 98304,
    },
  },
  {
    pid: 103,
    name: 'Web_Renderer',
    arrivalTick: 2,
    lifetimeTicks: 4,
    segments: {
      text: 212992,
      data: 122880,
      bss: 49152,
      heap: 196608,
      stack: 81920,
    },
  },
  {
    pid: 104,
    name: 'Cache_Daemon',
    arrivalTick: 3,
    lifetimeTicks: 8,
    segments: {
      text: 163840,
      data: 81920,
      bss: 32768,
      heap: 122880,
      stack: 65536,
    },
  },
  {
    pid: 105,
    name: 'Telemetry_Agent',
    arrivalTick: 4,
    lifetimeTicks: 4,
    segments: {
      text: 114688,
      data: 65536,
      bss: 24576,
      heap: 98304,
      stack: 49152,
    },
  },
];

const STRATEGY_MAP = {
  'first-fit': firstFit,
  'best-fit': bestFit,
  'worst-fit': worstFit,
};

function sortByArrivalAndPid(left, right) {
  return left.arrivalTick - right.arrivalTick || left.pid - right.pid;
}

function sortByBaseAddress(left, right) {
  return left.baseAddress - right.baseAddress || left.pid - right.pid;
}

function createSystemPartition(osBytes) {
  return new MemoryPartition({
    baseAddress: 0,
    sizeBytes: osBytes,
    kind: 'system',
    pid: 'SO',
    name: 'Sistema Operativo',
  });
}

export class MemorySimulator {
  constructor() {
    this.reset();
  }

  reset({ osSizeMiB = 1, algorithm = 'first-fit', autoCompact = false } = {}) {
    const normalizedOsSizeBytes = clampBytes(
      Math.round(osSizeMiB * BYTES_IN_MIB),
      BYTES_IN_MIB,
      TOTAL_MEMORY_BYTES - BYTES_IN_MIB
    );

    this.config = {
      osSizeMiB: normalizedOsSizeBytes / BYTES_IN_MIB,
      osBytes: normalizedOsSizeBytes,
      algorithm,
      autoCompact,
    };
    this.tick = 0;
    this.processes = [];
    this.partitions = [];
    this.timeline = [];
    this.memorySnapshots = [];
    this.rebuildMemoryMap();
    this.captureMemorySnapshot();
  }

  setConfig({ osSizeMiB, algorithm, autoCompact } = {}) {
    if (typeof algorithm === 'string' && STRATEGY_MAP[algorithm]) {
      this.config.algorithm = algorithm;
    }

    if (typeof autoCompact === 'boolean') {
      this.config.autoCompact = autoCompact;
    }

    if (Number.isFinite(osSizeMiB)) {
      const normalizedOsSizeBytes = clampBytes(
        Math.round(osSizeMiB * BYTES_IN_MIB),
        BYTES_IN_MIB,
        TOTAL_MEMORY_BYTES - BYTES_IN_MIB
      );

      this.config.osSizeMiB = normalizedOsSizeBytes / BYTES_IN_MIB;
      this.config.osBytes = normalizedOsSizeBytes;
      this.rebuildMemoryMap();
    }
  }

  loadDefaultProcesses() {
    this.reset({
      osSizeMiB: this.config.osSizeMiB,
      algorithm: this.config.algorithm,
      autoCompact: this.config.autoCompact,
    });

    for (const definition of DEFAULT_PROCESS_DEFINITIONS) {
      this.createProcess(definition);
    }

    return this.getState();
  }

  createProcess(input) {
    const pid = Number.isInteger(input.pid) ? input.pid : this.getNextPid();
    if (this.processes.some((process) => process.pid === pid)) {
      throw new Error(`PID ${pid} already exists.`);
    }

    const process = new MemoryProcess({ ...input, pid });
    const processRecord = {
      ...process.toJSON(),
      status: 'waiting',
      baseAddress: null,
      allocatedAt: null,
      releaseTick: null,
      completedAt: null,
      decisionHistory: [],
    };

    this.processes.push(processRecord);
    this.processes.sort(sortByArrivalAndPid);
    this.rebuildMemoryMap();
    return processRecord;
  }

  getNextPid() {
    const maxPid = this.processes.reduce((maximum, process) => {
      return Number.isInteger(process.pid) && process.pid > maximum ? process.pid : maximum;
    }, 100);

    return maxPid + 1;
  }

  getResidentProcesses() {
    return this.processes.filter((process) => process.status === 'resident');
  }

  rebuildMemoryMap() {
    const residentProcesses = this.getResidentProcesses().sort(sortByBaseAddress);
    const partitions = [createSystemPartition(this.config.osBytes)];
    let cursor = this.config.osBytes;

    for (const process of residentProcesses) {
      if (process.baseAddress > cursor) {
        partitions.push(
          new MemoryPartition({
            baseAddress: cursor,
            sizeBytes: process.baseAddress - cursor,
            kind: 'free',
            pid: null,
            name: 'Libre',
          })
        );
      }

      partitions.push(
        new MemoryPartition({
          baseAddress: process.baseAddress,
          sizeBytes: process.totalSizeBytes,
          kind: 'process',
          pid: process.pid,
          name: process.name,
        })
      );

      cursor = Math.max(cursor, process.baseAddress + process.totalSizeBytes);
    }

    if (cursor < TOTAL_MEMORY_BYTES) {
      partitions.push(
        new MemoryPartition({
          baseAddress: cursor,
          sizeBytes: TOTAL_MEMORY_BYTES - cursor,
          kind: 'free',
          pid: null,
          name: 'Libre',
        })
      );
    }

    this.partitions = partitions;
  }

  chooseHole(requestSizeBytes) {
    const holes = this.partitions.filter((partition) => partition.kind === 'free');
    const strategy = STRATEGY_MAP[this.config.algorithm] ?? firstFit;
    return strategy(holes, requestSizeBytes);
  }

  tryAllocateProcess(process) {
    const hole = this.chooseHole(process.totalSizeBytes);
    if (!hole) {
      process.decisionHistory.push({ tick: this.tick, result: 'rejected' });
      return false;
    }

    process.status = 'resident';
    process.baseAddress = hole.baseAddress;
    process.allocatedAt = this.tick;
    process.releaseTick = this.tick + process.lifetimeTicks;
    process.decisionHistory.push({ tick: this.tick, result: 'loaded' });
    return true;
  }

  releaseProcess(process) {
    process.status = 'finished';
    process.completedAt = this.tick;
    process.baseAddress = null;
    process.releaseTick = null;
  }

  compactMemory() {
    const residentProcesses = this.getResidentProcesses().sort(sortByBaseAddress);
    let cursor = this.config.osBytes;

    for (const process of residentProcesses) {
      process.baseAddress = cursor;
      cursor += process.totalSizeBytes;
    }

    this.rebuildMemoryMap();
  }

  captureMemorySnapshot() {
    this.memorySnapshots.push({
      tick: this.tick,
      partitions: this.partitions.map((partition) => ({
        ...partition.toJSON(),
        baseAddressHex: bytesToHexAddress(partition.baseAddress),
        endAddressHex: bytesToHexAddress(partition.baseAddress + partition.sizeBytes - 1),
      })),
    });
  }

  captureCurrentMemorySnapshot() {
    if (!this.memorySnapshots.some((s) => s.tick === this.tick)) {
      this.captureMemorySnapshot();
    }
  }

  step() {
    const eventsByPid = {};

    for (const process of this.processes) {
      if (process.status === 'resident' && process.releaseTick === this.tick) {
        this.releaseProcess(process);
        eventsByPid[process.pid] = 'released';
      }
    }

    this.rebuildMemoryMap();

    if (this.config.autoCompact && this.processes.some((process) => process.status === 'waiting')) {
      this.compactMemory();
    }

    const waitingProcesses = this.processes
      .filter((process) => process.status === 'waiting' && process.arrivalTick <= this.tick)
      .sort(sortByArrivalAndPid);

    for (const process of waitingProcesses) {
      const loaded = this.tryAllocateProcess(process);
      eventsByPid[process.pid] = loaded ? 'loaded' : 'rejected';
    }

    this.rebuildMemoryMap();
    this.timeline.push({ tick: this.tick, eventsByPid });
    this.captureMemorySnapshot();
    this.tick += 1;
    return this.getState();
  }

  getMemorySummary() {
    const occupiedBytes = this.getResidentProcesses().reduce((sum, process) => sum + process.totalSizeBytes, 0);
    const freeBytes = TOTAL_MEMORY_BYTES - this.config.osBytes - occupiedBytes;
    const freePartitions = this.partitions.filter((partition) => partition.kind === 'free');
    const largestHoleBytes = freePartitions.reduce((maximum, partition) => Math.max(maximum, partition.sizeBytes), 0);

    return {
      totalBytes: TOTAL_MEMORY_BYTES,
      totalLabel: formatBytes(TOTAL_MEMORY_BYTES),
      osBytes: this.config.osBytes,
      osLabel: formatBytes(this.config.osBytes),
      occupiedBytes,
      occupiedLabel: formatBytes(occupiedBytes),
      freeBytes,
      freeLabel: formatBytes(freeBytes),
      largestHoleBytes,
      largestHoleLabel: formatBytes(largestHoleBytes),
    };
  }

  getState() {
    this.captureCurrentMemorySnapshot();

    return {
      tick: this.tick,
      nextPid: this.getNextPid(),
      config: {
        algorithm: this.config.algorithm,
        autoCompact: this.config.autoCompact,
        osSizeMiB: this.config.osSizeMiB,
        osBytes: this.config.osBytes,
        osBaseHex: bytesToHexAddress(0),
        osEndHex: bytesToHexAddress(this.config.osBytes - 1),
      },
      memory: this.getMemorySummary(),
      partitions: this.partitions.map((partition) => partition.toJSON()),
      processes: this.processes.map((process) => ({
        ...process,
        baseAddressHex: process.baseAddress === null ? null : bytesToHexAddress(process.baseAddress),
      })),
      timeline: this.timeline.map((entry) => ({
        tick: entry.tick,
        eventsByPid: { ...entry.eventsByPid },
      })),
      memorySnapshots: this.memorySnapshots,
    };
  }
}

export default new MemorySimulator();
