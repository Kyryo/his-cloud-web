"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
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

export type ReferenceRangeAnalyteOption = {
  uuid: string;
  code: string;
  name: string;
};

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

type ReferenceRangeDialogSharedProps = {
  analyteOptions?: ReferenceRangeAnalyteOption[];
  lockAnalyte?: boolean;
};

type AddReferenceRangeDialogProps = ReferenceRangeDialogSharedProps & {
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
  analyteOptions,
  lockAnalyte = false,
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
        description: "The range was added for this analyte.",
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
      description="Set who this range applies to and the normal and critical limits."
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
                Creating…
              </>
            ) : (
              "Create range"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={ADD_FORM_ID}
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <ReferenceRangeFields
            control={form.control}
            isSubmitting={isSubmitting}
            loadOptions={open}
            analyteOptions={analyteOptions}
            lockAnalyte={lockAnalyte}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}

type EditReferenceRangeDialogProps = ReferenceRangeDialogSharedProps & {
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
  analyteOptions,
  lockAnalyte = false,
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
      description="Update applicability, limits, and effective dates."
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
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={EDIT_FORM_ID}
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <ReferenceRangeFields
            control={form.control}
            isSubmitting={isSubmitting}
            loadOptions={open}
            analyteOptions={analyteOptions}
            lockAnalyte={lockAnalyte}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}

function FieldSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
        <p className="text-xs text-brand-muted">{description}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ReferenceRangeFields({
  control,
  isSubmitting,
  loadOptions,
  analyteOptions,
  lockAnalyte = false,
}: {
  control: ReturnType<typeof useForm<ReferenceRangeFormValues>>["control"];
  isSubmitting: boolean;
  loadOptions: boolean;
  analyteOptions?: ReferenceRangeAnalyteOption[];
  lockAnalyte?: boolean;
}) {
  const [catalogAnalytes, setCatalogAnalytes] = useState<LabAnalyte[]>([]);
  const [specimenTypes, setSpecimenTypes] = useState<LabSpecimenType[]>([]);
  const scoped = analyteOptions != null;
  const analytes: ReferenceRangeAnalyteOption[] = scoped
    ? analyteOptions
    : catalogAnalytes.map((analyte) => ({
        uuid: analyte.uuid,
        code: analyte.code,
        name: analyte.name,
      }));

  useEffect(() => {
    if (!loadOptions) return;
    let cancelled = false;
    void (async () => {
      try {
        const specimenPromise = fetchLabSpecimenTypes({ pageSize: 200 });
        const analytePromise = scoped
          ? Promise.resolve(null)
          : fetchLabAnalytes({ pageSize: 200 });
        const [analyteResponse, specimenResponse] = await Promise.all([
          analytePromise,
          specimenPromise,
        ]);
        if (cancelled) return;
        if (analyteResponse) {
          setCatalogAnalytes(analyteResponse.results);
        }
        setSpecimenTypes(specimenResponse.results);
      } catch {
        if (!cancelled) {
          if (!scoped) setCatalogAnalytes([]);
          setSpecimenTypes([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadOptions, scoped]);

  return (
    <>
      <FieldSection
        title="Applicability"
        description="Which analyte and patient population this range covers."
      >
        <FormField
          control={control}
          name="analyte_uuid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analyte</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting || lockAnalyte}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      <SelectValue placeholder="Any specimen" />
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
                        {sex === "ANY" ? "Any" : sex === "M" ? "Male" : "Female"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="age_min_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age min (days)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    placeholder="Optional"
                    disabled={isSubmitting}
                  />
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
                  <Input
                    {...field}
                    inputMode="numeric"
                    placeholder="Optional"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FieldSection>

      <FieldSection
        title="Limits"
        description="Normal and critical thresholds used when flagging results."
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="low_normal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low normal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 3.5" disabled={isSubmitting} />
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
                  <Input {...field} placeholder="e.g. 5.5" disabled={isSubmitting} />
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
                  <Input {...field} placeholder="Optional" disabled={isSubmitting} />
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
                  <Input {...field} placeholder="Optional" disabled={isSubmitting} />
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
                <Input
                  {...field}
                  placeholder="Optional display text for normal"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldSection>

      <FieldSection
        title="Effective period"
        description="When this range is active for result interpretation."
      >
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
      </FieldSection>
    </>
  );
}
