"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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
import {
  ANALYTE_VALUE_TYPES,
  analyteDefaultValues,
  analyteSchema,
  type AnalyteFormValues,
} from "@/features/laboratory/schemas/analyte.schema";
import {
  createLabAnalyte,
  updateLabAnalyte,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabAnalyte } from "@/features/laboratory/types/laboratory-catalog.types";
import { toAnalytePayload } from "@/features/laboratory/utils/catalog-payloads";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const ADD_FORM_ID = "add-lab-analyte-form";
const EDIT_FORM_ID = "edit-lab-analyte-form";

function toFormValues(item?: LabAnalyte | null): AnalyteFormValues {
  if (!item) return analyteDefaultValues;
  const valueType = ANALYTE_VALUE_TYPES.includes(
    item.value_type as (typeof ANALYTE_VALUE_TYPES)[number],
  )
    ? (item.value_type as (typeof ANALYTE_VALUE_TYPES)[number])
    : "NUMERIC";
  return {
    code: item.code,
    name: item.name,
    loinc_code: item.loinc_code ?? "",
    value_type: valueType,
    unit: item.unit ?? "",
    decimal_precision:
      item.decimal_precision == null ? "" : String(item.decimal_precision),
  };
}

type AddAnalyteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: LabAnalyte) => void;
};

export function AddAnalyteDialog({
  open,
  onOpenChange,
  onCreated,
}: AddAnalyteDialogProps) {
  const { toast } = useToast();
  const form = useForm<AnalyteFormValues>({
    resolver: zodResolver(analyteSchema),
    defaultValues: analyteDefaultValues,
  });

  useEffect(() => {
    if (open) form.reset(analyteDefaultValues);
  }, [form, open]);

  async function handleSubmit(values: AnalyteFormValues) {
    try {
      const item = await createLabAnalyte(toAnalytePayload(values));
      toast({
        variant: "success",
        title: "Analyte created",
        description: `${item.name} was added to the catalog.`,
      });
      onCreated(item);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in analyteDefaultValues) {
            form.setError(field as keyof AnalyteFormValues, { message });
          }
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

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add analyte"
      description="Define a measurable analyte for laboratory results."
      className={cn("sm:max-w-lg", appFont.className)}
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
          <AnalyteFields control={form.control} isSubmitting={isSubmitting} />
        </form>
      </Form>
    </SectionedDialog>
  );
}

type EditAnalyteDialogProps = {
  item: LabAnalyte | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: LabAnalyte) => void;
};

export function EditAnalyteDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: EditAnalyteDialogProps) {
  const { toast } = useToast();
  const form = useForm<AnalyteFormValues>({
    resolver: zodResolver(analyteSchema),
    defaultValues: analyteDefaultValues,
  });

  useEffect(() => {
    if (open && item) form.reset(toFormValues(item));
  }, [form, item, open]);

  async function handleSubmit(values: AnalyteFormValues) {
    if (!item) return;
    try {
      const updated = await updateLabAnalyte(item.uuid, toAnalytePayload(values));
      toast({
        variant: "success",
        title: "Analyte updated",
        description: `${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        toast({
          variant: "error",
          title: "Could not update analyte",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not update analyte",
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
      title="Edit analyte"
      description="Update analyte details."
      className={cn("sm:max-w-lg", appFont.className)}
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
          <AnalyteFields control={form.control} isSubmitting={isSubmitting} />
        </form>
      </Form>
    </SectionedDialog>
  );
}

function AnalyteFields({
  control,
  isSubmitting,
}: {
  control: ReturnType<typeof useForm<AnalyteFormValues>>["control"];
  isSubmitting: boolean;
}) {
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
        name="loinc_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LOINC code</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="value_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Value type</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ANALYTE_VALUE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="decimal_precision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decimal precision</FormLabel>
              <FormControl>
                <Input {...field} inputMode="numeric" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
