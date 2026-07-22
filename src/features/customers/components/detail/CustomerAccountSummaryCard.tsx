"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EditButton } from "@/components/ui/edit-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryHighlight,
} from "@/features/app-shell/components/page-layout";
import { EditCustomerOpeningBalanceDialog } from "@/features/customers/components/detail/EditCustomerOpeningBalanceDialog";
import { RecordOpeningBalancePaymentDialog } from "@/features/customers/components/detail/RecordOpeningBalancePaymentDialog";
import {
  fetchCustomerBillingSummary,
  updateCustomerOpeningBalance,
} from "@/features/customers/services/customer-billing.service";
import type { CustomerBillingTotals } from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type CustomerAccountSummaryCardProps = {
  customer: Customer;
  refreshKey?: number;
  onOpeningBalanceUpdated?: (customer: Customer) => void;
  onBillingUpdated?: () => void;
};

function parseBillingAmount(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function CustomerAccountSummaryCard({
  customer,
  refreshKey = 0,
  onOpeningBalanceUpdated,
  onBillingUpdated,
}: CustomerAccountSummaryCardProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const isBillingUser = (userData?.groups ?? []).includes("Billing");

  const [totals, setTotals] = useState<CustomerBillingTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadTotals = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const billing = await fetchCustomerBillingSummary(customer.uuid);
      setTotals(billing.totals);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load account summary.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customer.uuid]);

  useEffect(() => {
    void loadTotals();
  }, [loadTotals, refreshKey]);

  const outstanding = parseBillingAmount(totals?.total_due);
  const hasOutstanding = outstanding > 0;
  const openingBalance =
    totals?.opening_balance ?? customer.opening_balance ?? "0.00";
  const hasOpeningBalance = Math.abs(parseBillingAmount(openingBalance)) > 0;
  const remainingOpeningBalance = parseBillingAmount(
    totals?.opening_balance_remaining,
  );
  const canRecordOpeningBalancePayment = remainingOpeningBalance > 0;

  async function handleSave(nextOpeningBalance: string): Promise<boolean> {
    setIsSaving(true);
    try {
      const updated = await updateCustomerOpeningBalance(
        customer.uuid,
        nextOpeningBalance,
      );
      onOpeningBalanceUpdated?.(updated);
      await loadTotals();
      onBillingUpdated?.();
      toast({
        variant: "success",
        title: "Opening balance updated",
        description: "Outstanding balance was recalculated.",
      });
      return true;
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update opening balance",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "The opening balance could not be saved.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <DetailPageAsideSummaryHighlight
        title="Account Summary"
        className={cn(hasOutstanding && "border-red-200 bg-red-50/70")}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EditButton
                label="Manage"
                className="gap-1"
                data-testid="customer-account-summary-manage-button"
              >
                Manage
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </EditButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                data-testid="customer-account-summary-opening-balance-menu-item"
              >
                {hasOpeningBalance ? "Edit opening balance" : "Add opening balance"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canRecordOpeningBalancePayment}
                title={
                  canRecordOpeningBalancePayment
                    ? undefined
                    : "Record payment requires an unpaid opening balance."
                }
                onClick={() => setRecordPaymentOpen(true)}
                data-testid="customer-account-summary-record-payment-menu-item"
              >
                Record payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      >
        {isLoading && !totals ? (
          <div className="flex items-center gap-2 py-2 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading...
          </div>
        ) : loadError && !totals ? (
          <p className="py-2 text-sm text-red-600">{loadError}</p>
        ) : (
          <dl className="space-y-2.5">
            <DetailPageAsideSummaryAmountRow
              label="Opening balance"
              value={formatSalesOrderAmount(openingBalance, "MWK")}
            />
            <DetailPageAsideSummaryAmountRow
              label="Invoices"
              value={formatSalesOrderAmount(totals?.total_invoiced ?? 0, "MWK")}
            />
            <DetailPageAsideSummaryAmountRow
              label="Payments"
              value={formatSalesOrderAmount(totals?.total_paid ?? 0, "MWK")}
            />
            <DetailPageAsideSummaryAmountRow
              label="Outstanding balance"
              value={formatSalesOrderAmount(totals?.total_due ?? 0, "MWK")}
              variant={hasOutstanding ? "danger" : "default"}
              emphasized
            />
          </dl>
        )}
      </DetailPageAsideSummaryHighlight>

      <EditCustomerOpeningBalanceDialog
        open={editOpen}
        isSaving={isSaving}
        canEdit={isBillingUser}
        initialOpeningBalance={openingBalance}
        onOpenChange={setEditOpen}
        onSave={handleSave}
      />

      <RecordOpeningBalancePaymentDialog
        customer={customer}
        remainingBalance={remainingOpeningBalance}
        open={recordPaymentOpen}
        canRecord={isBillingUser}
        onOpenChange={setRecordPaymentOpen}
        onRecorded={() => {
          void loadTotals();
          onBillingUpdated?.();
        }}
      />
    </>
  );
}
