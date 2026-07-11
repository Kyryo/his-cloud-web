"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { StatusBanner } from "@/components/ui/status-banner";
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
import { Form } from "@/components/ui/form";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  fetchClinicalClinics,
  fetchClinicalDepartments,
} from "@/features/clinical/services/clinical-catalog.service";
import type {
  ClinicalClinic,
  ClinicalDepartment,
} from "@/features/clinical/types/clinical-catalog.types";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import {
  closeCustomerVisit,
  createCustomerVisit,
  fetchCustomerVisits,
  fetchVisit,
  findActiveCustomerVisit,
} from "@/features/customers/services/customer-visits.service";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  canCloseCustomerVisit,
  getCloseCustomerVisitTooltip,
} from "@/features/customers/utils/can-close-customer-visit";
import { formatCustomerName, formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import { OpenEncountersCloseNotice } from "@/features/visits/components/OpenEncountersCloseNotice";
import { StartVisitFormFields } from "@/features/visits/components/StartVisitFormFields";
import {
  createStartVisitDefaultValues,
  startVisitSchema,
  toCreateVisitPayload,
  type StartVisitFormValues,
} from "@/features/visits/schemas/start-visit.schema";
import { fetchConsultationServiceCatalog } from "@/features/visits/services/consultation-services.service";
import type { ConsultationServiceCatalogItem } from "@/features/visits/types/visit.types";
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

type StartVisitTab = "visit" | "payment";

const START_VISIT_TABS = [
  { id: "visit" as const, label: "Visit" },
  { id: "payment" as const, label: "Payment" },
];

export function CustomerVisitDialog({
  customer,
  open,
  onOpenChange,
  onVisitChanged,
}: CustomerVisitDialogProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState<StartVisitTab>("visit");
  const [consultationServices, setConsultationServices] = useState<
    ConsultationServiceCatalogItem[]
  >([]);
  const [insuranceSchemes, setInsuranceSchemes] = useState<CustomerInsurance[]>([]);
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [departments, setDepartments] = useState<ClinicalDepartment[]>([]);
  const [activeVisit, setActiveVisit] = useState<CustomerVisit | null>(null);
  const [activeVisitDetail, setActiveVisitDetail] = useState<VisitDetail | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [consultationServiceSearch, setConsultationServiceSearch] = useState("");

  const form = useForm<StartVisitFormValues>({
    resolver: zodResolver(startVisitSchema),
    defaultValues: createStartVisitDefaultValues(),
  });

  const selectedClinicUuid = form.watch("clinic");
  const modeOfPayment = form.watch("mode_of_payment");
  const requiresPreAuth = form.watch("requires_pre_authorization");
  const customerName = useMemo(() => formatCustomerName(customer), [customer]);
  const defaultClinic = userData?.primary_clinic ?? null;

  const clinicIdByUuid = useMemo(
    () => new Map(clinics.map((clinic) => [clinic.uuid, clinic.id])),
    [clinics],
  );

  const defaultClinicUuid = useMemo(() => {
    if (!defaultClinic) {
      return "";
    }

    return (
      clinics.find((clinic) => clinic.id === defaultClinic.id)?.uuid ?? ""
    );
  }, [clinics, defaultClinic]);

  const selectedClinicId = useMemo(() => {
    if (!selectedClinicUuid) {
      return defaultClinic?.id ?? null;
    }
    return clinicIdByUuid.get(selectedClinicUuid) ?? defaultClinic?.id ?? null;
  }, [clinicIdByUuid, defaultClinic?.id, selectedClinicUuid]);

  const hasDefaultClinic = Boolean(defaultClinic && defaultClinicUuid);

  const canClose = useMemo(
    () => canCloseCustomerVisit(userData, activeVisit, clinicIdByUuid),
    [activeVisit, clinicIdByUuid, userData],
  );

  const closeTooltip = useMemo(
    () => getCloseCustomerVisitTooltip(userData, activeVisit, clinicIdByUuid),
    [activeVisit, clinicIdByUuid, userData],
  );

  const loadDepartments = useCallback(async (clinicId: number) => {
    const nextDepartments = await fetchClinicalDepartments(clinicId);
    setDepartments(nextDepartments);
  }, []);

  const loadDialogContext = useCallback(async () => {
    setIsLoadingContext(true);
    setCloseError(null);

    try {
      const [services, visits, insurance, clinicList] = await Promise.all([
        fetchConsultationServiceCatalog(),
        fetchCustomerVisits(customer.uuid, { limit: 100 }),
        fetchCustomerInsurance(customer.uuid).catch(() => [] as CustomerInsurance[]),
        fetchClinicalClinics(),
      ]);

      setConsultationServices(services);
      setInsuranceSchemes(insurance);
      const active = findActiveCustomerVisit(visits);
      setActiveVisit(active);
      if (active) {
        setActiveVisitDetail(await fetchVisit(active.uuid));
      } else {
        setActiveVisitDetail(null);
      }
      setClinics(clinicList);

      const primaryClinic = userData?.primary_clinic ?? null;
      const matchedClinic = primaryClinic
        ? clinicList.find((clinic) => clinic.id === primaryClinic.id)
        : undefined;
      const primaryClinicUuid = matchedClinic?.uuid ?? "";

      form.reset(
        createStartVisitDefaultValues({
          clinic: primaryClinicUuid,
        }),
      );

      if (primaryClinic) {
        await loadDepartments(primaryClinic.id);
      } else {
        setDepartments([]);
      }
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
  }, [customer.uuid, form, loadDepartments, toast, userData?.primary_clinic]);

  useEffect(() => {
    if (open) {
      setActiveTab("visit");
      setConsultationServiceSearch("");
      void loadDialogContext();
    }
  }, [loadDialogContext, open]);

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
      setActiveVisitDetail(null);
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

  if (isLoadingContext) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg", appFont.className)}
        >
          <DialogHeader className="border-b border-brand-border px-6 py-5">
            <DialogTitle>Loading visit details</DialogTitle>
            <DialogDescription className="sr-only">
              Preparing the start visit form.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading visit details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (activeVisit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
            appFont.className,
          )}
        >
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
                    <dt className="text-brand-muted">Consultation service</dt>
                    <dd className="text-right font-medium text-brand-navy">
                      {activeVisit.consultation_service_name || "—"}
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
                <StatusBanner variant="warning" message={closeTooltip} />
              ) : null}

              <OpenEncountersCloseNotice
                encounters={activeVisitDetail?.encounters}
                appointmentLinked={Boolean(activeVisitDetail?.appointment)}
              />

              {closeError ? (
                <StatusBanner variant="error" message={closeError} />
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
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Start visit"
      description={`Start a walk-in visit for ${customerName}.`}
      tabs={START_VISIT_TABS}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as StartVisitTab)}
      className={appFont.className}
      data-testid="customer-visit-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          {!hasDefaultClinic ? null : activeTab === "visit" ? (
            <PrimaryButton type="button" onClick={() => setActiveTab("payment")}>
              Continue
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type="button"
              disabled={
                isSubmitting ||
                (modeOfPayment === "insurance" && insuranceSchemes.length === 0)
              }
              onClick={() => void handleStartVisit()}
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
          )}
        </>
      }
    >
      {!hasDefaultClinic ? (
        <div className="flex flex-col items-center px-2 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
            <Building2 className="size-6" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-brand-navy">
            No default clinic assigned
          </h3>
          <p className="mt-2 max-w-sm text-sm text-brand-muted">
            You don&apos;t have a default clinic set. Please ask an administrator to
            assign your primary clinic in Settings → User Management.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-4">
            <StartVisitFormFields
              form={form}
              tab={activeTab}
              defaultClinicName={defaultClinic?.name ?? "Your clinic"}
              departments={departments}
              consultationServices={consultationServices}
              insuranceSchemes={insuranceSchemes}
              consultationServiceSearch={consultationServiceSearch}
              onConsultationServiceSearchChange={setConsultationServiceSearch}
              selectedClinicId={selectedClinicId}
            />
          </form>
        </Form>
      )}
    </TabbedDialog>
  );
}
