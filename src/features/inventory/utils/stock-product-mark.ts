export function getStockProductDisplayName(
  productName: string | null | undefined,
  productId: number,
): string {
  const trimmed = productName?.trim();
  return trimmed || `Product ${productId}`;
}
