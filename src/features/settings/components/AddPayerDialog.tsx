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
import { createOrganizationPayer } from "@/features/settings/services/settings.service";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type AddPayerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (payer: OrganizationPayer) => void;
};

const tabs = [
  { id: "general", label: "General" },
  { id: "contact", label: "Contact" },
];

export function AddPayerDialog({
  open,
  onOpenChange,
  onCreated,
}: AddPayerDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PayerDialogTab>("general");

  const form = useForm<CreateOrganizationPayerFormValues>({
    resolver: zodResolver(createOrganizationPayerSchema),
    defaultValues: createOrganizationPayerDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      setActiveTab("general");
      form.reset(createOrganizationPayerDefaultValues);
    }
  }, [form, open]);

  async function handleSubmit(values: CreateOrganizationPayerFormValues) {
    try {
      const payer = await createOrganizationPayer(
        toCreateOrganizationPayerPayload(values),
      );
      toast({
        variant: "success",
        title: "Payer added",
        description: `${payer.name} was created successfully.`,
      });
      form.reset(createOrganizationPayerDefaultValues);
      setActiveTab("general");
      onCreated(payer);
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
          title: "Could not add payer",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add payer",
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
      title="Add payer"
      description="Create an insurance company that can offer schemes to your patients. Optionally link it to the country payer registry."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "general" || tabId === "contact") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="add-payer-dialog"
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
            form="add-payer-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Add payer"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id="add-payer-form"
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
