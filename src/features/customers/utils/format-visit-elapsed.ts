export function formatVisitElapsed(
  startedAt: string,
  now: Date = new Date(),
): string | null {
  const start = new Date(startedAt);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / 60_000),
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours < 24) {
    return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d`;
}
