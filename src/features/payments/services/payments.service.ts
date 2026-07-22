import { BFF_PAYMENTS_ROUTES } from "@/constants/api";
import type {
  Payment,
  PaymentListFilters,
  PaymentListResponse,
  CreatePaymentPayload,
  SendPaymentReceiptPayload,
  UpdatePaymentPayload,
} from "@/features/payments/types/payment.types";
import { bffRequest } from "@/lib/bff-client";

function buildPaymentsQuery(filters: PaymentListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.paymentMethod) {
    params.set("payment_method", filters.paymentMethod);
  }
  if (filters.dateFrom) {
    params.set("date_from", filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set("date_to", filters.dateTo);
  }
  if (filters.customerId) {
    params.set("customer_id", String(filters.customerId));
  }
  if (filters.invoiceId) {
    params.set("invoice_id", String(filters.invoiceId));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchPayments(
  filters: PaymentListFilters = {},
): Promise<PaymentListResponse> {
  return bffRequest<PaymentListResponse>(
    `${BFF_PAYMENTS_ROUTES.list}${buildPaymentsQuery(filters)}`,
  );
}

export async function fetchPayment(paymentId: number | string): Promise<Payment> {
  return bffRequest<Payment>(BFF_PAYMENTS_ROUTES.detail(paymentId));
}

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  return bffRequest<Payment>(BFF_PAYMENTS_ROUTES.list, {
    method: "POST",
    body: {
      invoice_id: payload.invoiceId,
      customer_id: payload.customerId,
      customer_uuid: payload.customerUuid,
      applies_to_opening_balance: payload.appliesToOpeningBalance,
      amount: payload.amount,
      payment_method: payload.paymentMethod,
      payment_date: payload.paymentDate,
      note: payload.note,
    },
  });
}

export async function updatePayment(
  paymentId: number | string,
  payload: UpdatePaymentPayload,
): Promise<Payment> {
  return bffRequest<Payment>(BFF_PAYMENTS_ROUTES.detail(paymentId), {
    method: "PATCH",
    body: {
      amount: payload.amount,
      payment_method: payload.paymentMethod,
      payment_date: payload.paymentDate,
      note: payload.note,
    },
  });
}

export async function cancelPayment(
  paymentId: number | string,
): Promise<Payment> {
  return bffRequest<Payment>(BFF_PAYMENTS_ROUTES.cancel(paymentId), {
    method: "POST",
  });
}

export async function sendPaymentReceipt(
  paymentId: number | string,
  payload: SendPaymentReceiptPayload,
): Promise<{ queued: boolean }> {
  return bffRequest<{ queued: boolean }>(BFF_PAYMENTS_ROUTES.sendReceipt(paymentId), {
    method: "POST",
    body: {
      email: payload.email,
    },
  });
}
