"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddDepartmentDialog } from "@/features/settings/components/AddDepartmentDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateDepartmentDialog } from "@/features/settings/components/UpdateDepartmentDialog";
import { getDepartmentTypeLabel } from "@/features/settings/constants/department-types";
import { fetchOrganizationDepartments } from "@/features/settings/services/settings.service";
import type { OrganizationDepartment } from "@/features/settings/types/settings.types";

type OrganizationDepartmentsTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Department" },
  { key: "code", label: "Code" },
  { key: "clinic", label: "Clinic" },
  { key: "type", label: "Type" },
  { key: "scheduling", label: "Scheduling" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

function formatStatus(status: string, isActive: boolean) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant={isActive ? "default" : "outline"} className="capitalize">
      {label.toLowerCase()}
    </Badge>
  );
}

function formatScheduling(department: OrganizationDepartment) {
  const labels = [
    department.requires_appointment ? "Appointment required" : null,
    department.walk_in_allowed ? "Walk-in" : null,
  ].filter(Boolean);

  if (labels.length === 0) {
    return "—";
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <Badge key={label} variant="secondary">
          {label}
        </Badge>
      ))}
    </div>
  );
}

export function OrganizationDepartmentsTab({ isActive }: OrganizationDepartmentsTabProps) {
  const [departments, setDepartments] = useState<OrganizationDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<OrganizationDepartment | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadDepartments() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationDepartments();
        if (active) {
          setDepartments(response.results);
        }
      } catch (loadError) {
        if (active) {
          setDepartments([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load departments.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDepartments();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  if (!isActive) {
    return null;
  }

  function handleCreated(_department: OrganizationDepartment) {
    setReloadToken((current) => current + 1);
  }

  function handleUpdated(updatedDepartment: OrganizationDepartment) {
    setDepartments((current) =>
      current.map((department) =>
        department.uuid === updatedDepartment.uuid ? updatedDepartment : department,
      ),
    );
  }

  const isEmpty = !isLoading && !error && departments.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Departments"
        description="Departments group clinical and operational work within each clinic, such as OPD or Dental."
        showHeader={!isEmpty}
        actions={
          departments.length > 0 ? (
            <Button onClick={() => setAddDialogOpen(true)}>Add department</Button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : departments.length === 0 ? (
          <OrganizationEmptyState
            message="No departments have been set up for this organization yet."
            actionLabel="Add department"
            onAction={() => setAddDialogOpen(true)}
          />
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-brand-border bg-slate-50/60">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-brand-muted"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {departments.map((department) => (
                  <tr key={department.uuid}>
                    <td className="px-6 py-3.5">
                      <div className="text-sm font-medium text-brand-navy">
                        {department.name}
                      </div>
                      {department.description ? (
                        <div className="text-xs text-brand-muted">
                          {department.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">
                      {department.code}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">
                      {department.clinic_name}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">
                      {getDepartmentTypeLabel(department.department_type)}
                    </td>
                    <td className="px-6 py-3.5">{formatScheduling(department)}</td>
                    <td className="px-6 py-3.5">
                      {formatStatus(department.status, department.is_active)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingDepartment(department)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OrganizationTabSection>

      <AddDepartmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />

      {editingDepartment ? (
        <UpdateDepartmentDialog
          department={editingDepartment}
          open={Boolean(editingDepartment)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingDepartment(null);
            }
          }}
          onUpdated={handleUpdated}
        />
      ) : null}
    </>
  );
}
