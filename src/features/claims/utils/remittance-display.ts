export function remittanceDisplayName(batch: {
  id: number;
  display_filename?: string | null;
  original_filename?: string | null;
}): string {
  const display = batch.display_filename?.trim();
  if (display) {
    return display;
  }
  const original = batch.original_filename?.trim();
  if (original) {
    return original;
  }
  return `Remittance #${batch.id}`;
}
