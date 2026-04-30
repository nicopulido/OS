export const BYTES_IN_KIB = 1024;
export const BYTES_IN_MIB = BYTES_IN_KIB * 1024;
export const TOTAL_MEMORY_BYTES = 16 * BYTES_IN_MIB;
export const DEFAULT_OS_BYTES = 1 * BYTES_IN_MIB;

export function bytesToHexAddress(bytes) {
  return `0x${bytes.toString(16).toUpperCase().padStart(6, '0')}`;
}

export function formatBytes(bytes) {
  return `${bytes.toLocaleString('en-US')} B`;
}

export function formatBytesWithHex(bytes) {
  return `${formatBytes(bytes)} (${bytesToHexAddress(bytes)})`;
}

export function clampBytes(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
