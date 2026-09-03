"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { ROUTES } from "@/constants/routes";
import type { Customer } from "@/features/customers/types/customer.types";

type OpdEncounterActionsProps = {
  customer: Customer | null;
  className?: string;
};

export function OpdEncounterActions({
  customer,
  className,
}: OpdEncounterActionsProps) {
  if (!customer) {
    return null;
  }

  return (
    <div className={className}>
      <SecondaryButton
        asChild
        className="inline-flex items-center gap-1.5"
      >
        <Link
          href={ROUTES.customerDetail(customer.uuid)}
          data-testid="opd-encounter-view-client-button"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span>View client</span>
        </Link>
      </SecondaryButton>
    </div>
  );
}
