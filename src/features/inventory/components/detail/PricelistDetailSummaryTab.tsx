"use client";

import { useEffect, useState } from "react";

import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import {
  fetchPricelistValidationConfig,
  updatePricelistValidationConfig,
} from "@/features/claims/services/claims.service";
import type { ValidationPack } from "@/features/claims/types/claims.types";
import { AdvisorPackPicker } from "@/features/inventory/components/detail/AdvisorPackPicker";
import { ProductDetailFieldList } from "@/features/inventory/components/detail/ProductDetailFieldList";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type PricelistDetailSummaryTabProps = {
  pricelist: CatalogPricelist;
  isActive: boolean;
};

export function PricelistDetailSummaryTab({
  pricelist,
  isActive,
}: PricelistDetailSummaryTabProps) {
  const { toast } = useToast();
  const [pack, setPack] = useState<ValidationPack | null>(null);
  const [loadedForUuid, setLoadedForUuid] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isLoading = loadedForUuid !== pricelist.uuid;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const config = await fetchPricelistValidationConfig(pricelist.uuid);
        if (!cancelled) {
          setPack(config.selected_packs[0] ?? null);
          setLoadedForUuid(pricelist.uuid);
        }
      } catch {
        if (!cancelled) {
          setPack(null);
          setLoadedForUuid(pricelist.uuid);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pricelist.uuid]);

  async function handlePackChange(nextPack: ValidationPack | null) {
    setIsSaving(true);
    try {
      const config = await updatePricelistValidationConfig(
        pricelist.uuid,
        nextPack ? [nextPack.code] : [],
      );
      setPack(config.selected_packs[0] ?? null);
      toast({
        variant: "success",
        title: nextPack
          ? `${config.selected_packs[0]?.name ?? nextPack.name} will run on claims billed to this pricelist.`
          : "Only global claim-quality checks will run for this pricelist.",
      });
    } catch (error) {
      const message =
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : "Could not save the advisor pack.";
      toast({ title: message, variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={cn("space-y-4", !isActive && "hidden")}
      data-testid="pricelist-summary-tab"
    >
      <ProductDetailFieldList
        title="Pricelist details"
        fields={[
          { label: "Name", value: pricelist.name },
          { label: "Currency", value: pricelist.currency_code },
          {
            label: "Status",
            value: pricelist.is_active ? "Active" : "Archived",
          },
        ]}
      />

      <section
        className="space-y-3 rounded-xl border border-brand-border bg-white p-5"
        data-testid="pricelist-advisor-pack"
      >
        <AdvisorPackPicker
          pack={pack}
          onPackChange={(nextPack) => {
            void handlePackChange(nextPack);
          }}
          disabled={isLoading || isSaving || !pricelist.is_active}
        />
        {!pack ? (
          <p className="text-sm text-brand-muted" data-testid="pricelist-advisor-pack-empty">
            No advisor pack. Only global claim-quality checks will run.
          </p>
        ) : (
          <p className="text-sm text-brand-navy" data-testid="pricelist-advisor-pack-assigned">
            {pack.name}
          </p>
        )}
      </section>
    </div>
  );
}
