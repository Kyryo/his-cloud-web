"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  createCatalogPricelistRule,
  updateCatalogPricelistRule,
} from "@/features/catalog/services/catalog.service";
import type {
  CatalogPricelist,
  CatalogPricelistRule,
  CatalogPricelistRuleWritePayload,
  PricelistRuleType,
} from "@/features/catalog/types/catalog.types";
import { PricelistProductPicker } from "@/features/inventory/components/detail/PricelistProductPicker";
import { PricelistRuleAllProductsEmptyState } from "@/features/inventory/components/detail/PricelistRuleAllProductsEmptyState";
import { getErrorMessage } from "@/lib/fetch-error";
import { useToast } from "@/providers/toast-provider";

type PricelistRuleDialogProps = {
  pricelist: CatalogPricelist;
  rule: CatalogPricelistRule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type RuleDialogTab = "general" | "products";

type GeneralFieldErrors = {
  name?: string;
  ruleTypes?: string;
  formula?: string;
};

const RULE_TYPE_OPTIONS: Array<{ id: PricelistRuleType; label: string }> = [
  { id: "CO_PAYMENT", label: "Co-payment" },
  { id: "EXCESS", label: "Excess" },
  { id: "FORMULA", label: "Formula" },
];

function RequiredMark() {
  return <span className="text-red-500"> *</span>;
}

function buildInitialProducts(rule: CatalogPricelistRule | null) {
  return (
    rule?.product_uuids?.map((uuid, index) => ({
      uuid,
      label: rule.product_names?.[index] ?? uuid,
    })) ?? []
  );
}

function isGeneralTabComplete(
  name: string,
  ruleTypes: PricelistRuleType[],
  formula: string,
): boolean {
  if (!name.trim()) {
    return false;
  }

  if (ruleTypes.length === 0) {
    return false;
  }

  if (ruleTypes.includes("FORMULA") && !formula.trim()) {
    return false;
  }

  return true;
}

function collectGeneralFieldErrors(
  name: string,
  ruleTypes: PricelistRuleType[],
  formula: string,
): GeneralFieldErrors {
  const errors: GeneralFieldErrors = {};

  if (!name.trim()) {
    errors.name = "Name is required.";
  }

  if (ruleTypes.length === 0) {
    errors.ruleTypes = "Select at least one rule type.";
  }

  if (ruleTypes.includes("FORMULA") && !formula.trim()) {
    errors.formula = "Client liability formula is required.";
  }

  return errors;
}

type PricelistRuleDialogFormProps = PricelistRuleDialogProps;

function PricelistRuleDialogForm({
  pricelist,
  rule,
  open,
  onOpenChange,
  onSaved,
}: PricelistRuleDialogFormProps) {
  const { toast } = useToast();
  const isEditing = Boolean(rule);
  const [activeTab, setActiveTab] = useState<RuleDialogTab>("general");
  const [generalCompleted, setGeneralCompleted] = useState(isEditing);
  const [name, setName] = useState(rule?.name ?? "");
  const [scopeType, setScopeType] = useState<"ALL" | "PRODUCT">(
    rule?.scope_type ?? "ALL",
  );
  const [ruleTypes, setRuleTypes] = useState<PricelistRuleType[]>(
    rule?.rule_types ?? ["CO_PAYMENT", "FORMULA"],
  );
  const [formula, setFormula] = useState(rule?.client_liability_formula ?? "");
  const [insurerMaxAmount, setInsurerMaxAmount] = useState(
    rule?.insurer_max_amount ?? "",
  );
  const [isActive, setIsActive] = useState(rule?.is_active ?? true);
  const [selectedProducts, setSelectedProducts] = useState(() =>
    buildInitialProducts(rule),
  );
  const [fieldErrors, setFieldErrors] = useState<GeneralFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGeneralComplete = isGeneralTabComplete(name, ruleTypes, formula);

  function toggleRuleType(type: PricelistRuleType, checked: boolean) {
    setRuleTypes((current) => {
      if (checked) {
        return current.includes(type) ? current : [...current, type];
      }
      return current.filter((item) => item !== type);
    });
    setFieldErrors((current) => ({ ...current, ruleTypes: undefined }));
  }

  function validateGeneralTab(): boolean {
    const errors = collectGeneralFieldErrors(name, ruleTypes, formula);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        variant: "error",
        title: "Complete required fields",
        description: "Fill in all mandatory fields on the General tab before continuing.",
      });
      return false;
    }

    return true;
  }

  function tryNavigateToProductsTab(): boolean {
    if (!validateGeneralTab()) {
      return false;
    }

    setGeneralCompleted(true);
    setActiveTab("products");
    return true;
  }

  function handleProductSelect(membership: {
    product_uuid: string;
    product_name?: string;
  }) {
    if (selectedProducts.some((item) => item.uuid === membership.product_uuid)) {
      return;
    }

    setScopeType("PRODUCT");
    setSelectedProducts((current) => [
      ...current,
      {
        uuid: membership.product_uuid,
        label: membership.product_name?.trim() || membership.product_uuid,
      },
    ]);
  }

  function handleApplyToAllProducts() {
    setScopeType("ALL");
    setSelectedProducts([]);
  }

  function buildPayload(): CatalogPricelistRuleWritePayload {
    return {
      name: name.trim(),
      scope_type: scopeType,
      rule_types: ruleTypes,
      client_liability_formula: formula.trim(),
      insurer_max_amount: insurerMaxAmount.trim() ? insurerMaxAmount.trim() : null,
      is_active: isActive,
      product_uuids:
        scopeType === "PRODUCT" ? selectedProducts.map((item) => item.uuid) : [],
    };
  }

  async function handleSubmit() {
    if (!validateGeneralTab()) {
      setActiveTab("general");
      return;
    }

    if (scopeType === "PRODUCT" && selectedProducts.length === 0) {
      toast({
        variant: "error",
        title: "Select at least one product",
        description: "Add products to the rule scope or apply it to all products.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (rule) {
        await updateCatalogPricelistRule(pricelist.uuid, rule.uuid, payload);
        toast({
          variant: "success",
          title: "Rule updated",
          description: "Payment rule changes were saved.",
        });
      } else {
        await createCatalogPricelistRule(pricelist.uuid, payload);
        toast({
          variant: "success",
          title: "Rule created",
          description: "The payment rule is now active on this pricelist.",
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: rule ? "Could not update rule" : "Could not create rule",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const tabs = [
    { id: "general", label: "General" },
    {
      id: "products",
      label: "Products",
      disabled: !isEditing && !generalCompleted,
    },
  ];

  function renderFooter() {
    if (activeTab === "general") {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting || !isGeneralComplete}
            onClick={tryNavigateToProductsTab}
            data-testid="pricelist-rule-complete-general"
          >
            Continue
          </PrimaryButton>
        </>
      );
    }

    return (
      <>
        <SecondaryButton
          type="button"
          disabled={isSubmitting}
          onClick={() => setActiveTab("general")}
        >
          Back
        </SecondaryButton>
        <PrimaryButton
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
          data-testid="pricelist-rule-save"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save rule"
          )}
        </PrimaryButton>
      </>
    );
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={rule ? "Edit payment rule" : "Add payment rule"}
      description="Define how insurer and client shares are calculated for products on this pricelist."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "general") {
          setActiveTab("general");
          return;
        }

        if (tabId === "products") {
          if (!isEditing && !generalCompleted) {
            tryNavigateToProductsTab();
            return;
          }

          if (!validateGeneralTab()) {
            return;
          }

          setActiveTab("products");
        }
      }}
      footer={renderFooter()}
      data-testid="pricelist-rule-dialog"
    >
      {activeTab === "general" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name">
              Name
              <RequiredMark />
            </Label>
            <Input
              id="rule-name"
              value={name}
              aria-invalid={Boolean(fieldErrors.name)}
              onChange={(event) => {
                setName(event.target.value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="Corporate co-pay"
            />
            {fieldErrors.name ? (
              <p className="text-xs text-red-600">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>
              Rule types
              <RequiredMark />
            </Label>
            <div className="space-y-2">
              {RULE_TYPE_OPTIONS.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ruleTypes.includes(option.id)}
                    onChange={(event) =>
                      toggleRuleType(option.id, event.target.checked)
                    }
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {fieldErrors.ruleTypes ? (
              <p className="text-xs text-red-600">{fieldErrors.ruleTypes}</p>
            ) : null}
          </div>

          {ruleTypes.includes("FORMULA") ? (
            <div className="space-y-2">
              <Label htmlFor="rule-formula">
                Client liability formula
                <RequiredMark />
              </Label>
              <Textarea
                id="rule-formula"
                value={formula}
                aria-invalid={Boolean(fieldErrors.formula)}
                onChange={(event) => {
                  setFormula(event.target.value);
                  setFieldErrors((current) => ({ ...current, formula: undefined }));
                }}
                rows={3}
                placeholder="(list_price - pricelist_amount) + (pricelist_amount * 0.10)"
              />
              <p className="text-xs text-brand-muted">
                Variables: list_price, pricelist_amount, insurer_max_amount
              </p>
              {fieldErrors.formula ? (
                <p className="text-xs text-red-600">{fieldErrors.formula}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="rule-insurer-max">Insurer max amount (optional)</Label>
            <Input
              id="rule-insurer-max"
              type="number"
              min="0"
              step="any"
              value={insurerMaxAmount}
              onChange={(event) => setInsurerMaxAmount(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-border px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="rule-active" className="text-base">
                Active
              </Label>
              <p className="text-xs text-brand-muted">
                Inactive rules are ignored when calculating payment splits.
              </p>
            </div>
            <Switch
              id="rule-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              data-testid="pricelist-rule-active-switch"
            />
          </div>
        </div>
      ) : null}

      {activeTab === "products" ? (
        <div className="space-y-4">
          {scopeType === "ALL" ? (
            <PricelistRuleAllProductsEmptyState
              onLimitToSpecific={() => setScopeType("PRODUCT")}
            />
          ) : (
            <>
              <PricelistProductPicker
                pricelistUuid={pricelist.uuid}
                excludeProductUuids={selectedProducts.map((item) => item.uuid)}
                disabled={isSubmitting}
                onProductSelect={handleProductSelect}
              />

              {selectedProducts.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Selected products</Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-brand-primary hover:underline"
                      onClick={handleApplyToAllProducts}
                    >
                      Apply to all products
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {selectedProducts.map((product) => (
                      <li
                        key={product.uuid}
                        className="flex items-center justify-between rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-slate"
                      >
                        <span>{product.label}</span>
                        <button
                          type="button"
                          className="text-xs text-brand-muted hover:text-red-600"
                          onClick={() => {
                            const next = selectedProducts.filter(
                              (item) => item.uuid !== product.uuid,
                            );
                            setSelectedProducts(next);
                            if (next.length === 0) {
                              setScopeType("ALL");
                            }
                          }}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-brand-muted">
                  Search and add products that should follow this rule.
                </p>
              )}
            </>
          )}
        </div>
      ) : null}
    </TabbedDialog>
  );
}

export function PricelistRuleDialog(props: PricelistRuleDialogProps) {
  const formKey = props.open ? (props.rule?.uuid ?? "new") : "closed";

  return <PricelistRuleDialogForm key={formKey} {...props} />;
}
