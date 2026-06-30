type LineExcessBadgeProps = {
  hasExcess: boolean;
};

export function LineExcessBadge({ hasExcess }: LineExcessBadgeProps) {
  if (!hasExcess) {
    return <span className="text-sm text-brand-muted">—</span>;
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
      Excess
    </span>
  );
}
