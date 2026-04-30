export function firstFit(holes, requestSize) {
  return holes.find((hole) => hole.sizeBytes >= requestSize) ?? null;
}
