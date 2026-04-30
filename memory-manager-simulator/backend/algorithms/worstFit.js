export function worstFit(holes, requestSize) {
  const candidates = holes.filter((hole) => hole.sizeBytes >= requestSize);
  candidates.sort((a, b) => b.sizeBytes - a.sizeBytes || a.baseAddress - b.baseAddress);
  return candidates[0] ?? null;
}
