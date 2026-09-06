import type { User } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";

type AssignedClinic = NonNullable<User["clinics"]>[number];

type AssignedClinicsListProps = {
  clinics: NonNullable<User["clinics"]>;
  className?: string;
};

function clinicMeta(clinic: AssignedClinic) {
  const role = clinic.role
    ? clinic.role.charAt(0).toUpperCase() + clinic.role.slice(1)
    : null;

  return [clinic.clinic_code, role, clinic.tenant_name]
    .filter((value) => Boolean(value))
    .join(" · ");
}

function clinicStatus(clinic: AssignedClinic) {
  const parts = [
    clinic.is_primary ? "Primary" : null,
    clinic.is_active ? "Active" : "Inactive",
  ].filter((value) => Boolean(value));

  return parts.join(" · ");
}

export function AssignedClinicsList({
  clinics,
  className,
}: AssignedClinicsListProps) {
  if (clinics.length === 0) {
    return (
      <p className={cn("text-sm text-slate-400", className)}>
        No clinics are assigned to your account yet.
      </p>
    );
  }

  return (
    <ul className={cn("divide-y divide-brand-border", className)}>
      {clinics.map((clinic) => (
        <li
          key={clinic.id}
          className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-navy">
              {clinic.clinic_name}
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-400">
              {clinicMeta(clinic)}
            </p>
          </div>
          <span className="shrink-0 text-xs text-slate-400">
            {clinicStatus(clinic)}
          </span>
        </li>
      ))}
    </ul>
  );
}
