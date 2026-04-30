/**
 * processes.js
 * Defines process templates and factory for the memory simulator.
 * Each process has segments (text, data, bss), heap, stack,
 * burst (steps in memory), and interval (steps waiting before retry).
 */

// Color palette — used only for distinguishing labels, NOT for block colors
export const PROCESS_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#a855f7', // purple
];

const KB = 1024;
const MB = 1024 * KB;

/**
 * 5 pre-loaded process templates — realistic app names.
 * totalSize = text + data + bss + heap + stack
 */
export const PROCESS_TEMPLATES = [
  {
    name: 'Google Chrome',
    segments: { text: 2 * MB, data: 512 * KB, bss: 128 * KB },
    heap: 256 * KB,
    stack: 128 * KB,
    // total = 3 MiB
    burst: 5,
    interval: 3,
  },
  {
    name: 'Steam',
    segments: { text: 1 * MB, data: 256 * KB, bss: 128 * KB },
    heap: 384 * KB,
    stack: 256 * KB,
    // total = 2 MiB
    burst: 4,
    interval: 2,
  },
  {
    name: 'Discord',
    segments: { text: 256 * KB, data: 64 * KB, bss: 32 * KB },
    heap: 96 * KB,
    stack: 64 * KB,
    // total = 512 KB
    burst: 3,
    interval: 1,
  },
  {
    name: 'Minecraft',
    segments: { text: 768 * KB, data: 256 * KB, bss: 128 * KB },
    heap: 640 * KB,
    stack: 256 * KB,
    // total = 2 MiB
    burst: 4,
    interval: 3,
  },
  {
    name: 'VS Code',
    segments: { text: 512 * KB, data: 128 * KB, bss: 64 * KB },
    heap: 192 * KB,
    stack: 128 * KB,
    // total = 1 MiB
    burst: 3,
    interval: 2,
  },
];

let nextPid = 1;

/**
 * Creates a live process instance from a template.
 * @param {object} template - One of PROCESS_TEMPLATES
 * @param {number} colorIndex - Index into PROCESS_COLORS
 * @returns {object} Process instance with runtime state
 */
export function createProcess(template, colorIndex) {
  const totalSize =
    template.segments.text +
    template.segments.data +
    template.segments.bss +
    template.heap +
    template.stack;

  return {
    name: template.name,
    pid: nextPid++,
    segments: { ...template.segments },
    heap: template.heap,
    stack: template.stack,
    totalSize,
    burst: template.burst,
    burstRemaining: 0,
    interval: template.interval,
    intervalRemaining: 0,
    state: 'waiting',
    failures: 0,
    color: PROCESS_COLORS[colorIndex % PROCESS_COLORS.length],
    partitionId: null,
  };
}

/** Reset the PID counter (used on simulation reset). */
export function resetPidCounter() {
  nextPid = 1;
}
