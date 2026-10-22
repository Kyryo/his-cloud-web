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
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDentalFinding } from "@/features/clinical-dental/hooks/use-clinical-dental";
import {
  dentalFindingDefaultValues,
  dentalFindingSchema,
  toDentalFindingPayload,
  type DentalFindingFormValues,
} from "@/features/clinical-dental/schemas/dental-finding.schema";
import type { ToothSurface } from "@/features/clinical-dental/types/clinical-dental.types";
import { toothName } from "@/features/clinical-dental/utils/dental-arches";
import {
  DENTAL_CONDITIONS,
  DENTAL_CONDITION_META,
  TOOTH_SURFACES,
} from "@/features/clinical-dental/utils/dental-conditions";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "dental-finding-form";

const FINDING_FIELDS = ["tooth_number", "condition", "surfaces", "notes"] as const;

function isFindingField(field: string): field is (typeof FINDING_FIELDS)[number] {
  return (FINDING_FIELDS as readonly string[]).includes(field);
}

type DentalFindingDialogProps = {
  visitUuid: string;
  encounterUuid: string;
  toothNumber: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DentalFindingDialog({
  visitUuid,
  encounterUuid,
  toothNumber,
  open,
  onOpenChange,
}: DentalFindingDialogProps) {
  const { toast } = useToast();
  const createFinding = useCreateDentalFinding(visitUuid, encounterUuid);
  const form = useForm<DentalFindingFormValues>({
    resolver: zodResolver(dentalFindingSchema),
    defaultValues: dentalFindingDefaultValues(toothNumber ?? 11),
  });

  useEffect(() => {
    if (open && toothNumber !== null) {
      form.reset(dentalFindingDefaultValues(toothNumber));
    }
  }, [form, open, toothNumber]);

  async function handleSubmit(values: DentalFindingFormValues) {
    try {
      await createFinding.mutateAsync(toDentalFindingPayload(values));
      toast({
        variant: "success",
        title: "Finding recorded",
        description: `${DENTAL_CONDITION_META[values.condition].label} on tooth ${values.tooth_number}.`,
      });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        for (const [field, message] of Object.entries(
          mapBffErrorsToForm(error.errors),
        )) {
          if (isFindingField(field)) {
            form.setError(field, { message });
          }
        }
      }
      toast({
        variant: "error",
        title: "Could not record finding",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Try again in a moment.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record finding"
      description={
        toothNumber !== null
          ? `${toothName(toothNumber)} (tooth ${toothNumber})`
          : undefined
      }
      className={cn(appFont.className, "sm:max-w-md")}
      data-testid="dental-finding-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Record finding"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="dental-finding-condition">
                      <SelectValue placeholder="Select a condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DENTAL_CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {DENTAL_CONDITION_META[condition].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surfaces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surfaces</FormLabel>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Surfaces"
                >
                  {TOOTH_SURFACES.map((surface) => {
                    const checked = field.value.includes(surface.value);
                    return (
                      <label
                        key={surface.value}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs",
                          checked
                            ? "border-brand-primary bg-brand-primary/10 text-brand-navy"
                            : "border-dash-border text-brand-slate",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="size-3.5 rounded border-brand-border"
                          checked={checked}
                          onChange={(event) => {
                            const next: ToothSurface[] = event.target.checked
                              ? [...field.value, surface.value]
                              : field.value.filter((value) => value !== surface.value);
                            field.onChange(next);
                          }}
                          data-testid={`dental-finding-surface-${surface.value}`}
                        />
                        {surface.label}
                      </label>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Optional clinical notes"
                    data-testid="dental-finding-notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}
