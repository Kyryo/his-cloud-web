type LinePricelistCellProps = {
  isPayable: boolean;
  pricelistName?: string | null;
};

export function LinePricelistCell({
  isPayable,
  pricelistName,
}: LinePricelistCellProps) {
  if (isPayable) {
    return (
      <span className="text-sm text-brand-slate">
        {pricelistName?.trim() || "Pricelist"}
      </span>
    );
  }

  return (
    <div>
      <span className="text-sm text-brand-slate">—</span>
      <p className="text-xs text-brand-muted">List price</p>
    </div>
  );
}
