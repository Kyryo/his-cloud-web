"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { LabCatalogProductField } from "@/features/laboratory/components/catalog/LabCatalogProductField";
import { TestAnalyteMembershipEditor } from "@/features/laboratory/components/catalog/TestAnalyteMembershipEditor";
import {
  labTestDefaultValues,
  labTestSchema,
  type LabTestFormValues,
} from "@/features/laboratory/schemas/test.schema";
import {
  createLabTest,
  fetchLabAnalytes,
  fetchLabSpecimenTypes,
  updateLabTest,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type {
  LabAnalyte,
  LabProductBrief,
  LabSpecimenType,
  LabTestDefinition,
} from "@/features/laboratory/types/laboratory-catalog.types";
import { toLabTestPayload } from "@/features/laboratory/utils/catalog-payloads";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const ADD_FORM_ID = "add-lab-test-form";
const EDIT_FORM_ID = "edit-lab-test-form";
const NONE_VALUE = "__none__";

function toFormValues(item?: LabTestDefinition | null): LabTestFormValues {
  if (!item) return labTestDefaultValues;
  return {
    code: item.code,
    name: item.name,
    category: item.category ?? "",
    product_uuid: item.product_uuid ?? "",
    turnaround_hours:
      item.turnaround_hours == null ? "" : String(item.turnaround_hours),
    primary_specimen_type_uuid: item.primary_specimen_type_uuid ?? "",
    analytes: [...(item.analytes ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((row, index) => ({
        analyte_uuid: row.analyte_uuid,
        sort_order: row.sort_order ?? index,
        is_required: row.is_required,
      })),
  };
}

type AddLabTestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: LabTestDefinition) => void;
};

export function AddLabTestDialog({
  open,
  onOpenChange,
  onCreated,
}: AddLabTestDialogProps) {
  const { toast } = useToast();
  const form = useForm<LabTestFormValues>({
    resolver: zodResolver(labTestSchema),
    defaultValues: labTestDefaultValues,
  });

  useEffect(() => {
    if (open) form.reset(labTestDefaultValues);
  }, [form, open]);

  async function handleSubmit(values: LabTestFormValues) {
    try {
      const item = await createLabTest(toLabTestPayload(values));
      toast({
        variant: "success",
        title: "Test created",
        description: `${item.name} was added to the catalog.`,
      });
      onCreated(item);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in labTestDefaultValues) {
            form.setError(field as keyof LabTestFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create test",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not create test",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add test"
      description="Define a laboratory test, billing product, and analytes."
      className={cn("sm:max-w-3xl", appFont.className)}
      data-testid="add-lab-test-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={ADD_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={ADD_FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <TestFields form={form} isSubmitting={isSubmitting} loadOptions={open} />
        </form>
      </Form>
    </SectionedDialog>
  );
}

type EditLabTestDialogProps = {
  item: LabTestDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: LabTestDefinition) => void;
};

export function EditLabTestDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: EditLabTestDialogProps) {
  const { toast } = useToast();
  const form = useForm<LabTestFormValues>({
    resolver: zodResolver(labTestSchema),
    defaultValues: labTestDefaultValues,
  });

  useEffect(() => {
    if (open && item) form.reset(toFormValues(item));
  }, [form, item, open]);

  async function handleSubmit(values: LabTestFormValues) {
    if (!item) return;
    try {
      const updated = await updateLabTest(item.uuid, toLabTestPayload(values));
      toast({
        variant: "success",
        title: "Test updated",
        description: `${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        toast({
          variant: "error",
          title: "Could not update test",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not update test",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit test"
      description="Update test definition, product, and analytes."
      className={cn("sm:max-w-3xl", appFont.className)}
      data-testid="edit-lab-test-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={EDIT_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={EDIT_FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <TestFields
            form={form}
            isSubmitting={isSubmitting}
            loadOptions={open}
            productBrief={item?.product ?? null}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}

/** @deprecated Prefer AddLabTestDialog */
export const AddTestDialog = AddLabTestDialog;
/** @deprecated Prefer EditLabTestDialog */
export const EditTestDialog = EditLabTestDialog;

function TestFields({
  form,
  isSubmitting,
  loadOptions,
  productBrief = null,
}: {
  form: ReturnType<typeof useForm<LabTestFormValues>>;
  isSubmitting: boolean;
  loadOptions: boolean;
  productBrief?: LabProductBrief | null;
}) {
  const [specimenTypes, setSpecimenTypes] = useState<LabSpecimenType[]>([]);
  const [analytes, setAnalytes] = useState<LabAnalyte[]>([]);
  const { control, setValue, watch } = form;
  const productUuid = watch("product_uuid");

  useEffect(() => {
    if (!loadOptions) return;
    let cancelled = false;
    void (async () => {
      try {
        const [specimenResponse, analyteResponse] = await Promise.all([
          fetchLabSpecimenTypes({ pageSize: 200 }),
          fetchLabAnalytes({ pageSize: 200 }),
        ]);
        if (cancelled) return;
        setSpecimenTypes(specimenResponse.results);
        setAnalytes(analyteResponse.results);
      } catch {
        if (!cancelled) {
          setSpecimenTypes([]);
          setAnalytes([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadOptions]);

  return (
    <>
      <FormField
        control={control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="product_uuid"
        render={({ fieldState }) => (
          <FormItem>
            <LabCatalogProductField
              productUuid={productUuid ?? ""}
              productBrief={productBrief}
              disabled={isSubmitting}
              invalid={Boolean(fieldState.error)}
              onChange={(uuid) => setValue("product_uuid", uuid, { shouldDirty: true })}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="turnaround_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Turnaround hours</FormLabel>
            <FormControl>
              <Input {...field} inputMode="numeric" disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="primary_specimen_type_uuid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary specimen type</FormLabel>
            <Select
              value={field.value || NONE_VALUE}
              onValueChange={(value) =>
                field.onChange(value === NONE_VALUE ? "" : value)
              }
              disabled={isSubmitting}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select specimen type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {specimenTypes.map((type) => (
                  <SelectItem key={type.uuid} value={type.uuid}>
                    {type.code} — {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="analytes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Analytes</FormLabel>
            <TestAnalyteMembershipEditor
              analytes={analytes}
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
