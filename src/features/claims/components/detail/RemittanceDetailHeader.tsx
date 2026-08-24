"use client";

import { Calendar, FileText } from "lucide-react";
import type { ReactNode } from "react";

import { RemittanceBatchStatusBadge } from "@/features/claims/components/RemittanceBatchStatusBadge";
import type { RemittanceBatchDetail } from "@/features/claims/types/remittances.types";
import { remittanceDisplayName } from "@/features/claims/utils/remittance-display";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { formatDisplayDate } from "@/features/customers/utils/format-customer";

type RemittanceDetailHeaderProps = {
  batch: RemittanceBatchDetail;
  actions?: ReactNode;
};

export function RemittanceDetailHeader({
  batch,
  actions,
}: RemittanceDetailHeaderProps) {
  const title = remittanceDisplayName(batch);
  const docLabel = batch.document_number
    ? `Doc ${batch.document_number}`
    : batch.uuid.slice(0, 8);

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-muted sm:size-12"
            aria-hidden="true"
          >
            <FileText className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
                {title}
              </h1>
              <RemittanceBatchStatusBadge status={batch.status} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
              <span>{batch.payer_code}</span>
              <span className="font-mono text-xs text-brand-slate">{docLabel}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                Uploaded {formatDisplayDate(batch.created_at)}
              </span>
              {batch.payment_run_date ? (
                <span>
                  Payment run {formatDisplayDate(batch.payment_run_date)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}
