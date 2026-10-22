import { Building2 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

type ClinicalNoDepartmentsStateProps = {
  specialtyLabel: string;
};

/** Shown when the user belongs to no department of the specialty. */
export function ClinicalNoDepartmentsState({
  specialtyLabel,
}: ClinicalNoDepartmentsStateProps) {
  return (
    <div className="rounded-xl border border-brand-border bg-white">
      <EmptyState
        icon={Building2}
        title={`You are not assigned to any ${specialtyLabel} department`}
        description={`Ask an administrator to add you to the department in Settings → User management → Departments. You only see encounters of departments you belong to.`}
        data-testid="clinical-no-departments"
      />
    </div>
  );
}
