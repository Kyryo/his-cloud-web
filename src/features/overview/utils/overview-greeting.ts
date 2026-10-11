const MORNING_END_HOUR = 12;
const AFTERNOON_END_HOUR = 17;

export function overviewGreeting(name: string | undefined, now: Date) {
  const hour = now.getHours();
  const period =
    hour < MORNING_END_HOUR
      ? "Good morning"
      : hour < AFTERNOON_END_HOUR
        ? "Good afternoon"
        : "Good evening";
  const trimmed = name?.trim();
  return trimmed ? `${period}, ${trimmed}` : period;
}
