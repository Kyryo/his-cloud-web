"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createStartVisitDefaultValues,
  startVisitSchema,
  toCreateVisitPayload,
  type StartVisitFormValues,
} from "@/features/customers/schemas/start-visit.schema";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import {
  closeCustomerVisit,
  createCustomerVisit,
  fetchCustomerVisits,
  findActiveCustomerVisit,
} from "@/features/customers/services/customer-visits.service";
import { fetchVisitTypeCatalog } from "@/features/customers/services/visit-types.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import type { VisitTypeCatalogItem } from "@/features/customers/types/customer-visit.types";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  canCloseCustomerVisit,
  getCloseCustomerVisitTooltip,
} from "@/features/customers/utils/can-close-customer-visit";
import { formatCustomerName, formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import { useUser } from "@/providers/user-provider";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type CustomerVisitDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitChanged: (visit: CustomerVisit) => void;
};

export function CustomerVisitDialog({
  customer,
  open,
  onOpenChange,
  onVisitChanged,
}: CustomerVisitDialogProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const [visitTypes, setVisitTypes] = useState<VisitTypeCatalogItem[]>([]);
  const [insuranceSchemes, setInsuranceSchemes] = useState<CustomerInsurance[]>([]);
  const [activeVisit, setActiveVisit] = useState<CustomerVisit | null>(null);
  const [clinicIdByUuid, setClinicIdByUuid] = useState<Map<string, number>>(
    new Map(),
  );
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [visitTypeSearch, setVisitTypeSearch] = useState("");

  const form = useForm<StartVisitFormValues>({
    resolver: zodResolver(startVisitSchema),
    defaultValues: createStartVisitDefaultValues(),
  });

  const modeOfPayment = form.watch("mode_of_payment");
  const requiresPreAuth = form.watch("requires_pre_authorization");
  const customerName = useMemo(() => formatCustomerName(customer), [customer]);

  const filteredVisitTypes = useMemo(
    () =>
      visitTypes.filter((type) =>
        type.name.toLowerCase().includes(visitTypeSearch.toLowerCase()),
      ),
    [visitTypeSearch, visitTypes],
  );

  const canClose = useMemo(
    () => canCloseCustomerVisit(userData, activeVisit, clinicIdByUuid),
    [activeVisit, clinicIdByUuid, userData],
  );

  const closeTooltip = useMemo(
    () => getCloseCustomerVisitTooltip(userData, activeVisit, clinicIdByUuid),
    [activeVisit, clinicIdByUuid, userData],
  );

  const loadDialogContext = useCallback(async () => {
    setIsLoadingContext(true);
    setCloseError(null);

    try {
      const [types, visits, insurance, clinicsResponse] = await Promise.all([
        fetchVisitTypeCatalog(),
        fetchCustomerVisits(customer.uuid, { limit: 100 }),
        fetchCustomerInsurance(customer.uuid).catch(() => [] as CustomerInsurance[]),
        fetchOrganizationClinics(),
      ]);

      setVisitTypes(types);
      setInsuranceSchemes(insurance);
      setActiveVisit(findActiveCustomerVisit(visits));
      setClinicIdByUuid(
        new Map(
          clinicsResponse.results.map((clinic) => [clinic.uuid, clinic.id]),
        ),
      );
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load visit details",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsLoadingContext(false);
    }
  }, [customer.uuid, toast]);

  useEffect(() => {
    if (open) {
      form.reset(createStartVisitDefaultValues());
      setVisitTypeSearch("");
      void loadDialogContext();
    }
  }, [form, loadDialogContext, open]);

  useEffect(() => {
    if (modeOfPayment !== "insurance") {
      form.setValue("requires_pre_authorization", false);
      form.setValue("pre_authorization_number", "");
      form.setValue("pre_authorization_comments", "");
      form.setValue("insurance_scheme", "");
    }
  }, [form, modeOfPayment]);

  useEffect(() => {
    if (!requiresPreAuth) {
      form.setValue("pre_authorization_number", "");
      form.setValue("pre_authorization_comments", "");
    }
  }, [form, requiresPreAuth]);

  const handleStartVisit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const visit = await createCustomerVisit(
        toCreateVisitPayload(customer.uuid, values),
      );

      onVisitChanged(visit);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Visit started",
        description: `Successfully started visit for ${customerName}.`,
      });
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof StartVisitFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not start visit",
          description: formatBffErrorMessage(error.message, error.errors),
        });
      } else {
        toast({
          variant: "error",
          title: "Could not start visit",
          description:
            error instanceof Error ? error.message : "Try again in a moment.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleCloseVisit = async () => {
    if (!activeVisit) {
      return;
    }

    setIsSubmitting(true);
    setCloseError(null);

    try {
      const visit = await closeCustomerVisit(activeVisit.uuid);
      onVisitChanged(visit);
      setActiveVisit(null);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Visit closed",
        description: `Successfully closed visit for ${customerName}.`,
      });
    } catch (error) {
      const message =
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : error instanceof Error
            ? error.message
            : "Failed to close visit.";

      setCloseError(message);
      toast({
        variant: "error",
        title: "Could not close visit",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
      >
        {isLoadingContext ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading visit details...
          </div>
        ) : activeVisit ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="border-b border-brand-border px-6 py-5">
              <DialogTitle>Close active visit</DialogTitle>
              <DialogDescription>
                End the current visit for {customerName}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              <div className="rounded-xl border border-brand-border bg-slate-50/60 p-5 text-sm">
                <dl className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-brand-muted">Visit type</dt>
                    <dd className="text-right font-medium text-brand-navy">
                      {activeVisit.visit_type_name}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-brand-muted">Date & time</dt>
                    <dd className="text-right font-medium text-brand-navy">
                      {formatDisplayDateTime(activeVisit.visit_date)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-brand-muted">Payment</dt>
                    <dd className="text-right font-medium capitalize text-brand-navy">
                      {activeVisit.mode_of_payment}
                    </dd>
                  </div>
                  {activeVisit.clinic_name ? (
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-brand-muted">Clinic</dt>
                      <dd className="text-right font-medium text-brand-navy">
                        {activeVisit.clinic_name}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-brand-muted">Started by</dt>
                    <dd className="text-right font-medium text-brand-navy">
                      {formatVisitStartedBy(activeVisit)}
                    </dd>
                  </div>
                </dl>
              </div>

              {!canClose && closeTooltip ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {closeTooltip}
                </p>
              ) : null}

              {closeError ? (
                <p className="text-sm text-red-600">{closeError}</p>
              ) : null}
            </div>

            <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
              {!canClose && closeTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <DestructiveButton type="button" disabled>
                        Close visit
                      </DestructiveButton>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{closeTooltip}</TooltipContent>
                </Tooltip>
              ) : (
                <DestructiveButton
                  type="button"
                  onClick={() => void handleCloseVisit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Closing...
                    </>
                  ) : (
                    "Close visit"
                  )}
                </DestructiveButton>
              )}
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={(event) => void handleStartVisit(event)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <DialogHeader className="border-b border-brand-border px-6 py-5">
                <DialogTitle>Start visit</DialogTitle>
                <DialogDescription>
                  Start a new visit for {customerName}.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                <FormField
                  control={form.control}
                  name="visit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Visit type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a visit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-72">
                          <div className="border-b border-brand-border p-2">
                            <Input
                              type="search"
                              placeholder="Search visit types..."
                              value={visitTypeSearch}
                              onChange={(event) =>
                                setVisitTypeSearch(event.target.value)
                              }
                            />
                          </div>
                          {filteredVisitTypes.length > 0 ? (
                            filteredVisitTypes.map((type) => (
                              <SelectItem key={type.uuid} value={type.uuid}>
                                {type.name}
                              </SelectItem>
                            ))
                          ) : (
                            <p className="px-2 py-3 text-center text-sm text-brand-muted">
                              No visit types found
                            </p>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visit_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Visit date & time <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mode_of_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mode of payment <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {modeOfPayment === "insurance" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="insurance_scheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance scheme</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={insuranceSchemes.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select insurance scheme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {insuranceSchemes.map((scheme) => (
                                <SelectItem key={scheme.uuid} value={scheme.uuid}>
                                  {scheme.scheme_name}
                                  {scheme.insurance_company_name
                                    ? ` · ${scheme.insurance_company_name}`
                                    : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {insuranceSchemes.length === 0 ? (
                            <p className="text-xs text-brand-muted">
                              This client has no insurance schemes on file.
                            </p>
                          ) : null}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requires_pre_authorization"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(event) =>
                                field.onChange(event.target.checked)
                              }
                              className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
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
                              <FormLabel>Pre-authorization comments</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Additional notes..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    ) : null}
                  </>
                ) : null}
              </div>

              <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
                <SecondaryButton
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (modeOfPayment === "insurance" && insuranceSchemes.length === 0)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Starting...
                    </>
                  ) : (
                    "Start visit"
                  )}
                </PrimaryButton>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
