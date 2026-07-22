"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileBadge2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
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
import { StatusBanner } from "@/components/ui/status-banner";
import { Textarea } from "@/components/ui/textarea";
import {
  editVisitPreAuthorizationSchema,
  toEditVisitPreAuthorizationDefaultValues,
  toUpdateVisitPreAuthorizationPayload,
  visitHasPreAuthorizationDetails,
  type EditVisitPreAuthorizationFormValues,
} from "@/features/visits/schemas/edit-visit-pre-authorization.schema";
import { updateVisitPreAuthorization } from "@/features/visits/services/visits.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

const ADD_FORM_DEFAULTS: EditVisitPreAuthorizationFormValues = {
  requires_pre_authorization: true,
  pre_authorization_number: "",
  pre_authorization_comments: "",
};

type VisitPreAuthorizationTabProps = {
  visit: VisitDetail;
  onUpdated: (visit: VisitDetail) => void;
};

export function VisitPreAuthorizationTab({
  visit,
  onUpdated,
}: VisitPreAuthorizationTabProps) {
  const { toast } = useToast();
  const hasDetails = visitHasPreAuthorizationDetails(visit);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const showForm = hasDetails || isAdding;

  const form = useForm<EditVisitPreAuthorizationFormValues>({
    resolver: zodResolver(editVisitPreAuthorizationSchema),
    defaultValues: hasDetails
      ? toEditVisitPreAuthorizationDefaultValues(visit)
      : ADD_FORM_DEFAULTS,
  });

  const requiresPreAuth = useWatch({
    control: form.control,
    name: "requires_pre_authorization",
  });

  function startAdding() {
    form.reset(ADD_FORM_DEFAULTS);
    setSubmitError(null);
    setIsAdding(true);
  }

  function cancelAdding() {
    form.reset(ADD_FORM_DEFAULTS);
    setSubmitError(null);
    setIsAdding(false);
  }

  async function onSubmit(values: EditVisitPreAuthorizationFormValues) {
    setIsSaving(true);
    setSubmitError(null);
    try {
      const updated = await updateVisitPreAuthorization(
        visit.uuid,
        toUpdateVisitPreAuthorizationPayload(values),
      );
      form.reset(toEditVisitPreAuthorizationDefaultValues(updated));
      setIsAdding(false);
      onUpdated(updated);
      toast({
        variant: "success",
        title: hasDetails
          ? "Pre-authorization updated"
          : "Pre-authorization added",
        description: hasDetails
          ? "Pre-authorization details were saved."
          : "Pre-authorization details were saved for this visit.",
      });
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof EditVisitPreAuthorizationFormValues, {
              message,
            });
          }
        }
        setSubmitError(formatBffErrorMessage(error.message, error.errors));
      } else {
        setSubmitError(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
      toast({
        variant: "error",
        title: "Could not save pre-authorization",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!showForm) {
    return (
      <DetailTabEmptyState
        icon={FileBadge2}
        title="No pre-authorization on file"
        description="Add pre-authorization details for this visit when required by the insurer."
        action={
          <PrimaryButton
            type="button"
            onClick={startAdding}
            data-testid="add-visit-preauth-button"
          >
            Add pre-authorization
          </PrimaryButton>
        }
        data-testid="visit-preauth-empty-state"
      />
    );
  }

  return (
    <section className="rounded-xl border border-brand-border bg-white p-4">
      <div>
        <p className="text-sm font-medium text-brand-navy">Pre-authorization</p>
        <p className="mt-1 text-xs text-brand-muted">
          Editable at any time, including after the visit is closed.
        </p>
      </div>

      <Form {...form}>
        <form
          className="mt-4 space-y-4"
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        >
          <FormField
            control={form.control}
            name="requires_pre_authorization"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    className="size-4 rounded border-brand-border accent-brand-primary text-brand-primary focus:ring-brand-primary"
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Requires pre-authorization
                </FormLabel>
              </FormItem>
            )}
          />

          {requiresPreAuth ? (
            <>
              <FormField
                control={form.control}
                name="pre_authorization_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pre-authorization number{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="AUTH123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pre_authorization_comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}

          {submitError ? (
            <StatusBanner variant="error" message={submitError} />
          ) : null}

          <div className="flex justify-end gap-2">
            {!hasDetails ? (
              <SecondaryButton
                type="button"
                disabled={isSaving}
                onClick={cancelAdding}
              >
                Cancel
              </SecondaryButton>
            ) : null}
            <PrimaryButton type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : hasDetails ? (
                "Save changes"
              ) : (
                "Save"
              )}
            </PrimaryButton>
          </div>
        </form>
      </Form>
    </section>
  );
}
