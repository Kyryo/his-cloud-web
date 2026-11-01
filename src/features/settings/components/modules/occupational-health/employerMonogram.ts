/** Words that carry no identity in a company name (legal forms, articles). */
const SKIPPED_WORDS = new Set(["the", "ltd", "pty", "inc", "llc", "plc", "limited", "corp", "co", "cc"]);

export function employerInitials(name: string): string {
  const words = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const meaningful = words.filter((word) => !SKIPPED_WORDS.has(word.toLowerCase()));
  const source = meaningful.length > 0 ? meaningful : words;
  if (source.length === 0) {
    return "?";
  }
  if (source.length === 1) {
    return source[0].slice(0, 2).toUpperCase();
  }
  return `${source[0][0]}${source[1][0]}`.toUpperCase();
}

/** Stable palette slot for a value, so an employer keeps its colour across pages. */
export function monogramToneIndex(value: string, size: number): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return size > 0 ? hash % size : 0;
}
