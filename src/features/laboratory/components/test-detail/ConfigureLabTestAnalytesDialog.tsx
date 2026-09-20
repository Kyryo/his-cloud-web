"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ListPageBlankState } from "@/features/app-shell/components/page-layout";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  NextStepOptionsList,
  type NextStepOption,
} from "@/components/ui/next-step-options-list";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { AnalyteCodedOptionsEditor } from "@/features/laboratory/components/catalog/AnalyteCodedOptionsEditor";
import { AnalyteFields } from "@/features/laboratory/components/catalog/AnalyteDialogs";
import {
  TestAnalyteMembershipEditor,
  type TestAnalyteMembershipValue,
} from "@/features/laboratory/components/catalog/TestAnalyteMembershipEditor";
import {
  ANALYTE_VALUE_TYPES,
  analyteDefaultValues,
  analyteSchema,
  type AnalyteFormValues,
} from "@/features/laboratory/schemas/analyte.schema";
import {
  createLabAnalyte,
  fetchLabAnalytes,
  updateLabTest,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type {
  LabAnalyte,
  LabAnalyteValueType,
  LabTestDefinition,
} from "@/features/laboratory/types/laboratory-catalog.types";
import { toAnalytePayload } from "@/features/laboratory/utils/catalog-payloads";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

const ADD_ANALYTE_FORM_ID = "configure-test-add-analyte-form";

type DialogTabId = "details" | "value" | "options";
type DetailsMode = "create" | "select";

type ConfigureLabTestAnalytesDialogProps = {
  test: LabTestDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (test: LabTestDefinition) => void;
};

const VALUE_TYPE_COPY: Record<
  LabAnalyteValueType,
  { title: string; description: string; icon: NextStepOption["icon"] }
> = {
  NUMERIC: {
    title: "Numeric",
    description: "Measured values with unit and decimal precision.",
    icon: "analytics",
  },
  TEXT: {
    title: "Text",
    description: "Free-text results without coded choices or units.",
    icon: "file",
  },
  CODED: {
    title: "Coded",
    description: "Results chosen from a fixed list of codes and labels.",
    icon: "tag",
  },
};

function membershipFromTest(
  test: LabTestDefinition,
): TestAnalyteMembershipValue[] {
  return [...(test.analytes ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row, index) => ({
      analyte_uuid: row.analyte_uuid,
      sort_order: row.sort_order ?? index,
      is_required: row.is_required,
    }));
}

function reindex(
  rows: TestAnalyteMembershipValue[],
): TestAnalyteMembershipValue[] {
  return rows.map((row, index) => ({ ...row, sort_order: index }));
}

function toMembershipPayload(rows: TestAnalyteMembershipValue[]) {
  return rows.map((row, index) => ({
    analyte_uuid: row.analyte_uuid,
    sort_order: row.sort_order ?? index,
    is_required: row.is_required,
  }));
}

export function ConfigureLabTestAnalytesDialog({
  test,
  open,
  onOpenChange,
  onUpdated,
}: ConfigureLabTestAnalytesDialogProps) {
  const { toast } = useToast();
  const [catalogAnalytes, setCatalogAnalytes] = useState<LabAnalyte[]>([]);
  const [value, setValue] = useState<TestAnalyteMembershipValue[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DialogTabId>("details");
  const [detailsMode, setDetailsMode] = useState<DetailsMode | null>(null);
  const [valueTypeChosen, setValueTypeChosen] = useState(false);

  const addForm = useForm<AnalyteFormValues>({
    resolver: zodResolver(analyteSchema),
    defaultValues: analyteDefaultValues,
  });

  const valueType = useWatch({
    control: addForm.control,
    name: "value_type",
  }) as LabAnalyteValueType;
  const hasCatalogAnalytes = catalogAnalytes.length > 0;
  const isCoded = valueTypeChosen && valueType === "CODED";
  const isNumeric = valueTypeChosen && valueType === "NUMERIC";
  const isText = valueTypeChosen && valueType === "TEXT";

  function resetCreateForm() {
    addForm.reset(analyteDefaultValues);
    setValueTypeChosen(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    setValue(membershipFromTest(test));
    setLoadError(null);
    setActiveTab("details");
    setDetailsMode(null);
    resetCreateForm();

    let cancelled = false;

    async function loadOptions() {
      try {
        setIsLoadingOptions(true);
        const response = await fetchLabAnalytes({ pageSize: 200 });
        if (cancelled) {
          return;
        }
        setCatalogAnalytes(response.results);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load analytes.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional open gate
  }, [open, test.uuid]);

  const detailsModeOptions = useMemo<NextStepOption[]>(
    () => [
      {
        id: "create",
        title: "Create new analyte",
        description: "Define a new catalog analyte and attach it to this test.",
        icon: "add",
        onSelect: () => {
          resetCreateForm();
          setDetailsMode("create");
          setActiveTab("details");
        },
        testId: "configure-lab-test-analytes-mode-create",
      },
      {
        id: "select",
        title: "Select from existing analytes",
        description: "Choose analytes already in your laboratory catalog.",
        icon: "flask",
        disabled: !hasCatalogAnalytes,
        disabledReason: "No analytes are available yet. Create one first.",
        onSelect: () => {
          setDetailsMode("select");
          setActiveTab("details");
        },
        testId: "configure-lab-test-analytes-mode-select",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetCreateForm uses addForm
    [hasCatalogAnalytes],
  );

  function selectValueType(type: LabAnalyteValueType) {
    setValueTypeChosen(true);
    addForm.setValue("value_type", type, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (type !== "NUMERIC") {
      addForm.setValue("unit", "");
      addForm.setValue("decimal_precision", "");
    }
    if (type !== "CODED") {
      addForm.setValue("coded_options", []);
    }
    if (type === "NUMERIC" || type === "CODED") {
      setActiveTab("options");
    }
  }

  const valueTypeOptions = useMemo<NextStepOption[]>(
    () =>
      ANALYTE_VALUE_TYPES.map((type) => {
        const copy = VALUE_TYPE_COPY[type];
        return {
          id: type,
          title: copy.title,
          description: copy.description,
          icon: copy.icon,
          emphasized: valueTypeChosen && valueType === type,
          onSelect: () => selectValueType(type),
          testId: `configure-lab-test-analytes-value-${type.toLowerCase()}`,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectValueType closes over addForm
    [valueType, valueTypeChosen],
  );

  const tabs = [
    { id: "details", label: "Details" },
    {
      id: "value",
      label: "Value",
      disabled: detailsMode !== "create",
    },
    {
      id: "options",
      label: "Options",
      disabled: detailsMode !== "create" || !(isNumeric || isCoded),
    },
  ];

  async function persistMembership(
    nextValue: TestAnalyteMembershipValue[],
  ): Promise<LabTestDefinition> {
    return updateLabTest(test.uuid, {
      analytes: toMembershipPayload(nextValue),
    });
  }

  async function handleCreateAnalyte(values: AnalyteFormValues) {
    try {
      const created = await createLabAnalyte(toAnalytePayload(values));
      const nextValue = value.some((row) => row.analyte_uuid === created.uuid)
        ? value
        : reindex([
            ...value,
            {
              analyte_uuid: created.uuid,
              sort_order: value.length,
              is_required: true,
            },
          ]);

      const updated = await persistMembership(nextValue);

      setCatalogAnalytes((current) => {
        if (current.some((item) => item.uuid === created.uuid)) {
          return current;
        }
        return [...current, created].sort((a, b) =>
          a.code.localeCompare(b.code),
        );
      });
      setValue(membershipFromTest(updated));
      onUpdated(updated);
      toast({
        variant: "success",
        title: "Analyte attached",
        description: `${created.name} was created and attached to this test.`,
      });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in analyteDefaultValues) {
            addForm.setError(field as keyof AnalyteFormValues, { message });
          }
        }
        if ("coded_options" in fieldErrors || "unit" in fieldErrors) {
          setActiveTab("options");
        } else if ("value_type" in fieldErrors) {
          setActiveTab("value");
        } else {
          setActiveTab("details");
          setDetailsMode("create");
        }
        toast({
          variant: "error",
          title: "Could not create analyte",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not create analyte",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleSaveSelection() {
    try {
      setIsSaving(true);
      const updated = await persistMembership(value);
      toast({
        variant: "success",
        title: "Analytes updated",
        description: `Analyte membership for ${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update analytes",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const isCreating = addForm.formState.isSubmitting;
  const busy = isSaving || isCreating;

  async function handleCreateSubmit(values: AnalyteFormValues) {
    if (!values.code.trim() || !values.name.trim()) {
      setActiveTab("details");
      setDetailsMode("create");
      await addForm.trigger(["code", "name"]);
      return;
    }
    if (!valueTypeChosen) {
      setActiveTab("value");
      toast({
        variant: "error",
        title: "Choose a value type",
        description: "Select Numeric, Text, or Coded before saving.",
      });
      return;
    }
    if (values.value_type === "NUMERIC" && !values.unit?.trim()) {
      setActiveTab("options");
      addForm.setError("unit", {
        message: "Unit is required for numeric analytes.",
      });
      return;
    }
    if (values.value_type === "CODED" && values.coded_options.length === 0) {
      setActiveTab("options");
      addForm.setError("coded_options", {
        message: "Add at least one coded option.",
      });
      return;
    }
    await handleCreateAnalyte(values);
  }

  const selectedExisting = catalogAnalytes.filter((analyte) =>
    value.some((row) => row.analyte_uuid === analyte.uuid),
  );

  async function handleContinueFromDetails() {
    const valid = await addForm.trigger(["code", "name"]);
    if (!valid) {
      return;
    }
    setActiveTab("value");
  }

  function canSaveCreate(): boolean {
    const values = addForm.getValues();
    if (!values.code.trim() || !values.name.trim() || !valueTypeChosen) {
      return false;
    }
    if (values.value_type === "NUMERIC" && !values.unit?.trim()) {
      return false;
    }
    if (values.value_type === "CODED" && values.coded_options.length === 0) {
      return false;
    }
    return true;
  }

  function renderFooter() {
    if (detailsMode == null) {
      return (
        <SecondaryButton
          type="button"
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </SecondaryButton>
      );
    }

    if (detailsMode === "select") {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={busy || isLoadingOptions || Boolean(loadError)}
            onClick={() => {
              void handleSaveSelection();
            }}
            data-testid="configure-lab-test-analytes-save"
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
      );
    }

    if (activeTab === "details") {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={busy}
            onClick={() => {
              void handleContinueFromDetails();
            }}
            data-testid="configure-lab-test-analytes-continue"
          >
            Continue
          </PrimaryButton>
        </>
      );
    }

    if (activeTab === "value" && !isText) {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={busy || !valueTypeChosen}
            onClick={() => {
              if (!valueTypeChosen) {
                toast({
                  variant: "error",
                  title: "Choose a value type",
                  description: "Select Numeric, Text, or Coded to continue.",
                });
                return;
              }
              if (valueType === "NUMERIC" || valueType === "CODED") {
                setActiveTab("options");
              }
            }}
            data-testid="configure-lab-test-analytes-continue"
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
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          form={ADD_ANALYTE_FORM_ID}
          disabled={
            busy || isLoadingOptions || Boolean(loadError) || !canSaveCreate()
          }
          data-testid="configure-lab-test-analytes-save"
        >
          {isCreating ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </PrimaryButton>
      </>
    );
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure analytes"
      description={`Attach analytes to ${test.name}.`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "details" || tabId === "value" || tabId === "options") {
          setActiveTab(tabId);
        }
      }}
      dismissible={!busy}
      className={appFont.className}
      contentClassName="px-0 py-0"
      data-testid="configure-lab-test-analytes-dialog"
      footer={renderFooter()}
    >
      {isLoadingOptions ? (
        <div className="flex items-center gap-2 px-6 py-8 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" />
          Loading analytes…
        </div>
      ) : loadError ? (
        <p className="px-6 py-4 text-sm text-red-700">{loadError}</p>
      ) : (
        <Form {...addForm}>
          <form
            id={ADD_ANALYTE_FORM_ID}
            onSubmit={addForm.handleSubmit(handleCreateSubmit)}
            className="contents"
          >
            {activeTab === "details" ? (
              <div data-testid="configure-lab-test-analytes-details-tab">
                {detailsMode == null ? (
                  <NextStepOptionsList
                    options={detailsModeOptions}
                    testId="configure-lab-test-analytes-details-mode"
                  />
                ) : (
                  <div className="space-y-4 px-6 py-5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors hover:text-brand-navy"
                      onClick={() => {
                        setDetailsMode(null);
                        setActiveTab("details");
                        resetCreateForm();
                      }}
                      disabled={busy}
                      data-testid="configure-lab-test-analytes-details-back"
                    >
                      <ArrowLeft className="size-3.5" aria-hidden="true" />
                      Back to options
                    </button>

                    {detailsMode === "create" ? (
                      <>
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-semibold text-brand-navy">
                            New analyte
                          </h3>
                          <p className="text-xs text-brand-muted">
                            Enter identifying details for the new analyte.
                          </p>
                        </div>
                        <AnalyteFields
                          control={addForm.control}
                          isSubmitting={busy}
                          section="identity"
                        />
                      </>
                    ) : (
                      <>
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-semibold text-brand-navy">
                            Existing analytes
                          </h3>
                          <p className="text-xs text-brand-muted">
                            Select analytes to attach to this test.
                          </p>
                        </div>
                        <TestAnalyteMembershipEditor
                          analytes={catalogAnalytes}
                          value={value}
                          onChange={setValue}
                          disabled={busy}
                          emptyMessage="No catalog analytes are available."
                        />
                        {selectedExisting.length > 0 ? (
                          <div className="space-y-3 rounded-lg border border-brand-border p-3">
                            <p className="text-[12px] font-medium uppercase tracking-wide text-brand-muted">
                              Selected details
                            </p>
                            {selectedExisting.map((analyte) => (
                              <div
                                key={analyte.uuid}
                                className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-brand-navy">
                                    {analyte.name}
                                  </p>
                                  <p className="font-mono text-[12px] text-brand-muted">
                                    {analyte.code}
                                  </p>
                                </div>
                                <p className="text-brand-muted">
                                  {analyte.value_type}
                                  {analyte.unit ? ` · ${analyte.unit}` : ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-brand-muted">
                            Select one or more analytes to see their details.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "value" ? (
              <div data-testid="configure-lab-test-analytes-value-tab">
                {detailsMode === "select" ? (
                  <ListPageBlankState
                    compact
                    title="Value type is set on existing analytes"
                    description="Go back to Details and choose Create new analyte to pick a value type."
                    data-testid="configure-lab-test-analytes-value-select-empty"
                  />
                ) : detailsMode == null ? (
                  <ListPageBlankState
                    compact
                    title="Choose how to add an analyte first"
                    description="On the Details tab, create a new analyte or select from existing ones."
                    data-testid="configure-lab-test-analytes-value-no-mode"
                  />
                ) : (
                  <NextStepOptionsList
                    options={valueTypeOptions}
                    selectedId={valueTypeChosen ? valueType : null}
                    testId="configure-lab-test-analytes-value-types"
                  />
                )}
              </div>
            ) : null}

            {activeTab === "options" ? (
              <div
                className="px-6 py-5"
                data-testid="configure-lab-test-analytes-options-tab"
              >
                {detailsMode === "create" && isNumeric ? (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-brand-navy">
                        Numeric options
                      </h3>
                      <p className="text-xs text-brand-muted">
                        Set the unit and decimal precision for this analyte.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={addForm.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={busy} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="decimal_precision"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Decimal precision</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                inputMode="numeric"
                                disabled={busy}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : detailsMode === "create" && isCoded ? (
                  <FormField
                    control={addForm.control}
                    name="coded_options"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <AnalyteCodedOptionsEditor
                          value={field.value}
                          onChange={field.onChange}
                          disabled={busy}
                          error={fieldState.error?.message}
                        />
                      </FormItem>
                    )}
                  />
                ) : (
                  <ListPageBlankState
                    compact
                    title={
                      detailsMode === "select"
                        ? "Options apply to new analytes"
                        : detailsMode == null
                          ? "Choose how to add an analyte first"
                          : "No options needed"
                    }
                    description={
                      detailsMode === "select"
                        ? "Existing analytes already define their value options."
                        : detailsMode == null
                          ? "On the Details tab, create a new analyte, then choose Numeric or Coded on Value."
                          : "Choose Numeric or Coded on the Value tab to configure options here."
                    }
                    data-testid="configure-lab-test-analytes-options-empty"
                  />
                )}
              </div>
            ) : null}
          </form>
        </Form>
      )}
    </TabbedDialog>
  );
}
