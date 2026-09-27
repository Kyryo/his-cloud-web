const FALLBACK_TIMEZONES = [
  "Africa/Blantyre",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "UTC",
];

export function listTimezones(): string[] {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];
  const zones = supported.length > 0 ? [...supported] : [...FALLBACK_TIMEZONES];
  if (!zones.includes("Africa/Blantyre")) {
    zones.unshift("Africa/Blantyre");
  }
  return zones.sort((left, right) => left.localeCompare(right));
}

export function formatTimezoneLabel(timeZone: string): string {
  return timeZone.replaceAll("_", " ");
}

export function formatCurrentTime(timeZone: string, date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  }
}
