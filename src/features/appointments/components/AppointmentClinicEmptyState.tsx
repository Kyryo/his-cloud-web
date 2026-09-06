import Link from "next/link";
import { Building2 } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AppointmentClinicEmptyStateProps = {
  className?: string;
  compact?: boolean;
};

export function AppointmentClinicEmptyState({
  className,
  compact = false,
}: AppointmentClinicEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact
          ? "rounded-xl border border-dashed border-dash-border bg-dash-canvas/50 px-5 py-8"
          : "min-h-[min(360px,calc(100vh-18rem))] justify-center px-6 py-16",
        className,
      )}
      data-testid="schedule-appointment-clinic-empty"
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-slate-50 text-brand-slate shadow-2xs ring-1 ring-slate-200/70",
          compact ? "size-12" : "size-14",
        )}
      >
        <Building2
          className={compact ? "size-6" : "size-7"}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-brand-navy",
          compact ? "mt-4 text-sm" : "mt-5 text-lg",
        )}
      >
        No clinic assigned
      </h3>
      <p
        className={cn(
          "max-w-sm text-brand-muted",
          compact ? "mt-1.5 text-sm" : "mt-2 text-sm",
        )}
      >
        Your account needs a clinic before appointments can be booked. Ask an
        administrator to assign you in user management.
      </p>
      <Link
        href={ROUTES.settingsUserManagement}
        className="mt-5 text-sm font-medium text-brand-primary underline-offset-4 hover:underline"
      >
        Open user management
      </Link>
    </div>
  );
}
