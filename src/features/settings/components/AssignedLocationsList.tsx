import type { User } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";

type AssignedLocation = NonNullable<User["locations"]>[number];

type AssignedLocationsListProps = {
  locations: NonNullable<User["locations"]>;
  className?: string;
};

function locationMeta(location: AssignedLocation) {
  const role = location.role
    ? location.role.charAt(0).toUpperCase() + location.role.slice(1)
    : null;

  return [location.location_code, location.clinic_name, role, location.tenant_name]
    .filter((value) => Boolean(value))
    .join(" · ");
}

function locationStatus(location: AssignedLocation) {
  const parts = [
    location.is_primary ? "Primary" : null,
    location.is_active ? "Active" : "Inactive",
  ].filter((value) => Boolean(value));

  return parts.join(" · ");
}

export function AssignedLocationsList({
  locations,
  className,
}: AssignedLocationsListProps) {
  if (locations.length === 0) {
    return (
      <p className={cn("text-sm text-slate-400", className)}>
        No locations are assigned to your account yet.
      </p>
    );
  }

  return (
    <ul className={cn("divide-y divide-brand-border", className)}>
      {locations.map((location) => (
        <li
          key={location.id}
          className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-navy">
              {location.location_name}
            </p>
            <p className="mt-0.5 truncate text-sm text-slate-400">
              {locationMeta(location)}
            </p>
          </div>
          <span className="shrink-0 text-xs text-slate-400">
            {locationStatus(location)}
          </span>
        </li>
      ))}
    </ul>
  );
}
