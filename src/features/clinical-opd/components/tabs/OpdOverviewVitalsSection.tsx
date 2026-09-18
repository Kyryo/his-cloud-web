import Link from "next/link";

import { OpdVitalReading } from "@/features/clinical-opd/components/detail/OpdVitalReading";
import type { OpdEncounterVitalStat } from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { formatVitalRecordedLabel } from "@/features/clinical-opd/utils/opd-encounter-vitals";

type OpdOverviewVitalsSectionProps = {
  vitals: OpdEncounterVitalStat[];
  title?: string;
  headingId?: string;
  recordHref?: string;
};

function OverviewVital({
  stat,
  size,
}: {
  stat: OpdEncounterVitalStat;
  size: "md" | "lg";
}) {
  const recordedLabel = formatVitalRecordedLabel(stat.recordedAt);

  return (
    <div>
      <dt className="text-xs text-dash-muted">{stat.label}</dt>
      <dd className="mt-1.5">
        <OpdVitalReading value={stat.value} size={size} />
        {recordedLabel ? (
          <p className="mt-1 text-xs text-brand-muted">{recordedLabel}</p>
        ) : null}
      </dd>
    </div>
  );
}

export function OpdOverviewVitalsSection({
  vitals,
  title = "Latest vitals",
  headingId = "opd-overview-vitals-heading",
  recordHref,
}: OpdOverviewVitalsSectionProps) {
  const bloodPressure = vitals.find((stat) => stat.key === "blood-pressure");
  const otherVitals = vitals.filter((stat) => stat.key !== "blood-pressure");

  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id={headingId}
          className="text-base font-semibold tracking-tight text-brand-navy"
        >
          {title}
        </h2>
        {recordHref ? (
          <Link
            href={recordHref}
            className="text-sm text-brand-primary hover:underline"
          >
            Record vitals
          </Link>
        ) : null}
      </div>

      <dl className="mt-5">
        {bloodPressure ? (
          <div className="border-b border-dash-border/70 pb-5">
            <OverviewVital stat={bloodPressure} size="lg" />
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-x-6 gap-y-5 pt-5">
          {otherVitals.map((stat) => (
            <OverviewVital key={stat.key} stat={stat} size="md" />
          ))}
        </div>
      </dl>
    </section>
  );
}
