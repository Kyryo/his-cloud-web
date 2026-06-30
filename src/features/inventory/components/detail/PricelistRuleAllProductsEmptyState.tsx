import { Package } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { cn } from "@/lib/utils";

type PricelistRuleAllProductsEmptyStateProps = {
  onLimitToSpecific?: () => void;
  className?: string;
};

export function PricelistRuleAllProductsEmptyState({
  onLimitToSpecific,
  className,
}: PricelistRuleAllProductsEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-border px-6 py-12 text-center",
        className,
      )}
      data-testid="pricelist-rule-all-products-empty"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand-primary">
        <Package className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-brand-navy">
        All products follow this rule
      </h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        This payment rule applies to every product on the pricelist. Limit the
        scope to specific products if needed.
      </p>
      {onLimitToSpecific ? (
        <SecondaryButton
          type="button"
          className="mt-5"
          onClick={onLimitToSpecific}
          data-testid="pricelist-rule-limit-to-specific"
        >
          Limit to specific products
        </SecondaryButton>
      ) : null}
    </div>
  );
}
