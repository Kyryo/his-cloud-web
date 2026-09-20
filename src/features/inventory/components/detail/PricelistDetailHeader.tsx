"use client";

import type { ReactNode } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  DetailPageDescription,
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";

type PricelistDetailHeaderProps = {
  pricelist: CatalogPricelist;
  onUpdate?: () => void;
  actions?: ReactNode;
};

export function PricelistDetailHeader({
  pricelist,
  onUpdate,
  actions,
}: PricelistDetailHeaderProps) {
  const defaultActions = onUpdate ? (
    <PrimaryButton type="button" size="sm" onClick={onUpdate}>
      Update
    </PrimaryButton>
  ) : null;

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DetailPageTitle>{pricelist.name}</DetailPageTitle>
            {!pricelist.is_active ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-brand-muted">
                Archived
              </span>
            ) : null}
          </div>
          <DetailPageDescription>{pricelist.currency_code}</DetailPageDescription>
        </div>
        <div className="shrink-0">{actions ?? defaultActions}</div>
      </div>
    </DetailPageHeaderSection>
  );
}
