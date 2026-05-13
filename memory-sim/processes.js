/**
 * processes.js
 * Defines process templates and factory for the memory simulator.
 * Each process has discrete segments: text, data, bss, heap, stack.
 */

export const PROCESS_COLORS = [
  '#ef4444', '#3b82f6', '#8b5cf6', '#f97316', 
  '#06b6d4', '#ec4899', '#14b8a6', '#a855f7'
];

const KB = 1024;
const MB = 1024 * KB;

export const PROCESS_TEMPLATES = [
  {
    name: 'Google Chrome',
    segments: { text: 2 * MB, data: 512 * KB, bss: 128 * KB, heap: 256 * KB, stack: 128 * KB }
  },
  {
    name: 'Steam',
    segments: { text: 1 * MB, data: 256 * KB, bss: 128 * KB, heap: 384 * KB, stack: 256 * KB }
  },
  {
    name: 'Discord',
    segments: { text: 256 * KB, data: 64 * KB, bss: 32 * KB, heap: 96 * KB, stack: 64 * KB }
  },
  {
    name: 'Minecraft',
    segments: { text: 768 * KB, data: 256 * KB, bss: 128 * KB, heap: 640 * KB, stack: 256 * KB }
  },
  {
    name: 'VS Code',
    segments: { text: 512 * KB, data: 128 * KB, bss: 64 * KB, heap: 192 * KB, stack: 128 * KB }
  }
];

let nextPid = 1;

export function createProcess(template, colorIndex) {
  const segments = { ...template.segments };
  const totalSize = Object.values(segments).reduce((a, b) => a + b, 0);

  return {
    name: template.name,
    pid: nextPid++,
    segments,
    totalSize,
    state: 'closed', // 'closed', 'loaded', 'failed'
    color: PROCESS_COLORS[colorIndex % PROCESS_COLORS.length],
    allocatedSegments: [], // To track where segments are in Segmentation
    pageTable: [] // To track pages to frames in Paging
  };
}

export function resetPidCounter() {
  nextPid = 1;
}
