import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Building2,
  CalendarClock,
  CircleDot,
  ClipboardPlus,
  Hospital,
  MapPin,
  Stethoscope,
  UserRound,
  Waypoints,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { TherapyVisitStatusBadge } from "@/features/therapy/components/TherapyVisitStatusBadge";
import type {
  TherapyEncounter,
  TherapyVisit,
} from "@/features/therapy/types/therapy.types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  dateStyle: "long",
  timeStyle: "short",
});

type VisitDetailItem = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function recordedValue(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function EncounterStatusBadge({
  status,
}: {
  status: TherapyEncounter["status"];
}) {
  const variant =
    status === "in_progress"
      ? "success"
      : status === "completed"
        ? "secondary"
        : status === "cancelled"
          ? "destructive"
          : "outline";

  return (
    <Badge variant={variant} className="capitalize">
      {formatLabel(status)}
    </Badge>
  );
}

function VisitDetailSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: VisitDetailItem[];
}) {
  return (
    <section>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
        <p className="mt-1 text-sm text-brand-muted">{description}</p>
      </div>

      <dl className="divide-y divide-brand-border border-y border-brand-border">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="grid gap-3 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center"
          >
            <dt className="flex items-center gap-2.5 text-sm text-brand-muted">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-brand-slate">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {label}
            </dt>
            <dd className="pl-10 text-sm font-medium text-brand-navy sm:pl-0">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function VisitDetailsTab({ visit }: { visit: TherapyVisit }) {
  const encounter = visit.encounters[0];
  const visitItems: VisitDetailItem[] = [
    {
      label: "Date and time",
      value: DATE_FORMATTER.format(new Date(visit.visit_date)),
      icon: CalendarClock,
    },
    {
      label: "Visit status",
      value: <TherapyVisitStatusBadge status={visit.status} />,
      icon: CircleDot,
    },
    {
      label: "Service",
      value: recordedValue(
        visit.consultation_service_name,
        "General therapy visit",
      ),
      icon: ClipboardPlus,
    },
    {
      label: "Payment method",
      value: (
        <Badge variant="outline" className="capitalize">
          {visit.mode_of_payment}
        </Badge>
      ),
      icon: BadgeDollarSign,
    },
    {
      label: "Visit source",
      value: (
        <Badge variant="secondary">
          {visit.is_walk_in ? "Walk-in" : "Scheduled appointment"}
        </Badge>
      ),
      icon: Waypoints,
    },
  ];
  const careItems: VisitDetailItem[] = [
    {
      label: "Clinic",
      value: visit.clinic_name,
      icon: Hospital,
    },
    {
      label: "Department",
      value: recordedValue(encounter?.department_name, "Not recorded"),
      icon: Building2,
    },
    {
      label: "Location",
      value: recordedValue(encounter?.location_name, "Not recorded"),
      icon: MapPin,
    },
    {
      label: "Clinician",
      value: recordedValue(encounter?.clinician_name, "Not assigned"),
      icon: UserRound,
    },
    {
      label: "Encounter status",
      value: encounter ? (
        <EncounterStatusBadge status={encounter.status} />
      ) : (
        <span className="font-normal text-brand-muted">Not started</span>
      ),
      icon: Stethoscope,
    },
  ];

  return (
    <div>
      <div className="grid gap-10 xl:grid-cols-2 xl:gap-12">
        <VisitDetailSection
          title="Visit overview"
          description="Scheduling and administrative information."
          items={visitItems}
        />
        <VisitDetailSection
          title="Care assignment"
          description="Where the visit is being handled and by whom."
          items={careItems}
        />
      </div>
    </div>
  );
}
