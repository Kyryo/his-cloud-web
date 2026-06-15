"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ROUTES } from "@/constants/routes";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchCustomerInvoices } from "@/features/customers/services/customer-billing.service";
import type { CustomerInvoiceRecord } from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { InvoiceStatusBadge } from "@/features/invoices/components/InvoiceStatusBadge";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import type { InvoiceState } from "@/features/invoices/types/invoice.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

const INVOICES_PAGE_SIZE = 20;
const STAT_CARD_CLASS = "border-brand-border bg-white shadow-none";

type CustomerDetailInvoicesTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailInvoicesTab({
  customer,
  isActive,
}: CustomerDetailInvoicesTabProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<CustomerInvoiceRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadInvoices = useCallback(
    async (nextOffset = 0, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const response = await fetchCustomerInvoices(customer.uuid, {
          limit: INVOICES_PAGE_SIZE,
          offset: nextOffset,
        });

        setInvoices((current) =>
          append ? [...current, ...response.invoices] : response.invoices,
        );
        setTotalCount(response.pagination.count);
        setHasNext(response.pagination.has_next);
        setOffset(nextOffset);
        setHasLoaded(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load invoices.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [customer.uuid],
  );

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }
    void loadInvoices(0, false);
  }, [hasLoaded, isActive, loadInvoices]);

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton statCards={2} rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {loadError}
        </div>
        <Button type="button" variant="outline" onClick={() => void loadInvoices(0, false)}>
          Try again
        </Button>
      </div>
    );
  }

  const postedCount = invoices.filter((invoice) => invoice.state === "posted").length;

  return (
    <div className="space-y-4" data-testid="customer-detail-invoices-tab">
      <StatsCard1Grid>
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Total invoices"
          value={formatCompactNumber(totalCount)}
        />
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Posted"
          value={formatCompactNumber(postedCount)}
        />
      </StatsCard1Grid>

      {invoices.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Invoices for this client will appear here once sales orders are converted."
          data-testid="customer-invoices-empty-state"
        />
      ) : (
        <CustomerDetailRecordList
          title="Invoices"
          description="Posted invoices linked to this client."
          data-testid="customer-invoices-list"
          footer={
            hasNext ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={() => void loadInvoices(offset + INVOICES_PAGE_SIZE, true)}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            ) : null
          }
        >
          {invoices.map((invoice) => (
            <CustomerDetailRecordListItem
              key={invoice.id}
              compact
              title={invoice.name}
              badges={<InvoiceStatusBadge state={invoice.state as InvoiceState} />}
              description={formatInvoiceAmount(invoice.amount_total)}
              dateTime={formatDisplayDateTime(invoice.invoice_date)}
              onUpdate={() => router.push(ROUTES.invoiceDetail(invoice.id))}
              updateLabel="View invoice"
              data-testid={`customer-invoice-${invoice.id}`}
            />
          ))}
        </CustomerDetailRecordList>
      )}
    </div>
  );
}
