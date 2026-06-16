"use client";

import { useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { PaymentDetailHeader } from "@/features/payments/components/detail/PaymentDetailHeader";
import { PaymentDetailTabs } from "@/features/payments/components/detail/PaymentDetailTabs";
import { fetchPayment } from "@/features/payments/services/payments.service";
import type { Payment } from "@/features/payments/types/payment.types";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
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
    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchPayment(paymentId);
        setPayment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [paymentId]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading payment..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
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
      <PaymentDetailHeader payment={payment} />
      <PaymentDetailTabs payment={payment} />
    </DetailPageLayout>
  );
}
