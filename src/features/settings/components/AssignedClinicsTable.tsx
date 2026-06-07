import { Badge } from "@/components/ui/badge";
import type { User } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";

type AssignedClinicsTableProps = {
  clinics: NonNullable<User["clinics"]>;
  className?: string;
};

const columns = [
  { key: "clinic_name", label: "Clinic" },
  { key: "clinic_code", label: "Code" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
] as const;

export function AssignedClinicsTable({
  clinics,
  className,
}: AssignedClinicsTableProps) {
  if (clinics.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-brand-border px-4 py-8 text-center text-sm text-brand-muted",
          className,
        )}
      >
        No clinics are assigned to your account yet.
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-brand-border", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-brand-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {clinics.map((clinic) => (
              <tr key={clinic.id} className="bg-white">
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-brand-navy">
                      {clinic.clinic_name}
                    </span>
                    {clinic.is_primary ? (
                      <Badge variant="secondary">Primary</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-brand-muted">{clinic.tenant_name}</p>
                </td>
                <td className="px-4 py-3 text-sm text-brand-navy">
                  {clinic.clinic_code}
                </td>
                <td className="px-4 py-3 text-sm capitalize text-brand-navy">
                  {clinic.role || "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={clinic.is_active ? "default" : "outline"}>
                    {clinic.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
