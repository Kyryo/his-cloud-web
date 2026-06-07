"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { CustomerAddressFormFields } from "@/features/customers/components/CustomerAddressFormFields";
import { CustomerFormFields } from "@/features/customers/components/CustomerFormFields";
import { CustomerInsuranceFormFields } from "@/features/customers/components/CustomerInsuranceFormFields";
import { CustomerNoteFormFields } from "@/features/customers/components/CustomerNoteFormFields";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import {
  createCustomerAddressDefaultValues,
  createCustomerAddressSchema,
  toCustomerAddressPayload,
  type CreateCustomerAddressFormValues,
} from "@/features/customers/schemas/customer-address.schema";
import {
  createCustomerInsuranceDefaultValues,
  createCustomerInsuranceSchema,
  toCustomerInsurancePayload,
  type CreateCustomerInsuranceFormValues,
} from "@/features/customers/schemas/customer-insurance.schema";
import {
  createCustomerNoteDefaultValues,
  createCustomerNoteSchema,
  toCustomerNotePayload,
  type CreateCustomerNoteFormValues,
} from "@/features/customers/schemas/customer-note.schema";
import {
  createCustomerDefaultValues,
  createCustomerSchema,
  toCustomerWritePayload,
  type CreateCustomerFormValues,
} from "@/features/customers/schemas/customer.schema";
import { createCustomerAddress } from "@/features/customers/services/customer-addresses.service";
import { createCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { createCustomerNote } from "@/features/customers/services/customer-notes.service";
import { createCustomer } from "@/features/customers/services/customers.service";
import { fetchInsuranceSchemes } from "@/features/customers/services/insurance-schemes.service";
import type { Customer } from "@/features/customers/types/customer.types";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreateCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Customer) => void;
};

type CreateCustomerTab =
  | "personal"
  | "insurance"
  | "address"
  | "notes";

function getCustomerDisplayName(customer: Customer) {
  return (
    customer.full_name ||
    [customer.first_name, customer.middle_name, customer.last_name]
      .filter(Boolean)
      .join(" ")
  );
}

export function CreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCustomerDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CreateCustomerTab>("personal");
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [schemes, setSchemes] = useState<InsuranceScheme[]>([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);

  const personalForm = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: createCustomerDefaultValues,
  });

  const insuranceForm = useForm<CreateCustomerInsuranceFormValues>({
    resolver: zodResolver(createCustomerInsuranceSchema),
    defaultValues: createCustomerInsuranceDefaultValues,
  });

  const addressForm = useForm<CreateCustomerAddressFormValues>({
    resolver: zodResolver(createCustomerAddressSchema),
    defaultValues: createCustomerAddressDefaultValues,
  });

  const notesForm = useForm<CreateCustomerNoteFormValues>({
    resolver: zodResolver(createCustomerNoteSchema),
    defaultValues: createCustomerNoteDefaultValues,
  });

  const isCustomerCreated = Boolean(createdCustomer);
  const isCreatingCustomer = personalForm.formState.isSubmitting;
  const isSavingInsurance = insuranceForm.formState.isSubmitting;
  const isSavingAddress = addressForm.formState.isSubmitting;
  const isSavingNote = notesForm.formState.isSubmitting;
  const isBusy =
    isCreatingCustomer ||
    isSavingInsurance ||
    isSavingAddress ||
    isSavingNote;

  const customerFullName = useMemo(() => {
    if (createdCustomer) {
      return getCustomerDisplayName(createdCustomer);
    }

    const values = personalForm.getValues();
    return [values.first_name, values.middle_name, values.last_name]
      .filter(Boolean)
      .join(" ");
  }, [createdCustomer, personalForm]);

  const resetDialogState = useCallback(() => {
    setActiveTab("personal");
    setCreatedCustomer(null);
    setSchemes([]);
    setIsLoadingSchemes(false);
    personalForm.reset(createCustomerDefaultValues);
    insuranceForm.reset(createCustomerInsuranceDefaultValues);
    addressForm.reset(createCustomerAddressDefaultValues);
    notesForm.reset(createCustomerNoteDefaultValues);
  }, [addressForm, insuranceForm, notesForm, personalForm]);

  useEffect(() => {
    if (!open) {
      resetDialogState();
    }
  }, [open, resetDialogState]);

  const loadInsuranceSchemes = useCallback(async () => {
    if (schemes.length > 0) {
      return;
    }

    try {
      setIsLoadingSchemes(true);
      const nextSchemes = await fetchInsuranceSchemes();
      setSchemes(nextSchemes);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load insurance schemes",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsLoadingSchemes(false);
    }
  }, [schemes.length, toast]);

  useEffect(() => {
    if (open && activeTab === "insurance" && isCustomerCreated) {
      void loadInsuranceSchemes();
    }
  }, [activeTab, isCustomerCreated, loadInsuranceSchemes, open]);

  function finalizeCreatedCustomer(customer: Customer) {
    resetDialogState();
    onCreated(customer);
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (createdCustomer) {
        finalizeCreatedCustomer(createdCustomer);
        return;
      }

      resetDialogState();
    }

    onOpenChange(nextOpen);
  }

  async function handleCreateCustomer(values: CreateCustomerFormValues) {
    try {
      const customer = await createCustomer(toCustomerWritePayload(values));
      setCreatedCustomer(customer);
      setActiveTab("insurance");
      toast({
        variant: "success",
        title: "Client created",
        description: `${getCustomerDisplayName(customer)} was added. You can add insurance, address, and notes next.`,
      });
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createCustomerDefaultValues) {
            personalForm.setError(field as keyof CreateCustomerFormValues, {
              message,
            });
          }
        }

        toast({
          variant: "error",
          title: "Could not create client",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create client",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleSaveInsurance(values: CreateCustomerInsuranceFormValues) {
    if (!createdCustomer) {
      return;
    }

    try {
      await createCustomerInsurance(
        createdCustomer.uuid,
        toCustomerInsurancePayload(values),
      );
      toast({
        variant: "success",
        title: "Insurance added",
        description: "Insurance details were saved for this client.",
      });
      insuranceForm.reset(createCustomerInsuranceDefaultValues);
      setActiveTab("address");
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createCustomerInsuranceDefaultValues) {
            insuranceForm.setError(
              field as keyof CreateCustomerInsuranceFormValues,
              { message },
            );
          }
        }

        toast({
          variant: "error",
          title: "Could not add insurance",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add insurance",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleSaveAddress(values: CreateCustomerAddressFormValues) {
    if (!createdCustomer) {
      return;
    }

    try {
      await createCustomerAddress(
        toCustomerAddressPayload(createdCustomer.id, values),
      );
      toast({
        variant: "success",
        title: "Address added",
        description: "Address details were saved for this client.",
      });
      setActiveTab("notes");
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createCustomerAddressDefaultValues) {
            addressForm.setError(field as keyof CreateCustomerAddressFormValues, {
              message,
            });
          }
        }

        toast({
          variant: "error",
          title: "Could not add address",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add address",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleSaveNote(values: CreateCustomerNoteFormValues) {
    if (!createdCustomer) {
      return;
    }

    try {
      await createCustomerNote(
        toCustomerNotePayload(createdCustomer.id, values),
      );
      toast({
        variant: "success",
        title: "Note added",
        description: "The note was saved for this client.",
      });
      finalizeCreatedCustomer(createdCustomer);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createCustomerNoteDefaultValues) {
            notesForm.setError(field as keyof CreateCustomerNoteFormValues, {
              message,
            });
          }
        }

        toast({
          variant: "error",
          title: "Could not add note",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add note",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "insurance", label: "Insurance", disabled: !isCustomerCreated },
    { id: "address", label: "Address", disabled: !isCustomerCreated },
    { id: "notes", label: "Notes", disabled: !isCustomerCreated },
  ];

  function renderFooter() {
    if (activeTab === "personal" && !isCustomerCreated) {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={isBusy}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form="create-customer-personal-form"
            disabled={isBusy}
            data-testid="create-customer-submit"
          >
            {isCreatingCustomer ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create client"
            )}
          </PrimaryButton>
        </>
      );
    }

    if (activeTab === "personal" && isCustomerCreated) {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={isBusy}
            onClick={() => createdCustomer && finalizeCreatedCustomer(createdCustomer)}
          >
            Finish
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isBusy}
            onClick={() => setActiveTab("insurance")}
          >
            Add insurance
          </PrimaryButton>
        </>
      );
    }

    if (activeTab === "insurance") {
      const hasInsuranceSchemes = !isLoadingSchemes && schemes.length > 0;

      return (
        <>
          <SecondaryButton
            type="button"
            disabled={isBusy}
            onClick={() => setActiveTab("address")}
          >
            {hasInsuranceSchemes ? "Skip for now" : "Continue without insurance"}
          </SecondaryButton>
          {hasInsuranceSchemes ? (
            <PrimaryButton
              type="submit"
              form="create-customer-insurance-form"
              disabled={isBusy || isLoadingSchemes}
              data-testid="create-customer-insurance-submit"
            >
              {isSavingInsurance ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Add insurance"
              )}
            </PrimaryButton>
          ) : null}
        </>
      );
    }

    if (activeTab === "address") {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={isBusy}
            onClick={() => setActiveTab("notes")}
          >
            Skip for now
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form="create-customer-address-form"
            disabled={isBusy}
            data-testid="create-customer-address-submit"
          >
            {isSavingAddress ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Add address"
            )}
          </PrimaryButton>
        </>
      );
    }

    return (
      <>
        <SecondaryButton
          type="button"
          disabled={isBusy}
          onClick={() => createdCustomer && finalizeCreatedCustomer(createdCustomer)}
        >
          Skip for now
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          form="create-customer-notes-form"
          disabled={isBusy}
          data-testid="create-customer-notes-submit"
        >
          {isSavingNote ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Add note"
          )}
        </PrimaryButton>
      </>
    );
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Add client"
      description="Create a new client record, then optionally add insurance, address, and notes."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (
          tabId === "personal" ||
          tabId === "insurance" ||
          tabId === "address" ||
          tabId === "notes"
        ) {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="create-customer-dialog"
      footer={renderFooter()}
    >
      {activeTab === "personal" ? (
        <Form {...personalForm}>
          <form
            id="create-customer-personal-form"
            className="space-y-4"
            onSubmit={personalForm.handleSubmit(handleCreateCustomer)}
            data-testid="create-customer-form"
          >
            {isCustomerCreated ? (
              <p
                className="rounded-lg border border-brand-primary/30 bg-brand-tint px-3 py-2.5 text-sm text-brand-slate"
                data-testid="create-customer-locked-notice"
              >
                Client created. Personal details are locked while you add
                insurance, address, and notes.
              </p>
            ) : null}
            <CustomerFormFields
              form={personalForm}
              isSubmitting={isCreatingCustomer}
              fieldsDisabled={isCustomerCreated}
              idPrefix="create-customer"
            />
          </form>
        </Form>
      ) : null}

      {activeTab === "insurance" && isCustomerCreated ? (
        <Form {...insuranceForm}>
          <form
            id="create-customer-insurance-form"
            className="space-y-4"
            onSubmit={insuranceForm.handleSubmit(handleSaveInsurance)}
            data-testid="create-customer-insurance-form"
          >
            <CustomerInsuranceFormFields
              form={insuranceForm}
              schemes={schemes}
              isLoadingSchemes={isLoadingSchemes}
              isSubmitting={isSavingInsurance}
              customerFullName={customerFullName}
            />
          </form>
        </Form>
      ) : null}

      {activeTab === "address" && isCustomerCreated ? (
        <Form {...addressForm}>
          <form
            id="create-customer-address-form"
            className="space-y-4"
            onSubmit={addressForm.handleSubmit(handleSaveAddress)}
            data-testid="create-customer-address-form"
          >
            <CustomerAddressFormFields
              form={addressForm}
              isSubmitting={isSavingAddress}
            />
          </form>
        </Form>
      ) : null}

      {activeTab === "notes" && isCustomerCreated ? (
        <Form {...notesForm}>
          <form
            id="create-customer-notes-form"
            className="space-y-4"
            onSubmit={notesForm.handleSubmit(handleSaveNote)}
            data-testid="create-customer-notes-form"
          >
            <CustomerNoteFormFields
              form={notesForm}
              isSubmitting={isSavingNote}
            />
          </form>
        </Form>
      ) : null}
    </TabbedDialog>
  );
}
