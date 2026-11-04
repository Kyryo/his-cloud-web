"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatCustomerListAge,
  formatCustomerName,
  formatDisplayDate,
} from "@/features/customers/utils/format-customer";
import { useToast } from "@/providers/toast-provider";

type OhEmployeesTableProps = {
  customers: Customer[];
  onRowClick?: (customer: Customer) => void;
  className?: string;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "id", label: "Client ID / MRN" },
  { key: "employer", label: "Employer" },
  { key: "risk_profile", label: "Risk profile" },
  { key: "demographics", label: "Demographics" },
  { key: "created", label: "Registered" },
] as const;

export function OhEmployeesTable({
  customers,
  onRowClick,
  className,
}: OhEmployeesTableProps) {
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

  return (
    <TooltipProvider delayDuration={200}>
      <ListPageDataTable className={className} data-testid="oh-employees-table">
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
            const identifier = customer.customer_identifier || "—";
            const isCopied = copiedUuid === customer.uuid;
            const listAge = formatCustomerListAge(customer);

            return (
              <ListPageDataTableRow
                key={customer.uuid}
                className="group cursor-pointer"
                onClick={() => onRowClick?.(customer)}
              >
                <ListPageDataTableCell>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <UserIdenticon
                      seed={customer.uuid || identifier || name}
                      name={name}
                      className="size-8 shrink-0 rounded-md"
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
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[13px] text-brand-navy">
                      {identifier}
                    </span>
                    {customer.customer_identifier || customer.uuid ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 text-dash-muted hover:text-brand-navy"
                            aria-label="Copy client ID"
                            onClick={(event) => handleCopyMrn(event, customer)}
                          >
                            {isCopied ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isCopied ? "Copied" : "Copy ID"}
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <span className="text-[13px] text-brand-navy">
                    {customer.oh_employer_name?.trim() || "—"}
                  </span>
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <span className="text-[13px] text-brand-navy">
                    {customer.oh_hazard_profile_name?.trim() || "—"}
                  </span>
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <span className="text-[13px] text-brand-navy">
                    {[customer.gender, listAge].filter(Boolean).join(" · ") || "—"}
                  </span>
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <span className="text-[13px] text-brand-muted">
                    {formatDisplayDate(customer.created_at) || "—"}
                  </span>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            );
          })}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </TooltipProvider>
  );
}
