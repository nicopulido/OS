export function bestFit(holes, requestSize) {
  const candidates = holes.filter((hole) => hole.sizeBytes >= requestSize);
  candidates.sort((a, b) => a.sizeBytes - b.sizeBytes || a.baseAddress - b.baseAddress);
  return candidates[0] ?? null;
}
