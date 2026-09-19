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
import {
  REFERENCE_RANGE_SEX_OPTIONS,
  referenceRangeDefaultValues,
  referenceRangeSchema,
  type ReferenceRangeFormValues,
} from "@/features/laboratory/schemas/reference-range.schema";
import {
  createLabReferenceRange,
  fetchLabAnalytes,
  fetchLabSpecimenTypes,
  updateLabReferenceRange,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type {
  LabAnalyte,
  LabReferenceRange,
  LabSpecimenType,
} from "@/features/laboratory/types/laboratory-catalog.types";
import { toReferenceRangePayload } from "@/features/laboratory/utils/catalog-payloads";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const ADD_FORM_ID = "add-lab-reference-range-form";
const EDIT_FORM_ID = "edit-lab-reference-range-form";
const NONE_VALUE = "__none__";

function toFormValues(item?: LabReferenceRange | null): ReferenceRangeFormValues {
  if (!item) return referenceRangeDefaultValues;
  const sex = REFERENCE_RANGE_SEX_OPTIONS.includes(
    item.sex as (typeof REFERENCE_RANGE_SEX_OPTIONS)[number],
  )
    ? (item.sex as (typeof REFERENCE_RANGE_SEX_OPTIONS)[number])
    : "ANY";
  return {
    analyte_uuid: item.analyte_uuid,
    specimen_type_uuid: item.specimen_type_uuid ?? "",
    sex,
    age_min_days: item.age_min_days == null ? "" : String(item.age_min_days),
    age_max_days: item.age_max_days == null ? "" : String(item.age_max_days),
    low_normal: item.low_normal == null ? "" : String(item.low_normal),
    high_normal: item.high_normal == null ? "" : String(item.high_normal),
    low_critical: item.low_critical == null ? "" : String(item.low_critical),
    high_critical: item.high_critical == null ? "" : String(item.high_critical),
    effective_from: item.effective_from?.slice(0, 10) ?? "",
    effective_to: item.effective_to?.slice(0, 10) ?? "",
    text_normal: item.text_normal ?? "",
  };
}

type AddReferenceRangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: LabReferenceRange) => void;
  defaultAnalyteUuid?: string;
};

export function AddReferenceRangeDialog({
  open,
  onOpenChange,
  onCreated,
  defaultAnalyteUuid = "",
}: AddReferenceRangeDialogProps) {
  const { toast } = useToast();
  const form = useForm<ReferenceRangeFormValues>({
    resolver: zodResolver(referenceRangeSchema),
    defaultValues: {
      ...referenceRangeDefaultValues,
      analyte_uuid: defaultAnalyteUuid,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        ...referenceRangeDefaultValues,
        analyte_uuid: defaultAnalyteUuid,
      });
    }
  }, [defaultAnalyteUuid, form, open]);

  async function handleSubmit(values: ReferenceRangeFormValues) {
    try {
      const item = await createLabReferenceRange(toReferenceRangePayload(values));
      toast({
        variant: "success",
        title: "Reference range created",
        description: "The range was added to the catalog.",
      });
      onCreated(item);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in referenceRangeDefaultValues) {
            form.setError(field as keyof ReferenceRangeFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create reference range",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not create reference range",
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
      title="Add reference range"
      description="Define normal and critical limits for an analyte."
      className={cn("sm:max-w-2xl", appFont.className)}
      data-testid="add-reference-range-dialog"
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
          <ReferenceRangeFields
            control={form.control}
            isSubmitting={isSubmitting}
            loadOptions={open}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}

type EditReferenceRangeDialogProps = {
  item: LabReferenceRange | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: LabReferenceRange) => void;
};

export function EditReferenceRangeDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: EditReferenceRangeDialogProps) {
  const { toast } = useToast();
  const form = useForm<ReferenceRangeFormValues>({
    resolver: zodResolver(referenceRangeSchema),
    defaultValues: referenceRangeDefaultValues,
  });

  useEffect(() => {
    if (open && item) form.reset(toFormValues(item));
  }, [form, item, open]);

  async function handleSubmit(values: ReferenceRangeFormValues) {
    if (!item) return;
    try {
      const updated = await updateLabReferenceRange(
        item.uuid,
        toReferenceRangePayload(values),
      );
      toast({
        variant: "success",
        title: "Reference range updated",
        description: "Changes were saved.",
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        toast({
          variant: "error",
          title: "Could not update reference range",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not update reference range",
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
      title="Edit reference range"
      description="Update limits, sex, age band, and effective dates."
      className={cn("sm:max-w-2xl", appFont.className)}
      data-testid="edit-reference-range-dialog"
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
          <ReferenceRangeFields
            control={form.control}
            isSubmitting={isSubmitting}
            loadOptions={open}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}

function ReferenceRangeFields({
  control,
  isSubmitting,
  loadOptions,
}: {
  control: ReturnType<typeof useForm<ReferenceRangeFormValues>>["control"];
  isSubmitting: boolean;
  loadOptions: boolean;
}) {
  const [analytes, setAnalytes] = useState<LabAnalyte[]>([]);
  const [specimenTypes, setSpecimenTypes] = useState<LabSpecimenType[]>([]);

  useEffect(() => {
    if (!loadOptions) return;
    let cancelled = false;
    void (async () => {
      try {
        const [analyteResponse, specimenResponse] = await Promise.all([
          fetchLabAnalytes({ pageSize: 200 }),
          fetchLabSpecimenTypes({ pageSize: 200 }),
        ]);
        if (cancelled) return;
        setAnalytes(analyteResponse.results);
        setSpecimenTypes(specimenResponse.results);
      } catch {
        if (!cancelled) {
          setAnalytes([]);
          setSpecimenTypes([]);
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
        name="analyte_uuid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Analyte</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select analyte" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {analytes.map((analyte) => (
                  <SelectItem key={analyte.uuid} value={analyte.uuid}>
                    {analyte.code} — {analyte.name}
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
        name="specimen_type_uuid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specimen type</FormLabel>
            <Select
              value={field.value || NONE_VALUE}
              onValueChange={(value) =>
                field.onChange(value === NONE_VALUE ? "" : value)
              }
              disabled={isSubmitting}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Optional specimen type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Any</SelectItem>
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
        name="sex"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sex</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {REFERENCE_RANGE_SEX_OPTIONS.map((sex) => (
                  <SelectItem key={sex} value={sex}>
                    {sex}
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
          name="age_min_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age min (days)</FormLabel>
              <FormControl>
                <Input {...field} inputMode="numeric" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="age_max_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age max (days)</FormLabel>
              <FormControl>
                <Input {...field} inputMode="numeric" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name="low_normal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low normal</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="high_normal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>High normal</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name="low_critical"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low critical</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="high_critical"
          render={({ field }) => (
            <FormItem>
              <FormLabel>High critical</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name="effective_from"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Effective from</FormLabel>
              <FormControl>
                <Input {...field} type="date" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="effective_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Effective to</FormLabel>
              <FormControl>
                <Input {...field} type="date" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="text_normal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Text normal</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
