import { formatBytes } from '../core/memoryUnits.js';

function validateInteger(value, fieldName, minValue = 0) {
  if (!Number.isInteger(value) || value < minValue) {
    throw new Error(`${fieldName} must be an integer greater than or equal to ${minValue}.`);
  }
}

function validateSegmentSize(value, fieldName) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }
}

export class MemoryProcess {
  constructor({ pid, name, segments, arrivalTick = 0, lifetimeTicks = 4 }) {
    validateInteger(pid, 'pid', 1);

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('name must be a non-empty string.');
    }

    validateInteger(arrivalTick, 'arrivalTick', 0);
    validateInteger(lifetimeTicks, 'lifetimeTicks', 1);

    this.pid = pid;
    this.name = name.trim();
    this.arrivalTick = arrivalTick;
    this.lifetimeTicks = lifetimeTicks;
    this.segments = {
      text: 0,
      data: 0,
      bss: 0,
      heap: 0,
      stack: 0,
      ...segments,
    };

    for (const [segmentName, segmentSize] of Object.entries(this.segments)) {
      validateSegmentSize(segmentSize, segmentName);
    }
  }

  get totalSizeBytes() {
    return Object.values(this.segments).reduce((sum, size) => sum + size, 0);
  }

  get segmentRows() {
    return Object.entries(this.segments).map(([segment, size]) => ({
      segment,
      sizeBytes: size,
      sizeLabel: formatBytes(size),
    }));
  }

  toJSON() {
    return {
      pid: this.pid,
      name: this.name,
      arrivalTick: this.arrivalTick,
      lifetimeTicks: this.lifetimeTicks,
      segments: { ...this.segments },
      totalSizeBytes: this.totalSizeBytes,
      segmentRows: this.segmentRows,
    };
  }
}
