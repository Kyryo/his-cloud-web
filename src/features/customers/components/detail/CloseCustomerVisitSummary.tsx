import { StatusBanner } from "@/components/ui/status-banner";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatVisitElapsed } from "@/features/customers/utils/format-visit-elapsed";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import { OpenEncountersCloseNotice } from "@/features/visits/components/OpenEncountersCloseNotice";
import type { VisitDetail } from "@/features/visits/types/visit.types";

type CloseCustomerVisitSummaryProps = {
  visit: CustomerVisit;
  visitDetail: VisitDetail | null;
  closeTooltip?: string | null;
  canClose: boolean;
  closeError?: string | null;
};

export function CloseCustomerVisitSummary({
  visit,
  visitDetail,
  closeTooltip,
  canClose,
  closeError,
}: CloseCustomerVisitSummaryProps) {
  const elapsed = formatVisitElapsed(visit.visit_date);
  type SummaryRow = { label: string; value: string; capitalize?: boolean };
  const rows: SummaryRow[] = [
    {
      label: "Started",
      value: [
        formatDisplayDateTime(visit.visit_date),
        elapsed ? `${elapsed} ago` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      label: "Service",
      value: visit.consultation_service_name || "None",
    },
    {
      label: "Payment",
      value: visit.mode_of_payment,
      capitalize: true,
    },
    ...(visit.clinic_name
      ? [{ label: "Clinic", value: visit.clinic_name }]
      : []),
    {
      label: "Started by",
      value: formatVisitStartedBy(visit),
    },
  ];

  return (
    <div className="space-y-5">
      <dl className="divide-y divide-dash-border/70 border-y border-dash-border/70">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <dt className="text-sm text-dash-muted">{row.label}</dt>
            <dd
              className={
                row.capitalize
                  ? "text-right text-sm font-medium capitalize text-brand-navy"
                  : "text-right text-sm font-medium text-brand-navy"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {!canClose && closeTooltip ? (
        <StatusBanner variant="warning" message={closeTooltip} />
      ) : null}

      <OpenEncountersCloseNotice
        encounters={visitDetail?.encounters}
        appointmentLinked={Boolean(visitDetail?.appointment)}
      />

      {closeError ? <StatusBanner variant="error" message={closeError} /> : null}
    </div>
  );
}
