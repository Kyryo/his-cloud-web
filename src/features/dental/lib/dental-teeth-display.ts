/** Compact summary of FDI tooth numbers, e.g. "16, 26" or "16 and 2 more". */
export function formatToothNumbersSummary(
  toothNumbers: number[],
  fallback = "No teeth selected",
): string {
  if (!toothNumbers.length) return fallback;
  const sorted = [...toothNumbers].sort((a, b) => a - b);
  if (sorted.length <= 3) return sorted.join(", ");
  const head = sorted.slice(0, 2).join(", ");
  const more = sorted.length - 2;
  return `${head} and ${more} more`;
}
