/**
 * allocationStrategies.js
 * Memory-allocation algorithms for Segmentation.
 * 
 * Takes an array of free holes and returns the index of the best hole for the requested size.
 */

export function firstFit(holes, size) {
  for (let i = 0; i < holes.length; i++) {
    if (holes[i].size >= size) return i;
  }
  return -1;
}

export function bestFit(holes, size) {
  let bestIdx = -1;
  let bestSize = Infinity;

  for (let i = 0; i < holes.length; i++) {
    if (holes[i].size >= size && holes[i].size < bestSize) {
      bestSize = holes[i].size;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function worstFit(holes, size) {
  let worstIdx = -1;
  let worstSize = -1;

  for (let i = 0; i < holes.length; i++) {
    if (holes[i].size >= size && holes[i].size > worstSize) {
      worstSize = holes[i].size;
      worstIdx = i;
    }
  }
  return worstIdx;
}
