"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { fetchConsultationServiceCatalog } from "@/features/visits/services/consultation-services.service";
import { startVisitFromAppointment } from "@/features/visits/services/visits.service";
import type {
  ConsultationServiceCatalogItem,
  VisitDetail,
} from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

const startFromAppointmentSchema = z
  .object({
    consultation_service: z.string().optional(),
    mode_of_payment: z.enum(["cash", "insurance"]),
    insurance_scheme: z.string().optional(),
    requires_pre_authorization: z.boolean(),
    pre_authorization_number: z.string().trim(),
    pre_authorization_comments: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (values.mode_of_payment === "insurance" && !values.insurance_scheme) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an insurance scheme",
        path: ["insurance_scheme"],
      });
    }

    if (
      values.requires_pre_authorization &&
      !values.pre_authorization_number.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pre-authorization number is required",
        path: ["pre_authorization_number"],
      });
    }
  });

type StartFromAppointmentFormValues = z.infer<typeof startFromAppointmentSchema>;

type StartVisitFromAppointmentDialogProps = {
  appointment: Appointment;
  patientUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStarted: (visit: VisitDetail) => void;
};

export function StartVisitFromAppointmentDialog({
  appointment,
  patientUuid,
  open,
  onOpenChange,
  onStarted,
}: StartVisitFromAppointmentDialogProps) {
  const { toast } = useToast();
  const [consultationServices, setConsultationServices] = useState<
    ConsultationServiceCatalogItem[]
  >([]);
  const [insuranceSchemes, setInsuranceSchemes] = useState<CustomerInsurance[]>([]);
  const [consultationServiceSearch, setConsultationServiceSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"visit" | "payment">("visit");

  const form = useForm<StartFromAppointmentFormValues>({
    resolver: zodResolver(startFromAppointmentSchema),
    defaultValues: {
      consultation_service: "",
      mode_of_payment: "cash",
      insurance_scheme: "",
      requires_pre_authorization: false,
      pre_authorization_number: "",
      pre_authorization_comments: "",
    },
  });

  const modeOfPayment = form.watch("mode_of_payment");
  const requiresPreAuth = form.watch("requires_pre_authorization");

  const filteredServices = useMemo(
    () =>
      consultationServices.filter((service) =>
        service.name.toLowerCase().includes(consultationServiceSearch.toLowerCase()),
      ),
    [consultationServiceSearch, consultationServices],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      consultation_service: "",
      mode_of_payment: "cash",
      insurance_scheme: "",
      requires_pre_authorization: false,
      pre_authorization_number: "",
      pre_authorization_comments: "",
    });
    setActiveTab("visit");
    setConsultationServiceSearch("");

    void Promise.all([
      fetchConsultationServiceCatalog().then(setConsultationServices),
      fetchCustomerInsurance(patientUuid)
        .then(setInsuranceSchemes)
        .catch(() => setInsuranceSchemes([])),
    ]);
  }, [appointment.uuid, form, open, patientUuid]);

  useEffect(() => {
    if (modeOfPayment !== "insurance") {
      form.setValue("requires_pre_authorization", false);
      form.setValue("pre_authorization_number", "");
      form.setValue("pre_authorization_comments", "");
      form.setValue("insurance_scheme", "");
    }
  }, [form, modeOfPayment]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const visit = await startVisitFromAppointment(appointment.uuid, {
        consultation_service: values.consultation_service || null,
        mode_of_payment: values.mode_of_payment,
        insurance_scheme:
          values.mode_of_payment === "insurance"
            ? values.insurance_scheme || null
            : null,
      });

      toast({
        variant: "success",
        title: "Visit started",
        description: "The appointment is now in progress.",
      });
      onStarted(visit);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof StartFromAppointmentFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not start visit",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not start visit",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Start visit from appointment"
      description={`${appointment.patient_name} · ${appointment.department_name} · ${new Date(appointment.scheduled_start).toLocaleString()}`}
      tabs={[
        { id: "visit", label: "Visit" },
        { id: "payment", label: "Payment" },
      ]}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as "visit" | "payment")}
      className={appFont.className}
      data-testid="start-visit-from-appointment-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          {activeTab === "visit" ? (
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
              onClick={() => void handleSubmit()}
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
      <Form {...form}>
        <form className="space-y-4">
          {activeTab === "visit" ? (
            <>
              <div className="rounded-xl border border-brand-border bg-slate-50/60 p-4 text-sm">
                <dl className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-brand-muted">Clinic</dt>
                    <dd className="font-medium text-brand-navy">{appointment.clinic_name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-brand-muted">Department</dt>
                    <dd className="font-medium text-brand-navy">
                      {appointment.department_name}
                    </dd>
                  </div>
                  {appointment.location_name ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-brand-muted">Location</dt>
                      <dd className="font-medium text-brand-navy">
                        {appointment.location_name}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <FormField
                control={form.control}
                name="consultation_service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation service</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a consultation service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-72">
                        <div className="border-b border-brand-border p-2">
                          <Input
                            type="search"
                            placeholder="Search services..."
                            value={consultationServiceSearch}
                            onChange={(event) =>
                              setConsultationServiceSearch(event.target.value)
                            }
                          />
                        </div>
                        {filteredServices.map((service) => (
                          <SelectItem key={service.uuid} value={service.uuid}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
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
                    name="requires_pre_authorization"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                            className="size-4 rounded border-brand-border"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Requires pre-authorization
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {requiresPreAuth ? (
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
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </form>
      </Form>
    </TabbedDialog>
  );
}
