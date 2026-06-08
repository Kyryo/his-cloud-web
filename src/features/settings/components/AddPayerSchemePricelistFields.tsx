"use client";

import { Receipt } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem } from "@/components/ui/form";
import type { CreateOrganizationPayerSchemeFormValues } from "@/features/settings/schemas/organization-payer-scheme.schema";
import { cn } from "@/lib/utils";

type AddPayerSchemePricelistFieldsProps = {
  form: UseFormReturn<CreateOrganizationPayerSchemeFormValues>;
};

export function AddPayerSchemePricelistFields({
  form,
}: AddPayerSchemePricelistFieldsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-muted">
        Provision an ERP pricelist for this scheme so billing rates and tariffs can
        be managed in one place.
      </p>

      <FormField
        control={form.control}
        name="create_corresponding_pricelist"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="rounded-xl border border-brand-border bg-slate-50/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-brand-navy">
                        Create corresponding pricelist
                      </p>
                      <p className="text-sm text-brand-muted">
                        When enabled, a matching pricelist is created in ERP and
                        linked to this scheme. The scheme stays active for billing.
                      </p>
                      {!field.value ? (
                        <p className="text-xs text-amber-700">
                          Without a pricelist, the scheme is saved as inactive until
                          one is attached later.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    aria-label="Create corresponding pricelist"
                    data-testid="add-payer-scheme-pricelist-toggle"
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
                      field.value ? "bg-brand-primary" : "bg-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform",
                        field.value ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
