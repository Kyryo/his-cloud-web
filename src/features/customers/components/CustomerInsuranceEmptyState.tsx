import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type CustomerInsuranceEmptyStateProps = {
  className?: string;
};

export function CustomerInsuranceEmptyState({
  className,
}: CustomerInsuranceEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
      data-testid="create-customer-insurance-empty"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand-primary">
        <ShieldAlert className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-brand-navy">
        Set up insurance (or payers) first
      </h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Your organization has no insurance schemes configured yet. Set up
        insurance schemes before you can add insurance for this client.
      </p>
      <Button
        asChild
        className="mt-6 h-10 rounded-full bg-brand-primary px-4 text-sm font-semibold hover:bg-brand-primary-hover"
      >
        <Link href={`${ROUTES.settingsFinanceOperations}?add=payer`}>
          Add insurance
        </Link>
      </Button>
    </div>
  );
}
