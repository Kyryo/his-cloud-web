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
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  dentalPerformDefaultValues,
  dentalPerformSchema,
  type DentalPerformFormValues,
} from "@/features/clinical-dental/schemas/dental-plan.schema";
import type { DentalTreatmentPlanItem } from "@/features/clinical-dental/types/clinical-dental.types";
import { formatSurfaces } from "@/features/clinical-dental/utils/dental-conditions";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const FORM_ID = "dental-perform-form";

type DentalPerformDialogProps = {
  item: DentalTreatmentPlanItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DentalPerformFormValues) => Promise<void>;
};

/** Confirm a planned procedure; performing it adds the charge to the visit bill. */
export function DentalPerformDialog({
  item,
  onOpenChange,
  onSubmit,
}: DentalPerformDialogProps) {
  const form = useForm<DentalPerformFormValues>({
    resolver: zodResolver(dentalPerformSchema),
    defaultValues: dentalPerformDefaultValues,
  });

  useEffect(() => {
    if (item) {
      form.reset({ ...dentalPerformDefaultValues, notes: item.notes ?? "" });
    }
  }, [form, item]);

  const isSubmitting = form.formState.isSubmitting;
  const teeth = item?.tooth_numbers.join(", ");

  return (
    <SectionedDialog
      open={item !== null}
      onOpenChange={onOpenChange}
      title="Perform procedure"
      description={
        item
          ? `${item.product_name}${teeth ? ` · teeth ${teeth}` : ""}${
              item.surfaces.length > 0 ? ` · ${formatSurfaces(item.surfaces)}` : ""
            }. It is added to the visit bill.`
          : undefined
      }
      className={cn(appFont.className, "sm:max-w-md")}
      data-testid="dental-perform-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            data-testid="dental-perform-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Performing...
              </>
            ) : (
              "Perform and bill"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          noValidate
        >
          <FormField
            control={form.control}
            name="materials_used"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Materials used</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Composite A2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Procedure notes</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
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
