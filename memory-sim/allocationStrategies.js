/**
 * allocationStrategies.js
 * Three classic memory-allocation algorithms.
 *
 * Each function receives the current partitions array and the required
 * size in bytes. It returns the INDEX of the best-fitting free partition,
 * or -1 if none can hold the process.
 *
 * Only free, non-OS partitions are candidates.
 */

/**
 * First Fit — returns the FIRST free partition whose size >= required.
 * Scans partitions from lowest address to highest.
 * Fast but can cause fragmentation at the beginning of memory.
 *
 * @param {Array} partitions - Current partition list
 * @param {number} size      - Required size in bytes
 * @returns {number} Index of chosen partition, or -1
 */
export function firstFit(partitions, size) {
  for (let i = 0; i < partitions.length; i++) {
    const p = partitions[i];
    if (p.isFree && !p.isOS && p.size >= size) {
      return i;
    }
  }
  return -1;
}

/**
 * Best Fit — returns the SMALLEST free partition that still fits.
 * Minimises leftover space (internal fragmentation in fixed/variable,
 * remainder block in dynamic). May leave many tiny unusable fragments.
 *
 * @param {Array} partitions - Current partition list
 * @param {number} size      - Required size in bytes
 * @returns {number} Index of chosen partition, or -1
 */
export function bestFit(partitions, size) {
  let bestIdx = -1;
  let bestSize = Infinity;

  for (let i = 0; i < partitions.length; i++) {
    const p = partitions[i];
    if (p.isFree && !p.isOS && p.size >= size) {
      if (p.size < bestSize) {
        bestSize = p.size;
        bestIdx = i;
      }
    }
  }
  return bestIdx;
}

/**
 * Worst Fit — returns the LARGEST free partition.
 * Leaves the biggest possible remainder, hoping it stays usable.
 * Can waste large blocks on small processes.
 *
 * @param {Array} partitions - Current partition list
 * @param {number} size      - Required size in bytes
 * @returns {number} Index of chosen partition, or -1
 */
export function worstFit(partitions, size) {
  let worstIdx = -1;
  let worstSize = -1;

  for (let i = 0; i < partitions.length; i++) {
    const p = partitions[i];
    if (p.isFree && !p.isOS && p.size >= size) {
      if (p.size > worstSize) {
        worstSize = p.size;
        worstIdx = i;
      }
    }
  }
  return worstIdx;
}
