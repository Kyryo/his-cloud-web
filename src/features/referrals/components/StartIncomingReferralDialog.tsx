"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { UserIdenticon } from "@/components/UserIdenticon";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBanner } from "@/components/ui/status-banner";
import { CustomerVisitSheetFooter } from "@/features/customers/components/detail/CustomerVisitSheetFooter";
import type { ClinicalReferral } from "@/features/clinical-opd/types/clinical-opd.types";
import { startClinicalReferral } from "@/features/clinical-opd/services/clinical-opd.service";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { StartReferralOrdersPanel } from "@/features/referrals/components/StartReferralOrdersPanel";
import {
  createStartReferralDefaultValues,
  startReferralSchema,
  toStartReferralPayload,
  type StartReferralFormValues,
} from "@/features/referrals/schemas/start-referral.schema";
import { StartVisitPaymentChoice } from "@/features/visits/components/StartVisitPaymentChoice";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type StartReferralStep = "payment" | "orders";

type StartIncomingReferralDialogProps = {
  referral: ClinicalReferral | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStarted: (referral: ClinicalReferral) => void;
};

export function StartIncomingReferralDialog({
  referral,
  open,
  onOpenChange,
  onStarted,
}: StartIncomingReferralDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<StartReferralStep>("payment");
  const [insuranceSchemes, setInsuranceSchemes] = useState<CustomerInsurance[]>(
    [],
  );
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<StartReferralFormValues>({
    resolver: zodResolver(startReferralSchema),
    defaultValues: referral
      ? createStartReferralDefaultValues(referral)
      : {
          mode_of_payment: "cash",
          insurance_scheme: "",
          requires_pre_authorization: false,
          pre_authorization_number: "",
          pre_authorization_comments: "",
          notes: "",
        },
  });

  const modeOfPayment = form.watch("mode_of_payment");

  useEffect(() => {
    if (!open || !referral) {
      return;
    }

    form.reset(createStartReferralDefaultValues(referral));
    setStep("payment");
    setLoadError(null);

    let cancelled = false;

    void (async () => {
      try {
        setIsLoadingSchemes(true);
        const schemes = await fetchCustomerInsurance(referral.customer_uuid);
        if (!cancelled) {
          setInsuranceSchemes(schemes);
        }
      } catch (error) {
        if (!cancelled) {
          setInsuranceSchemes([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load insurance schemes.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSchemes(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form, open, referral]);

  useEffect(() => {
    if (modeOfPayment !== "insurance") {
      form.setValue("requires_pre_authorization", false);
      form.setValue("pre_authorization_number", "");
      form.setValue("pre_authorization_comments", "");
      form.setValue("insurance_scheme", "");
    }
  }, [form, modeOfPayment]);

  const orderItems = referral?.items ?? [];
  const orderCount = orderItems.length;

  const footerRecap = useMemo(() => {
    if (!referral) {
      return null;
    }
    const paymentLabel =
      modeOfPayment === "insurance"
        ? "Insurance"
        : modeOfPayment === "free"
          ? "Free"
          : "Cash";
    const from = referral.referring_clinic_name?.trim();
    const parts = [
      paymentLabel,
      orderCount > 0
        ? `${orderCount} ${orderCount === 1 ? "order" : "orders"}`
        : null,
      from ? `from ${from}` : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [modeOfPayment, orderCount, referral]);

  async function goToOrders() {
    const paymentFields =
      form.getValues("mode_of_payment") === "insurance"
        ? (["mode_of_payment", "insurance_scheme"] as const)
        : (["mode_of_payment"] as const);
    const valid = await form.trigger([...paymentFields]);
    if (valid) {
      setStep("orders");
    }
  }

  const handleStart = form.handleSubmit(async (values) => {
    if (!referral) {
      return;
    }

    try {
      setIsSaving(true);
      const started = await startClinicalReferral(
        referral.uuid,
        toStartReferralPayload(values),
      );
      onStarted(started);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Referral started",
        description: "The receiving visit is open under Active Visits.",
      });
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in form.getValues()) {
            form.setError(field as keyof StartReferralFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not start referral",
          description: formatBffErrorMessage(error.message, error.errors),
        });
      } else {
        toast({
          variant: "error",
          title: "Could not start referral",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  });

  const insuranceUnavailable =
    modeOfPayment === "insurance" &&
    !isLoadingSchemes &&
    insuranceSchemes.length === 0;

  const clientName = referral?.customer_name?.trim() || "Client";
  const meta = [
    referral?.customer_identifier,
    referral?.referring_clinic_name
      ? `From ${referral.referring_clinic_name}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          appFont.className,
          "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
        )}
        data-testid="start-incoming-referral-dialog"
      >
        <SheetHeader className="space-y-0 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
          <div className="flex items-center gap-3.5">
            <UserIdenticon
              seed={referral?.customer_uuid || clientName}
              name={clientName}
              className="size-11 shrink-0 rounded-xl"
              fallbackClassName="text-sm font-semibold"
            />
            <div className="min-w-0">
              <SheetTitle className="text-sm font-medium text-dash-muted">
                Start referral
              </SheetTitle>
              <p className="truncate text-base font-semibold tracking-tight text-brand-navy">
                {clientName}
              </p>
              {meta ? (
                <p className="mt-0.5 truncate text-sm text-dash-muted">{meta}</p>
              ) : null}
            </div>
          </div>
          <SheetDescription className="sr-only">
            Confirm payment and review referred orders for {clientName}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loadError ? (
            <StatusBanner variant="error" message={loadError} />
          ) : null}

          <Form {...form}>
            <form className="space-y-6">
              <nav
                aria-label="Start referral steps"
                className="flex items-center gap-5 border-b border-dash-border/70"
              >
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  className={cn(
                    "relative -mb-px pb-2.5 text-sm",
                    step === "payment"
                      ? "font-medium text-brand-navy"
                      : "text-dash-muted hover:text-brand-navy",
                  )}
                >
                  Payment
                  {step === "payment" ? (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-brand-navy" />
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => void goToOrders()}
                  className={cn(
                    "relative -mb-px pb-2.5 text-sm",
                    step === "orders"
                      ? "font-medium text-brand-navy"
                      : "text-dash-muted hover:text-brand-navy",
                  )}
                >
                  Orders
                  {step === "orders" ? (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-brand-navy" />
                  ) : null}
                </button>
              </nav>

              {step === "payment" ? (
                <StartVisitPaymentChoice
                  form={form}
                  insuranceSchemes={insuranceSchemes}
                  customerUuid={referral?.customer_uuid ?? ""}
                  onInsuranceHrefClick={() => onOpenChange(false)}
                />
              ) : (
                <StartReferralOrdersPanel
                  items={orderItems}
                  serviceTypeFallback={referral?.service_type}
                />
              )}
            </form>
          </Form>
        </div>

        <CustomerVisitSheetFooter recap={footerRecap}>
          {step === "orders" ? (
            <>
              <SecondaryButton
                type="button"
                disabled={isSaving}
                onClick={() => setStep("payment")}
              >
                Back
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={isSaving || isLoadingSchemes || insuranceUnavailable}
                onClick={() => void handleStart()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Starting…
                  </>
                ) : (
                  "Start intake"
                )}
              </PrimaryButton>
            </>
          ) : (
            <>
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </SecondaryButton>
              <SecondaryButton
                type="button"
                disabled={isSaving || isLoadingSchemes || insuranceUnavailable}
                onClick={() => void goToOrders()}
              >
                Review orders
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={isSaving || isLoadingSchemes || insuranceUnavailable}
                onClick={() => void handleStart()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Starting…
                  </>
                ) : (
                  "Start intake"
                )}
              </PrimaryButton>
            </>
          )}
        </CustomerVisitSheetFooter>
      </SheetContent>
    </Sheet>
  );
}
