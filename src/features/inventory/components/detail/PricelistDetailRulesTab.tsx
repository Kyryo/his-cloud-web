"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import type { CatalogPricelistRule } from "@/features/catalog/types/catalog.types";
import {
  deleteCatalogPricelistRule,
  fetchCatalogPricelistRules,
} from "@/features/catalog/services/catalog.service";
import { PricelistRuleDialog } from "@/features/inventory/components/detail/PricelistRuleDialog";
import { cn } from "@/lib/utils";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { useToast } from "@/providers/toast-provider";

type PricelistDetailRulesTabProps = {
  pricelist: CatalogPricelist;
  isActive: boolean;
};

function formatRuleTypes(rule: CatalogPricelistRule): string {
  return rule.rule_types
    .map((type) => {
      if (type === "CO_PAYMENT") return "Co-payment";
      if (type === "EXCESS") return "Excess";
      return "Formula";
    })
    .join(", ");
}

export function PricelistDetailRulesTab({
  pricelist,
  isActive,
}: PricelistDetailRulesTabProps) {
  const { toast } = useToast();
  const [rules, setRules] = useState<CatalogPricelistRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CatalogPricelistRule | null>(null);

  const loadRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await fetchCatalogPricelistRules(pricelist.uuid);
      setRules(Array.isArray(records) ? records : []);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load rules",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [pricelist.uuid, toast]);

  useEffect(() => {
    if (isActive) {
      void loadRules();
    }
  }, [isActive, loadRules]);

  async function handleDelete(rule: CatalogPricelistRule) {
    try {
      await deleteCatalogPricelistRule(pricelist.uuid, rule.uuid);
      setRules((current) => current.filter((item) => item.uuid !== rule.uuid));
      toast({ variant: "success", title: "Rule deleted" });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not delete rule",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : getErrorMessage(error),
      });
    }
  }

  return (
    <section className={cn(!isActive && "hidden")} data-testid="pricelist-detail-rules-tab">
      <div className="rounded-xl border border-brand-border bg-white">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Payment rules</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Configure insurer/client split formulas for this pricelist.
            </p>
          </div>
          <SecondaryButton
            type="button"
            onClick={() => {
              setEditingRule(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add rule
          </SecondaryButton>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center px-4 py-12 text-sm text-brand-muted">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Loading rules...
          </div>
        ) : rules.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-brand-muted">
            No payment rules configured. Orders without a matching rule bill the insurer
            for the full amount.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Scope
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Types
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Formula
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Status
                  </th>
                  <th className="w-24 px-2 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {rules.map((rule) => (
                  <tr key={rule.uuid}>
                    <td className="px-4 py-3 text-sm text-brand-navy">
                      {rule.name?.trim() || "Untitled rule"}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {rule.scope_type === "ALL"
                        ? "All products"
                        : (rule.product_names ?? []).join(", ") || "Specific products"}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {formatRuleTypes(rule)}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-brand-slate">
                      {rule.client_liability_formula?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {rule.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Edit ${rule.name || "rule"}`}
                          onClick={() => {
                            setEditingRule(rule);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-brand-muted hover:text-red-600"
                          aria-label={`Delete ${rule.name || "rule"}`}
                          onClick={() => void handleDelete(rule)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PricelistRuleDialog
        pricelist={pricelist}
        rule={editingRule}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => void loadRules()}
      />
    </section>
  );
}
