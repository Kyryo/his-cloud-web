"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Check,
  Copy,
  ExternalLink,
  HeartPulse,
  MoreHorizontal,
  Pencil,
  User,
} from "lucide-react";
import { useState } from "react";

import { HoverPreviewCard } from "@/components/hover-preview-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserIdenticon } from "@/components/UserIdenticon";
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
import type { Customer } from "@/features/customers/types/customer.types";
import { isCustomerVisitActive } from "@/features/customers/utils/customer-visit-status";
import {
  formatCustomerName,
  formatDisplayDate,
} from "@/features/customers/utils/format-customer";
import { useToast } from "@/providers/toast-provider";

type CustomersTableProps = {
  customers: Customer[];
  onRowClick?: (customer: Customer) => void;
  onStartVisit?: (customer: Customer) => void;
  onBookAppointment?: (customer: Customer) => void;
  onEditCustomer?: (customer: Customer) => void;
  className?: string;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "id", label: "Client ID / MRN" },
  { key: "visit_status", label: "Visit Status" },
  { key: "demographics", label: "Demographics" },
  { key: "created", label: "Registered" },
  { key: "actions", label: "Actions" },
] as const;

function CustomerHoverPreview({ customer }: { customer: Customer }) {
  const name = formatCustomerName(customer);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <UserIdenticon
          seed={customer.uuid || customer.customer_identifier || name}
          name={name}
          className="size-9 rounded-lg"
        />
        <div className="min-w-0">
          <p className="font-semibold text-brand-navy">{name}</p>
          <p className="font-mono text-sm text-brand-muted">
            {customer.customer_identifier || "No MRN"}
          </p>
        </div>
      </div>
      <div
        className="-mx-4 border-t border-dash-border"
        aria-hidden="true"
      />
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-brand-muted">Visit status</dt>
        <dd>
          <CustomerVisitStatusBadge status={customer.visit_status} />
        </dd>
        <dt className="text-brand-muted">Gender</dt>
        <dd className="font-medium text-brand-navy">{customer.gender || "—"}</dd>
        <dt className="text-brand-muted">Age</dt>
        <dd className="font-medium text-brand-navy">
          {customer.age > 0 ? `${customer.age} yrs` : "—"}
        </dd>
        <dt className="text-brand-muted">Phone</dt>
        <dd className="font-medium text-brand-navy">{customer.phone_number || "—"}</dd>
        <dt className="text-brand-muted">Email</dt>
        <dd className="truncate font-medium text-brand-navy">{customer.email || "—"}</dd>
      </dl>
      <div className="border-t border-dash-border/60 pt-2">
        <Link
          href={ROUTES.customerDetail(customer.uuid)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover"
        >
          <span>View client</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </div>
  );
}

export function CustomersTable({
  customers,
  onRowClick,
  onStartVisit,
  onBookAppointment,
  onEditCustomer,
  className,
}: CustomersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

  const handleCopyMrn = (event: React.MouseEvent, customer: Customer) => {
    event.stopPropagation();
    const identifier = customer.customer_identifier || customer.uuid;
    if (identifier) {
      void navigator.clipboard.writeText(identifier);
      setCopiedUuid(customer.uuid);
      setTimeout(() => setCopiedUuid(null), 2000);
      toast({
        variant: "success",
        title: "MRN copied",
        description: `${identifier} copied to clipboard.`,
      });
    }
  };

  const handleVisitAction = (customer: Customer) => {
    if (onStartVisit) {
      onStartVisit(customer);
      return;
    }
    router.push(ROUTES.customerDetail(customer.uuid));
  };

  const handleBookAppointment = (customer: Customer) => {
    if (onBookAppointment) {
      onBookAppointment(customer);
      return;
    }
    router.push(ROUTES.appointments);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <ListPageDataTable className={className}>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            {columns.map((column) => (
              <ListPageDataTableHeaderCell
                key={column.key}
                className={column.key === "actions" ? "text-right pr-4" : undefined}
              >
                {column.label}
              </ListPageDataTableHeaderCell>
            ))}
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {customers.map((customer) => {
            const name = formatCustomerName(customer);
            const identifier = customer.customer_identifier || "—";
            const isVisitActive = isCustomerVisitActive(customer.visit_status);
            const isCopied = copiedUuid === customer.uuid;

            return (
              <ListPageDataTableRow
                key={customer.uuid}
                className="group cursor-pointer"
                onClick={() => onRowClick?.(customer)}
              >
                <ListPageDataTableCell className="py-3">
                  <HoverPreviewCard
                    trigger={
                      <div className="flex min-w-0 items-center gap-3">
                        <UserIdenticon
                          seed={customer.uuid || identifier || name}
                          name={name}
                          className="size-9 shrink-0 rounded-lg shadow-2xs"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <Link
                            href={ROUTES.customerDetail(customer.uuid)}
                            className="block truncate text-[13px] font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {name}
                          </Link>
                          <div className="flex items-center gap-2 truncate text-[13px] text-brand-muted">
                            {customer.phone_number ? (
                              <span>{customer.phone_number}</span>
                            ) : customer.email ? (
                              <span className="truncate">{customer.email}</span>
                            ) : (
                              <span className="text-dash-muted">No phone / email</span>
                            )}
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <CustomerHoverPreview customer={customer} />
                  </HoverPreviewCard>
                </ListPageDataTableCell>

                <ListPageDataTableCell className="py-3">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="font-mono text-[13px] font-normal tracking-tight text-brand-navy">
                      {identifier}
                    </span>
                    {customer.customer_identifier ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => handleCopyMrn(e, customer)}
                            className="rounded p-1 text-dash-muted opacity-0 transition-all hover:bg-slate-100 hover:text-brand-navy group-hover:opacity-100 focus-visible:opacity-100"
                            aria-label="Copy MRN"
                          >
                            {isCopied ? (
                              <Check className="size-3 text-emerald-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {isCopied ? "Copied!" : "Copy MRN"}
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                </ListPageDataTableCell>

                <ListPageDataTableCell className="py-3">
                  <CustomerVisitStatusBadge status={customer.visit_status} />
                </ListPageDataTableCell>

                <ListPageDataTableCell className="py-3">
                  <div className="text-sm space-y-0.5">
                    <div className="font-medium text-brand-navy">
                      <span>{customer.gender || "—"}</span>
                      {customer.age > 0 ? (
                        <span className="text-dash-muted font-normal"> · {customer.age} yrs</span>
                      ) : null}
                    </div>
                  </div>
                </ListPageDataTableCell>

                <ListPageDataTableCell className="py-3 text-sm text-dash-muted tabular-nums">
                  {formatDisplayDate(customer.created_at)}
                </ListPageDataTableCell>

                <ListPageDataTableCell className="py-3 pr-4 text-right">
                  <div
                    className="flex items-center justify-end gap-1.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {isVisitActive ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-md border-amber-300 bg-amber-50 px-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 hover:border-amber-400 hover:text-amber-950"
                        onClick={() => handleVisitAction(customer)}
                      >
                        Close visit
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-md border-emerald-300 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-900"
                        onClick={() => handleVisitAction(customer)}
                      >
                        Start visit
                      </Button>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7.5 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleBookAppointment(customer)}
                          aria-label="Book appointment"
                        >
                          <CalendarPlus className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Book appointment</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7.5 rounded-lg text-dash-muted hover:bg-slate-100 hover:text-brand-navy"
                          aria-label="More options"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(ROUTES.customerDetail(customer.uuid))
                          }
                        >
                          <User className="size-4" />
                          <span>View client</span>
                        </DropdownMenuItem>
                        {onEditCustomer ? (
                          <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
                            <Pencil className="size-4 text-amber-600" />
                            <span>Edit demographics</span>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleVisitAction(customer)}>
                          <HeartPulse className="size-4 text-emerald-600" />
                          <span>{isVisitActive ? "Close visit" : "Start visit"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBookAppointment(customer)}
                        >
                          <CalendarPlus className="size-4 text-blue-600" />
                          <span>Book appointment</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleCopyMrn(e, customer)}
                          disabled={!customer.customer_identifier}
                        >
                          <Copy className="size-4" />
                          <span>Copy MRN / ID</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            );
          })}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </TooltipProvider>
  );
}
