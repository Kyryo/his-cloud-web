import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

type AppointmentClinicEmptyStateProps = {
  className?: string;
};

export function AppointmentClinicEmptyState({
  className,
}: AppointmentClinicEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
      data-testid="schedule-appointment-clinic-empty"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-tint text-brand-primary">
        <Building2 className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-brand-navy">
        No clinic assigned
      </h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        You need a clinic assignment before you can schedule appointments. Ask
        your organization administrator to assign you to a clinic.
      </p>
    </div>
  );
}
