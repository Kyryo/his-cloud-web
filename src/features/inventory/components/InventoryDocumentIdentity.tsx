import { InventoryMark } from "@/features/inventory/components/InventoryMark";
import type { InventoryMarkKind } from "@/features/inventory/utils/inventory-mark";

type InventoryDocumentIdentityProps = {
  kind: InventoryMarkKind;
  mark: string;
  title: string;
  subtitle?: string | null;
};

export function InventoryDocumentIdentity({
  kind,
  mark,
  title,
  subtitle,
}: InventoryDocumentIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <InventoryMark kind={kind} seed={mark} />
      <div className="min-w-0 space-y-0.5">
        <span className="block truncate text-sm font-semibold text-brand-navy transition-colors group-hover:text-brand-primary">
          {title}
        </span>
        {subtitle ? (
          <p className="truncate font-mono text-xs text-brand-muted">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
