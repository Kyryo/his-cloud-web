/** Coerce API values (string, number, etc.) to a trimmed string. */
export function coerceToOptionalString(value: unknown): string {
  if (value == null) {
    return "";
  }
  return String(value).trim();
}
