import type { ReactNode } from "react";

type OrganizationTabToolbarProps = {
  children: ReactNode;
};

export function OrganizationTabToolbar({ children }: OrganizationTabToolbarProps) {
  return <div className="mb-6 flex items-center justify-end gap-3">{children}</div>;
}
