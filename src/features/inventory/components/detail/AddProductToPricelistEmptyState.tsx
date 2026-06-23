import { Receipt } from "lucide-react";

import { cn } from "@/lib/utils";

type AddProductToPricelistEmptyStateProps = {
  variant: "no-pricelists" | "all-assigned";
  className?: string;
};

export function AddProductToPricelistEmptyState({
  variant,
  className,
}: AddProductToPricelistEmptyStateProps) {
  const title =
    variant === "no-pricelists"
      ? "Set up pricelists first"
      : "Already on all pricelists";
  const description =
    variant === "no-pricelists"
      ? "Your organization has no active pricelists configured yet. Create pricelists in settings before adding products."
      : "This product is already on every active pricelist. Remove it from a pricelist first if you need to add it elsewhere.";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
      data-testid="add-product-to-pricelist-empty"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand-primary">
        <Receipt className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-brand-navy">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">{description}</p>
    </div>
  );
}
