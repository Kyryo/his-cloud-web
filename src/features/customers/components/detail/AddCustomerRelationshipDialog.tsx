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
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { Textarea } from "@/components/ui/textarea";
import { CustomerAppointmentPicker } from "@/features/customers/components/CustomerAppointmentPicker";
import {
  createCustomerRelationshipDefaultValues,
  createCustomerRelationshipSchema,
  toCustomerRelationshipPayload,
  type CreateCustomerRelationshipFormValues,
} from "@/features/customers/schemas/customer-relationship.schema";
import { createCustomerRelationship } from "@/features/customers/services/customer-relationships.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  CUSTOMER_RELATIONSHIP_LABELS,
  CUSTOMER_RELATIONSHIP_TYPES,
  type CustomerRelationship,
} from "@/features/customers/types/customer-relationship.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "add-customer-relationship-form";

type AddCustomerRelationshipDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (relationship: CustomerRelationship) => void;
};

export function AddCustomerRelationshipDialog({
  customer,
  open,
  onOpenChange,
  onCreated,
}: AddCustomerRelationshipDialogProps) {
  const { toast } = useToast();
  const [selectedRelated, setSelectedRelated] = useState<Customer | null>(null);
  const form = useForm<CreateCustomerRelationshipFormValues>({
    resolver: zodResolver(createCustomerRelationshipSchema),
    defaultValues: createCustomerRelationshipDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(createCustomerRelationshipDefaultValues);
      setSelectedRelated(null);
    }
  }, [form, open]);

  async function handleSubmit(values: CreateCustomerRelationshipFormValues) {
    try {
      const relationship = await createCustomerRelationship(
        customer.uuid,
        toCustomerRelationshipPayload(values),
      );
      toast({
        variant: "success",
        title: "Relationship added",
        description: "The family link was saved for this client.",
      });
      form.reset(createCustomerRelationshipDefaultValues);
      setSelectedRelated(null);
      onCreated(relationship);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field === "related") {
            form.setError("related_uuid", { message });
            continue;
          }
          if (field in createCustomerRelationshipDefaultValues) {
            form.setError(
              field as keyof CreateCustomerRelationshipFormValues,
              { message },
            );
          }
        }
        toast({
          variant: "error",
          title: "Could not add relationship",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add relationship",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add relationship"
      description={`Link another client to ${customer.first_name} ${customer.last_name}.`}
      className={cn(appFont.className, "sm:max-w-lg")}
      data-testid="add-customer-relationship-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
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
              "Save relationship"
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
        >
          <FormField
            control={form.control}
            name="related_uuid"
            render={() => (
              <FormItem>
                <CustomerAppointmentPicker
                  customer={selectedRelated}
                  onCustomerChange={(next) => {
                    if (next?.uuid === customer.uuid) {
                      form.setError("related_uuid", {
                        message: "A client cannot be linked to themselves.",
                      });
                      setSelectedRelated(null);
                      form.setValue("related_uuid", "");
                      return;
                    }
                    setSelectedRelated(next);
                    form.setValue("related_uuid", next?.uuid ?? "", {
                      shouldValidate: true,
                    });
                    form.clearErrors("related_uuid");
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Relationship <RequiredFieldMarker />
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="relationship-type-select">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CUSTOMER_RELATIONSHIP_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {CUSTOMER_RELATIONSHIP_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-brand-muted">
                  How the selected client relates to this client.
                </p>
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
                    placeholder="Optional notes"
                    rows={3}
                    {...field}
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
