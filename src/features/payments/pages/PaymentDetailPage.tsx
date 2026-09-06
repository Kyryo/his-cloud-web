"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { PaymentDetailActions } from "@/features/payments/components/detail/PaymentDetailActions";
import { PaymentDetailHeader } from "@/features/payments/components/detail/PaymentDetailHeader";
import { PaymentDetailView } from "@/features/payments/components/detail/PaymentDetailView";
import { fetchPayment } from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  DetailPageHeaderSection,
  DetailPageLayout,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";

type PaymentDetailPageProps = {
  paymentId: string;
};

function PaymentDetailSkeleton() {
  return (
    <DetailPageLayout data-testid="payment-detail-skeleton">
      <DetailPageHeaderSection>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </DetailPageHeaderSection>
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-12 w-52" />
        <Skeleton className="mt-8 h-5 w-40" />
        <Skeleton className="mt-4 h-20 w-full max-w-md" />
      </div>
    </DetailPageLayout>
  );
}

export function PaymentDetailPage({ paymentId }: PaymentDetailPageProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(payment?.name || (payment ? `Payment #${payment.id}` : null));

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchPayment(paymentId);
        if (!cancelled) {
          setPayment(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payment.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  if (isLoading) {
    return <PaymentDetailSkeleton />;
  }

  if (error || !payment) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Payment not found</h1>
        <p className="mt-2 text-sm text-red-700">
          {error ?? "This payment could not be loaded."}
        </p>
      </div>
    );
  }

  return (
    <DetailPageLayout data-testid="payment-detail-page">
      <PaymentDetailHeader
        payment={payment}
        actions={
          <PaymentDetailActions
            payment={payment}
            onPaymentUpdated={setPayment}
          />
        }
      />
      <PaymentDetailView payment={payment} />
    </DetailPageLayout>
  );
}
