"use client";

import Link from "next/link";

import { ClientAvatar } from "@/components/client-avatar";
import { HoverPreviewCard } from "@/components/hover-preview-card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatCustomerName,
  formatDisplayDate,
} from "@/features/customers/utils/format-customer";
import { formatErpSyncStatus } from "@/features/customers/constants/customer-sync-labels";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type CustomersTableProps = {
  customers: Customer[];
  onRowClick?: (customer: Customer) => void;
  className?: string;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "id", label: "Client ID" },
  { key: "visit_status", label: "Visit status" },
  { key: "gender", label: "Gender" },
  { key: "age", label: "Age" },
  { key: "created", label: "Created" },
] as const;

function CustomerHoverPreview({ customer }: { customer: Customer }) {
  const name = formatCustomerName(customer);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <ClientAvatar name={name} />
        <div>
          <p className="font-medium text-brand-navy">{name}</p>
          <p className="text-xs text-brand-muted">{customer.customer_identifier}</p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-brand-muted">Visit status</dt>
        <dd>
          <CustomerVisitStatusBadge status={customer.visit_status} />
        </dd>
        <dt className="text-brand-muted">Gender</dt>
        <dd>{customer.gender}</dd>
        <dt className="text-brand-muted">Age</dt>
        <dd>{customer.age > 0 ? `${customer.age} yrs` : "—"}</dd>
        <dt className="text-brand-muted">Phone</dt>
        <dd>{customer.phone_number || "—"}</dd>
        <dt className="text-brand-muted">Email</dt>
        <dd className="truncate">{customer.email || "—"}</dd>
        <dt className="text-brand-muted">ERP</dt>
        <dd>{formatErpSyncStatus(customer.has_synced_to_odoo)}</dd>
      </dl>
    </div>
  );
}

export function CustomersTable({
  customers,
  onRowClick,
  className,
}: CustomersTableProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-brand-border bg-white",
          className,
        )}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-brand-border bg-slate-50/80">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-brand-muted"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {customers.map((customer) => {
                const name = formatCustomerName(customer);

                return (
                  <tr
                    key={customer.uuid}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => onRowClick?.(customer)}
                  >
                    <td className="px-4 py-3">
                      <HoverPreviewCard
                        trigger={
                          <div className="flex min-w-0 items-center gap-3">
                            <ClientAvatar name={name} />
                            <div className="min-w-0">
                              <Link
                                href={ROUTES.customerDetail(customer.uuid)}
                                className="truncate text-sm font-medium text-brand-navy hover:text-brand-primary hover:underline"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {name}
                              </Link>
                              {customer.phone_number ? (
                                <p className="truncate text-xs text-brand-muted">
                                  {customer.phone_number}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        }
                      >
                        <CustomerHoverPreview customer={customer} />
                      </HoverPreviewCard>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-brand-slate">
                      {customer.customer_identifier}
                    </td>
                    <td className="px-4 py-3">
                      <CustomerVisitStatusBadge status={customer.visit_status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {customer.gender}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {customer.age > 0 ? customer.age : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {formatDisplayDate(customer.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}

type CustomersPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export function CustomersPagination({
  page,
  pageSize,
  totalCount,
  hasPrevious,
  hasNext,
  onPageChange,
  isLoading = false,
}: CustomersPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-brand-muted">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-brand-slate">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
