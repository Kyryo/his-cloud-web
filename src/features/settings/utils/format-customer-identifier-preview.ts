/**
 * Build a Client ID / MRN preview matching backend CustomerIdentifierService.
 */
export function formatCustomerIdentifierPreview(options: {
  prefix: string;
  fallbackPrefix: string;
  separator: string;
  digits: number;
  startNumber: number;
  suffix: string;
}): string {
  const prefix = (options.prefix.trim() || options.fallbackPrefix).trim();
  const digits = Math.min(12, Math.max(1, Math.trunc(options.digits) || 1));
  const startNumber = Math.max(1, Math.trunc(options.startNumber) || 1);
  const padded = String(startNumber).padStart(digits, "0");
  return `${prefix}${options.separator}${padded}${options.suffix.trim()}`;
}
