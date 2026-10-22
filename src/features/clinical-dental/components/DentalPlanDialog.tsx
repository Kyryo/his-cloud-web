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
  dentalPlanDefaultValues,
  dentalPlanSchema,
  type DentalPlanFormValues,
} from "@/features/clinical-dental/schemas/dental-plan.schema";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const FORM_ID = "dental-plan-form";

type DentalPlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DentalPlanFormValues) => Promise<void>;
};

export function DentalPlanDialog({ open, onOpenChange, onSubmit }: DentalPlanDialogProps) {
  const form = useForm<DentalPlanFormValues>({
    resolver: zodResolver(dentalPlanSchema),
    defaultValues: dentalPlanDefaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(dentalPlanDefaultValues);
    }
  }, [form, open]);

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New treatment plan"
      description="Group the procedures you propose to the client. Add procedures next."
      className={cn(appFont.className, "sm:max-w-md")}
      data-testid="dental-plan-dialog"
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
                Creating...
              </>
            ) : (
              "Create plan"
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Restore lower left quadrant"
                    data-testid="dental-plan-title"
                  />
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
