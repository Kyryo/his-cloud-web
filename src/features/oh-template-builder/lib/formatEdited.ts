import { formatDistanceStrict } from "date-fns";

const JUST_NOW_MS = 60_000;

/** Relative age of a last-edited timestamp, e.g. "3 days ago" or "just now". */
export function formatEditedAgo(
  updatedAt: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!updatedAt) {
    return null;
  }
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  if (now.getTime() - date.getTime() < JUST_NOW_MS) {
    return "just now";
  }
  return formatDistanceStrict(date, now, { addSuffix: true });
}
