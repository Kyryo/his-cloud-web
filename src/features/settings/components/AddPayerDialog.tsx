"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { Form } from "@/components/ui/form";
import { TabAddActionButton } from "@/components/ui/app-buttons";
import { SetupSaveActions } from "@/components/ui/setup-save-actions";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { useOnboardingReturn } from "@/features/overview/hooks/use-onboarding-return";
import { AddPayerSchemeDialog } from "@/features/settings/components/AddPayerSchemeDialog";
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
import {
  createOrganizationPayer,
  fetchOrganizationPayerSchemes,
} from "@/features/settings/services/settings.service";
import type {
  OrganizationPayer,
  OrganizationPayerScheme,
} from "@/features/settings/types/settings.types";
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
  { id: "schemes", label: "Schemes" },
];

export function AddPayerDialog({
  open,
  onOpenChange,
  onCreated,
}: AddPayerDialogProps) {
  const { toast } = useToast();
  const { finishSetup } = useOnboardingReturn();
  const addAnotherRef = useRef(false);
  const [activeTab, setActiveTab] = useState<PayerDialogTab>("general");
  const [createdPayer, setCreatedPayer] = useState<OrganizationPayer | null>(null);
  const [schemes, setSchemes] = useState<OrganizationPayerScheme[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false);

  const form = useForm<CreateOrganizationPayerFormValues>({
    resolver: zodResolver(createOrganizationPayerSchema),
    defaultValues: createOrganizationPayerDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      setActiveTab("general");
      setCreatedPayer(null);
      setSchemes([]);
      setSchemeDialogOpen(false);
      form.reset(createOrganizationPayerDefaultValues);
    }
  }, [form, open]);

  useEffect(() => {
    if (!open || !createdPayer || activeTab !== "schemes") {
      return;
    }

    let active = true;
    setSchemesLoading(true);
    void fetchOrganizationPayerSchemes()
      .then((all) => {
        if (!active || !createdPayer) {
          return;
        }
        setSchemes(
          all.filter((scheme) => scheme.insurance_company === createdPayer.id),
        );
      })
      .catch(() => {
        if (active) {
          setSchemes([]);
        }
      })
      .finally(() => {
        if (active) {
          setSchemesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeTab, createdPayer, open, schemeDialogOpen]);

  function rememberPayer(payer: OrganizationPayer) {
    setCreatedPayer(payer);
    onCreated(payer);
  }

  async function createPayerFromForm() {
    const valid = await form.trigger();
    if (!valid) {
      const invalidFields = (
        Object.keys(
          createOrganizationPayerDefaultValues,
        ) as (keyof CreateOrganizationPayerFormValues)[]
      ).filter((name) => Boolean(form.getFieldState(name).error));
      setActiveTab((current) => payerTabForFieldErrors(invalidFields, current));
      return null;
    }

    try {
      const payer = await createOrganizationPayer(
        toCreateOrganizationPayerPayload(form.getValues()),
      );
      rememberPayer(payer);
      toast({
        variant: "success",
        title: "Payer added",
        description: `${payer.name} was created successfully.`,
      });
      return payer;
    } catch (error) {
      reportCreateError(error);
      return null;
    }
  }

  function reportCreateError(error: unknown) {
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
      description: error instanceof Error ? error.message : "Something went wrong.",
    });
  }

  async function handleSubmit(values: CreateOrganizationPayerFormValues) {
    const addAnother = addAnotherRef.current;
    addAnotherRef.current = false;

    if (!createdPayer) {
      try {
        const payer = await createOrganizationPayer(
          toCreateOrganizationPayerPayload(values),
        );
        rememberPayer(payer);
        toast({
          variant: "success",
          title: "Payer added",
          description: `${payer.name} was created successfully.`,
        });
      } catch (error) {
        reportCreateError(error);
        return;
      }
    }

    if (addAnother) {
      form.reset(createOrganizationPayerDefaultValues);
      setCreatedPayer(null);
      setSchemes([]);
      setActiveTab("general");
      return;
    }

    form.reset(createOrganizationPayerDefaultValues);
    setCreatedPayer(null);
    setSchemes([]);
    setActiveTab("general");
    onOpenChange(false);
    finishSetup();
  }

  async function handleAddScheme() {
    const payer = createdPayer ?? (await createPayerFromForm());
    if (!payer) {
      return;
    }
    setActiveTab("schemes");
    setSchemeDialogOpen(true);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <TabbedDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Add payer"
        description="Create an insurance company that can offer schemes to your patients. Optionally link it to the country payer registry."
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          if (tabId === "general" || tabId === "contact" || tabId === "schemes") {
            setActiveTab(tabId);
          }
        }}
        className={appFont.className}
        data-testid="add-payer-dialog"
        footer={
          <SetupSaveActions
            formId="add-payer-form"
            open={open}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            onIntent={(addAnother) => {
              addAnotherRef.current = addAnother;
            }}
          />
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
              disabled={isSubmitting || Boolean(createdPayer)}
            />
          </form>
        </Form>
        {activeTab === "schemes" ? (
          schemesLoading ? (
            <p className="text-sm text-slate-400">Loading schemes...</p>
          ) : schemes.length === 0 ? (
            <DetailTabEmptyState
              icon={Layers}
              title="No schemes yet"
              description="Add a plan when this payer offers a named scheme."
              data-testid="add-payer-schemes-empty"
              action={
                <TabAddActionButton type="button" emptyState onClick={() => void handleAddScheme()}>
                  Add scheme
                </TabAddActionButton>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <TabAddActionButton type="button" onClick={() => void handleAddScheme()}>
                  Add scheme
                </TabAddActionButton>
              </div>
              <ul className="divide-y divide-brand-border">
                {schemes.map((scheme) => (
                  <li key={scheme.uuid} className="py-3.5">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {scheme.name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">{scheme.code}</p>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}
      </TabbedDialog>
      {createdPayer ? (
        <AddPayerSchemeDialog
          open={schemeDialogOpen}
          onOpenChange={setSchemeDialogOpen}
          payers={[createdPayer]}
          onCreated={(scheme) => {
            setSchemes((current) => [...current, scheme]);
          }}
        />
      ) : null}
    </>
  );
}
