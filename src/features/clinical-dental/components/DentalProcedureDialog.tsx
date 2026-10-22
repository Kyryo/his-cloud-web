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
import { DentalProcedurePicker } from "@/features/clinical-dental/components/DentalProcedurePicker";
import {
  dentalProcedureDefaultValues,
  dentalProcedureSchema,
  type DentalProcedureFormValues,
} from "@/features/clinical-dental/schemas/dental-plan.schema";
import type { ToothSurface } from "@/features/clinical-dental/types/clinical-dental.types";
import { TOOTH_SURFACES } from "@/features/clinical-dental/utils/dental-conditions";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const FORM_ID = "dental-procedure-form";

type DentalProcedureDialogProps = {
  mode: "plan-item" | "procedure";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DentalProcedureFormValues) => Promise<void>;
  initialTeeth?: readonly number[];
};

/** Pick a procedure, teeth, and surfaces for a plan item or a performed procedure. */
export function DentalProcedureDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialTeeth = [],
}: DentalProcedureDialogProps) {
  const form = useForm<DentalProcedureFormValues>({
    resolver: zodResolver(dentalProcedureSchema),
    defaultValues: dentalProcedureDefaultValues(initialTeeth),
  });

  const initialTeethKey = initialTeeth.join(",");
  useEffect(() => {
    if (open) {
      form.reset(
        dentalProcedureDefaultValues(
          initialTeethKey ? initialTeethKey.split(",").map(Number) : [],
        ),
      );
    }
  }, [form, initialTeethKey, open]);

  const isSubmitting = form.formState.isSubmitting;
  const isPlanItem = mode === "plan-item";

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isPlanItem ? "Add planned procedure" : "Record procedure"}
      description={
        isPlanItem
          ? "Add a procedure to the treatment plan. It is billed when performed."
          : "Record a procedure performed now. It is added to the visit bill."
      }
      className={cn(appFont.className, "sm:max-w-lg")}
      data-testid="dental-procedure-dialog"
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
            ) : isPlanItem ? (
              "Add to plan"
            ) : (
              "Record and bill"
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
            name="product_uuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Procedure</FormLabel>
                <DentalProcedurePicker
                  value={field.value}
                  onChange={(product) => {
                    field.onChange(product.uuid);
                    if (isPlanItem && !form.getValues("estimated_price")) {
                      const price = Number(product.list_price ?? 0);
                      if (price > 0) {
                        form.setValue("estimated_price", price.toFixed(2));
                      }
                    }
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teeth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teeth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. 36, 37 (leave empty for whole mouth)"
                    data-testid="dental-procedure-teeth"
                  />
                </FormControl>
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
                <div className="flex flex-wrap gap-2" role="group" aria-label="Surfaces">
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

          {isPlanItem ? (
            <FormField
              control={form.control}
              name="estimated_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated price</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="decimal" placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} placeholder="Optional notes" />
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
