"use client";

import { UserIdenticon } from "@/components/UserIdenticon";
import { Button } from "@/components/ui/button";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import type { ClinicalReferral } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

type IncomingReferralsTableProps = {
  referrals: ClinicalReferral[];
  onStart: (referral: ClinicalReferral) => void;
  className?: string;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "from", label: "From clinic", className: "hidden md:table-cell" },
  { key: "referred_by", label: "Referred by", className: "hidden lg:table-cell" },
  { key: "sent", label: "Sent" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "text-right pr-4" },
] as const;

export const INCOMING_REFERRALS_TABLE_SKELETON_COLUMNS = columns;

function formatStatusLabel(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "sent") {
    return "Awaiting start";
  }
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function IncomingReferralsTable({
  referrals,
  onStart,
  className,
}: IncomingReferralsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={"className" in column ? column.className : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {referrals.map((referral) => {
          const clientName = referral.customer_name?.trim() || "—";

          return (
            <ListPageDataTableRow
              key={referral.uuid}
              data-testid={`incoming-referral-row-${referral.uuid}`}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={referral.customer_uuid || clientName}
                    name={clientName}
                    className="size-8 shrink-0 rounded-md"
                  />
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-brand-navy">
                      {clientName}
                    </span>
                    {referral.customer_identifier ? (
                      <span className="block truncate font-mono text-dash-muted">
                        {referral.customer_identifier}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden md:table-cell">
                {referral.referring_clinic_name || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden lg:table-cell">
                {referral.referred_by_name || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="tabular-nums text-dash-muted">
                {referral.sent_at ? formatDisplayDateTime(referral.sent_at) : "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {formatStatusLabel(referral.status)}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="pr-4 text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-md border-dash-border bg-white px-2.5 text-xs font-medium text-brand-navy hover:bg-dash-canvas"
                  onClick={() => onStart(referral)}
                  data-testid={`incoming-referral-start-${referral.uuid}`}
                >
                  Start
                </Button>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
