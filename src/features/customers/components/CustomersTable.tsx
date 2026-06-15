"use client";

import Link from "next/link";

import { ClientAvatar } from "@/components/client-avatar";
import { HoverPreviewCard } from "@/components/hover-preview-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { formatErpSyncStatus } from "@/features/customers/constants/customer-sync-labels";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatCustomerName,
  formatDisplayDate,
} from "@/features/customers/utils/format-customer";
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
          <p className="text-xs text-brand-muted">
            {customer.customer_identifier}
          </p>
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
        <dd>{customer.age > 0 ? `${customer.age} yrs` : "-"}</dd>
        <dt className="text-brand-muted">Phone</dt>
        <dd>{customer.phone_number || "-"}</dd>
        <dt className="text-brand-muted">Email</dt>
        <dd className="truncate">{customer.email || "—"}</dd>
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
      <ListPageDataTable className={className}>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            {columns.map((column) => (
              <ListPageDataTableHeaderCell key={column.key}>
                {column.label}
              </ListPageDataTableHeaderCell>
            ))}
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {customers.map((customer) => {
            const name = formatCustomerName(customer);

            return (
              <ListPageDataTableRow
                key={customer.uuid}
                className="cursor-pointer"
                onClick={() => onRowClick?.(customer)}
              >
                <ListPageDataTableCell>
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
                </ListPageDataTableCell>
                <ListPageDataTableCell className="font-mono text-sm text-brand-slate">
                  {customer.customer_identifier}
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <CustomerVisitStatusBadge status={customer.visit_status} />
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {customer.gender}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {customer.age > 0 ? customer.age : "-"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {formatDisplayDate(customer.created_at)}
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            );
          })}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </TooltipProvider>
  );
}
