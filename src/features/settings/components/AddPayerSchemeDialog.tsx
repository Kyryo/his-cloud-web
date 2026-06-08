"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { AddPayerSchemeGeneralFields } from "@/features/settings/components/AddPayerSchemeGeneralFields";
import { AddPayerSchemePricelistFields } from "@/features/settings/components/AddPayerSchemePricelistFields";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import {
  createOrganizationPayerSchemeDefaultValues,
  createOrganizationPayerSchemeSchema,
  toCreateOrganizationPayerSchemePayload,
  type CreateOrganizationPayerSchemeFormValues,
} from "@/features/settings/schemas/organization-payer-scheme.schema";
import { createOrganizationPayerScheme } from "@/features/settings/services/settings.service";
import type {
  OrganizationPayer,
  OrganizationPayerScheme,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type AddPayerSchemeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payers: OrganizationPayer[];
  onCreated: (scheme: OrganizationPayerScheme) => void;
};

type AddPayerSchemeTab = "general" | "pricelist";

const generalFieldNames = [
  "insurance_company",
  "name",
  "code",
  "description",
] as const;

export function AddPayerSchemeDialog({
  open,
  onOpenChange,
  payers,
  onCreated,
}: AddPayerSchemeDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AddPayerSchemeTab>("general");

  const form = useForm<CreateOrganizationPayerSchemeFormValues>({
    resolver: zodResolver(createOrganizationPayerSchemeSchema),
    defaultValues: createOrganizationPayerSchemeDefaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;

  const resetDialogState = useCallback(() => {
    setActiveTab("general");
    form.reset(createOrganizationPayerSchemeDefaultValues);
  }, [form]);

  useEffect(() => {
    if (!open) {
      resetDialogState();
      return;
    }

    if (payers.length === 1) {
      form.setValue("insurance_company", String(payers[0].id));
    }
  }, [form, open, payers, resetDialogState]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialogState();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: CreateOrganizationPayerSchemeFormValues) {
    try {
      const scheme = await createOrganizationPayerScheme(
        toCreateOrganizationPayerSchemePayload(values),
      );
      toast({
        variant: "success",
        title: "Payer scheme added",
        description: values.create_corresponding_pricelist
          ? `${scheme.name} was created with a linked ERP pricelist.`
          : `${scheme.name} was created. Attach a pricelist later to activate billing.`,
      });
      resetDialogState();
      onCreated(scheme);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createOrganizationPayerSchemeDefaultValues) {
            form.setError(field as keyof CreateOrganizationPayerSchemeFormValues, {
              message,
            });
          }
        }

        const hasGeneralError = generalFieldNames.some((field) => field in fieldErrors);
        if (hasGeneralError) {
          setActiveTab("general");
        }

        toast({
          variant: "error",
          title: "Could not add payer scheme",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add payer scheme",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleContinueToPricelist() {
    const isValid = await form.trigger([...generalFieldNames]);
    if (isValid) {
      setActiveTab("pricelist");
    }
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "pricelist", label: "Pricelist" },
  ];

  function renderFooter() {
    if (activeTab === "general") {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting || payers.length === 0}
            onClick={() => void handleContinueToPricelist()}
            data-testid="add-payer-scheme-continue"
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
          type="submit"
          form="add-payer-scheme-form"
          disabled={isSubmitting || payers.length === 0}
          data-testid="add-payer-scheme-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Add scheme"
          )}
        </PrimaryButton>
      </>
    );
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add payer scheme"
      description="Create an insurance scheme, then confirm whether to provision a linked ERP pricelist."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "general" || tabId === "pricelist") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="add-payer-scheme-dialog"
      footer={renderFooter()}
    >
      <Form {...form}>
        <form
          id="add-payer-scheme-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            const hasGeneralError = generalFieldNames.some((field) => errors[field]);
            if (hasGeneralError) {
              setActiveTab("general");
            }
          })}
        >
          {activeTab === "general" ? (
            <AddPayerSchemeGeneralFields form={form} payers={payers} />
          ) : null}

          {activeTab === "pricelist" ? (
            <AddPayerSchemePricelistFields form={form} />
          ) : null}
        </form>
      </Form>
    </TabbedDialog>
  );
}
