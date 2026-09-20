"use client";

import { useEffect, useState } from "react";

import { PaymentDetailActions } from "@/features/payments/components/detail/PaymentDetailActions";
import { PaymentDetailHeader } from "@/features/payments/components/detail/PaymentDetailHeader";
import { PaymentDetailTabs } from "@/features/payments/components/detail/PaymentDetailTabs";
import { fetchPayment } from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  DetailPageLayout,
  DetailPageNotFound,
  DetailPageSkeleton,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";

type PaymentDetailPageProps = {
  paymentId: string;
};

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
    return (
      <DetailPageSkeleton
        tabCount={2}
        data-testid="payment-detail-skeleton"
      />
    );
  }

  if (error || !payment) {
    return (
      <DetailPageNotFound
        title="Payment not found"
        message={error ?? "This payment could not be loaded."}
      />
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
      <PaymentDetailTabs payment={payment} />
    </DetailPageLayout>
  );
}
