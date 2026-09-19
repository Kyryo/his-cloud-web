/** Empty string → null; otherwise trim. */
export function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

/** Parse optional non-negative integer from form text. */
export function parseOptionalInt(
  value: string | undefined | null,
): number | null {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "") return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Parse optional decimal from form text. */
export function parseOptionalDecimal(
  value: string | undefined | null,
): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export function isLabCatalogAccessDeniedMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("not authenticated") ||
    lower.includes("forbidden") ||
    lower.includes("permission") ||
    lower.includes("403")
  );
}
