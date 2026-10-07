"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import {
  PayerDialogFields,
  payerTabForFieldErrors,
  type PayerDialogTab,
} from "@/features/settings/components/PayerDialogFields";
import {
  createOrganizationPayerDefaultValues,
  createOrganizationPayerSchema,
  toCreateOrganizationPayerPayload,
  type CreateOrganizationPayerFormValues,
} from "@/features/settings/schemas/organization-payer.schema";
import { updateOrganizationPayer } from "@/features/settings/services/settings.service";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type EditPayerDialogProps = {
  payer: OrganizationPayer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (payer: OrganizationPayer) => void;
};

const tabs = [
  { id: "general", label: "General" },
  { id: "contact", label: "Contact" },
];

function toFormValues(payer: OrganizationPayer): CreateOrganizationPayerFormValues {
  return {
    name: payer.name,
    code: payer.code,
    description: payer.description ?? "",
    email: payer.email ?? "",
    phone_number: payer.phone_number ?? "",
    address: payer.address ?? "",
    registry_payer: payer.registry_payer ?? null,
  };
}

export function EditPayerDialog({
  payer,
  open,
  onOpenChange,
  onUpdated,
}: EditPayerDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PayerDialogTab>("general");

  const form = useForm<CreateOrganizationPayerFormValues>({
    resolver: zodResolver(createOrganizationPayerSchema),
    defaultValues: createOrganizationPayerDefaultValues,
  });

  useEffect(() => {
    if (open && payer) {
      setActiveTab("general");
      form.reset(toFormValues(payer));
    }
  }, [form, open, payer]);

  async function handleSubmit(values: CreateOrganizationPayerFormValues) {
    if (!payer) {
      return;
    }

    try {
      const updated = await updateOrganizationPayer(payer.uuid, {
        ...toCreateOrganizationPayerPayload(values),
        is_active: payer.is_active,
      });
      toast({
        variant: "success",
        title: "Payer updated",
        description: `${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createOrganizationPayerDefaultValues) {
            form.setError(field as keyof CreateOrganizationPayerFormValues, {
              message,
            });
          }
        }
        setActiveTab((current) =>
          payerTabForFieldErrors(Object.keys(fieldErrors), current),
        );
        toast({
          variant: "error",
          title: "Could not update payer",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update payer",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit payer"
      description={`Update the details for ${payer?.name ?? "this payer"}.`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "general" || tabId === "contact") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="edit-payer-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form="edit-payer-form"
            disabled={isSubmitting || !payer}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save payer"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id="edit-payer-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            setActiveTab((current) =>
              payerTabForFieldErrors(Object.keys(errors), current),
            );
          })}
        >
          <PayerDialogFields
            form={form}
            activeTab={activeTab}
            disabled={isSubmitting}
          />
        </form>
      </Form>
    </TabbedDialog>
  );
}
