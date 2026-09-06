"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  INVENTORY_PROCEDURE_SCOPE_OPTIONS,
  type InventoryProcedureScope,
  toInventoryProductFormValues,
} from "@/features/inventory/schemas/product.schema";
import { updateInventoryProduct } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ClassificationKey =
  | "is_drug"
  | "is_sundry"
  | "is_lab_test"
  | "is_radiology"
  | "is_procedure";

type ClassificationDraft = {
  is_drug: boolean;
  is_sundry: boolean;
  liquid_or_cream: boolean;
  is_lab_test: boolean;
  is_radiology: boolean;
  is_procedure: boolean;
  procedure_scope: "" | InventoryProcedureScope;
};

type EditProductClassificationDialogProps = {
  product: InventoryProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (product: InventoryProduct) => void;
};

const CLASSIFICATION_OPTIONS: Array<{
  key: ClassificationKey;
  label: string;
  description: string;
  requires: "storable" | "service";
}> = [
  {
    key: "is_drug",
    label: "Drug",
    description: "Medication or drug product.",
    requires: "storable",
  },
  {
    key: "is_sundry",
    label: "Sundry",
    description: "Non-drug consumable or supply item.",
    requires: "storable",
  },
  {
    key: "is_lab_test",
    label: "Lab",
    description: "Laboratory test service.",
    requires: "service",
  },
  {
    key: "is_radiology",
    label: "Radiology",
    description: "Imaging or radiology service.",
    requires: "service",
  },
  {
    key: "is_procedure",
    label: "Procedure",
    description: "Clinical procedure service.",
    requires: "service",
  },
];

function draftFromProduct(product: InventoryProduct): ClassificationDraft {
  const values = toInventoryProductFormValues(product);
  return {
    is_drug: values.is_drug,
    is_sundry: values.is_sundry,
    liquid_or_cream: values.liquid_or_cream,
    is_lab_test: values.is_lab_test,
    is_radiology: values.is_radiology,
    is_procedure: values.is_procedure,
    procedure_scope: values.procedure_scope,
  };
}

function isOptionAvailable(
  requires: "storable" | "service",
  productType: InventoryProduct["product_type"],
) {
  if (requires === "storable") {
    return productType === "product";
  }
  return productType === "service";
}

export function EditProductClassificationDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
}: EditProductClassificationDialogProps) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<ClassificationDraft>(() =>
    draftFromProduct(product),
  );
  const [expandedKey, setExpandedKey] = useState<ClassificationKey | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const next = draftFromProduct(product);
    setDraft(next);
    setFieldError(null);
    if (next.is_procedure) {
      setExpandedKey("is_procedure");
    } else if (next.is_drug) {
      setExpandedKey("is_drug");
    } else if (next.is_sundry) {
      setExpandedKey("is_sundry");
    } else if (next.is_lab_test) {
      setExpandedKey("is_lab_test");
    } else if (next.is_radiology) {
      setExpandedKey("is_radiology");
    } else {
      setExpandedKey(null);
    }
  }, [open, product]);

  const productTypeLabel = useMemo(() => {
    if (product.product_type === "service") {
      return "service";
    }
    if (product.product_type === "consu") {
      return "consumable";
    }
    return "storable";
  }, [product.product_type]);

  const toggleClassification = (key: ClassificationKey) => {
    setFieldError(null);
    setExpandedKey(key);
    setDraft((current) => {
      const turningOn = !current[key];
      const next: ClassificationDraft = {
        ...current,
        [key]: turningOn,
      };

      if (key === "is_drug") {
        if (turningOn) {
          next.is_sundry = false;
        } else {
          next.liquid_or_cream = false;
        }
      }

      if (key === "is_sundry") {
        if (turningOn) {
          next.is_drug = false;
        } else {
          next.liquid_or_cream = false;
        }
      }

      if (key === "is_lab_test" && turningOn) {
        next.is_radiology = false;
        next.is_procedure = false;
        next.procedure_scope = "";
      }

      if (key === "is_radiology" && turningOn) {
        next.is_lab_test = false;
        next.is_procedure = false;
        next.procedure_scope = "";
      }

      if (key === "is_procedure") {
        if (turningOn) {
          next.is_lab_test = false;
          next.is_radiology = false;
        } else {
          next.procedure_scope = "";
        }
      }

      if (!next.is_drug && !next.is_sundry) {
        next.liquid_or_cream = false;
      }

      return next;
    });
  };

  const handleSave = async () => {
    setFieldError(null);

    if (draft.is_procedure && !draft.procedure_scope) {
      setFieldError("Select a procedure scope.");
      setExpandedKey("is_procedure");
      return;
    }

    if (draft.liquid_or_cream && !draft.is_drug && !draft.is_sundry) {
      setFieldError("Liquid or cream requires drug or sundry.");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateInventoryProduct(product.uuid, {
        is_drug: draft.is_drug,
        is_sundry: draft.is_sundry,
        liquid_or_cream: draft.liquid_or_cream,
        is_lab_test: draft.is_lab_test,
        is_radiology: draft.is_radiology,
        is_procedure: draft.is_procedure,
        dental_only_procedure: draft.procedure_scope === "dental_only",
        opd_only_procedure: draft.procedure_scope === "opd_only",
        ipd_only_procedure: draft.procedure_scope === "ipd_only",
        physio_only_procedure: draft.procedure_scope === "physio_only",
        clinic_wide_procedure: draft.procedure_scope === "clinic_wide",
      });
      onUpdated(updated);
      onOpenChange(false);
      toast({
        title: "Classification saved",
        description: "Product classification was updated.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not save classification",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Unable to update product classification.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit classification"
      description={`Update how this ${productTypeLabel} product is classified for ordering and billing.`}
      className={appFont.className}
      data-testid="edit-product-classification-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving}
            onClick={() => void handleSave()}
            data-testid="edit-product-classification-save"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-3">
        {CLASSIFICATION_OPTIONS.map((option) => {
          const available = isOptionAvailable(option.requires, product.product_type);
          const selected = draft[option.key];
          const expanded = expandedKey === option.key;

          return (
            <div
              key={option.key}
              className={cn(
                "rounded-xl border transition-colors",
                selected
                  ? "border-brand-primary bg-brand-primary/5"
                  : "border-brand-border bg-white",
                !available && "opacity-50",
              )}
            >
              <button
                type="button"
                disabled={!available || isSaving}
                onClick={() => toggleClassification(option.key)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left"
                data-testid={`classification-option-${option.key}`}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-brand-primary bg-brand-primary"
                      : "border-brand-border bg-white",
                  )}
                  aria-hidden="true"
                >
                  {selected ? (
                    <span className="size-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-brand-navy">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-brand-muted">
                    {available
                      ? option.description
                      : `Available for ${option.requires} products only.`}
                  </span>
                </span>
              </button>

              {expanded && selected && option.key === "is_drug" ? (
                <div className="border-t border-brand-border/70 px-4 py-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium text-brand-navy">
                        Liquid or cream
                      </span>
                      <span className="mt-0.5 block text-xs text-brand-muted">
                        Mark if this drug is dispensed as a liquid or cream.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-brand-border"
                      checked={draft.liquid_or_cream}
                      disabled={isSaving}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          liquid_or_cream: event.target.checked,
                        }))
                      }
                      data-testid="classification-liquid-or-cream-drug"
                    />
                  </label>
                </div>
              ) : null}

              {expanded && selected && option.key === "is_sundry" ? (
                <div className="border-t border-brand-border/70 px-4 py-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-medium text-brand-navy">
                        Liquid or cream
                      </span>
                      <span className="mt-0.5 block text-xs text-brand-muted">
                        Mark if this sundry item is a liquid or cream.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-brand-border"
                      checked={draft.liquid_or_cream}
                      disabled={isSaving}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          liquid_or_cream: event.target.checked,
                        }))
                      }
                      data-testid="classification-liquid-or-cream-sundry"
                    />
                  </label>
                </div>
              ) : null}

              {expanded && selected && option.key === "is_procedure" ? (
                <div className="space-y-2 border-t border-brand-border/70 px-4 py-3">
                  <p className="text-xs font-medium text-brand-muted">
                    Procedure scope
                  </p>
                  <div
                    className="space-y-1.5"
                    role="radiogroup"
                    aria-label="Procedure scope"
                  >
                    {INVENTORY_PROCEDURE_SCOPE_OPTIONS.map((scope) => (
                      <label
                        key={scope.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
                          draft.procedure_scope === scope.value
                            ? "border-brand-primary bg-white"
                            : "border-brand-border/80 bg-white",
                        )}
                      >
                        <input
                          type="radio"
                          name="procedure-scope"
                          value={scope.value}
                          checked={draft.procedure_scope === scope.value}
                          disabled={isSaving}
                          onChange={() =>
                            setDraft((current) => ({
                              ...current,
                              procedure_scope: scope.value,
                            }))
                          }
                          data-testid={`classification-procedure-scope-${scope.value}`}
                        />
                        <span className="text-brand-navy">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {fieldError ? (
          <p className="text-xs text-destructive" data-testid="classification-error">
            {fieldError}
          </p>
        ) : null}
      </div>
    </SectionedDialog>
  );
}
