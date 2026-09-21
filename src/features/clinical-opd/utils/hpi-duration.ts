/**
 * The HPI API stores a single free-text `body`. Duration is captured as a
 * number plus a unit in the UI, so it is written as a leading `Duration:` line
 * that reads naturally anywhere the raw body is shown (history rail, exports)
 * and parses back into the two fields when the composer reopens.
 */

export const HPI_DURATION_UNITS = [
  { value: "hours", label: "Hours", singular: "hour", plural: "hours" },
  { value: "days", label: "Days", singular: "day", plural: "days" },
  { value: "weeks", label: "Weeks", singular: "week", plural: "weeks" },
  { value: "months", label: "Months", singular: "month", plural: "months" },
  { value: "years", label: "Years", singular: "year", plural: "years" },
] as const;

export type HpiDurationUnit = (typeof HPI_DURATION_UNITS)[number]["value"];

export type HpiDuration = {
  value: number;
  unit: HpiDurationUnit;
};

export const DEFAULT_HPI_DURATION_UNIT: HpiDurationUnit = "days";

const DURATION_LINE = /^duration:\s*(\d+(?:\.\d+)?)\s*([a-z]+)\s*$/i;

const UNIT_BY_WORD = new Map<string, HpiDurationUnit>(
  HPI_DURATION_UNITS.flatMap((unit) => [
    [unit.singular, unit.value],
    [unit.plural, unit.value],
  ]),
);

export function isHpiDurationUnit(value: string): value is HpiDurationUnit {
  return HPI_DURATION_UNITS.some((unit) => unit.value === value);
}

export function formatHpiDuration({ value, unit }: HpiDuration): string {
  const meta = HPI_DURATION_UNITS.find((item) => item.value === unit);
  if (!meta) {
    return `${value}`;
  }
  return `${value} ${value === 1 ? meta.singular : meta.plural}`;
}

/** Joins a duration and narrative into the single body the API accepts. */
export function encodeHpiBody(
  duration: HpiDuration | null,
  narrative: string,
): string {
  const trimmedNarrative = narrative.trim();
  if (!duration) {
    return trimmedNarrative;
  }

  const durationLine = `Duration: ${formatHpiDuration(duration)}`;
  return trimmedNarrative
    ? `${durationLine}\n\n${trimmedNarrative}`
    : durationLine;
}

/** Splits a stored body back into the duration fields and the narrative. */
export function parseHpiBody(body: string | null | undefined): {
  duration: HpiDuration | null;
  narrative: string;
} {
  const source = body ?? "";
  const [firstLine, ...rest] = source.split("\n");
  const match = DURATION_LINE.exec(firstLine?.trim() ?? "");

  if (!match) {
    return { duration: null, narrative: source.trim() };
  }

  const unit = UNIT_BY_WORD.get(match[2].toLowerCase());
  const value = Number(match[1]);

  if (!unit || !Number.isFinite(value) || value <= 0) {
    return { duration: null, narrative: source.trim() };
  }

  return {
    duration: { value, unit },
    narrative: rest.join("\n").trim(),
  };
}
