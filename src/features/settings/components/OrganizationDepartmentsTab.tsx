"use client";

import { useEffect, useMemo, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddDepartmentDialog } from "@/features/settings/components/AddDepartmentDialog";
import {
  OrganizationClinicGroup,
  OrganizationEntityRow,
  OrganizationTabPanel,
  groupByClinicName,
} from "@/features/settings/components/OrganizationTabContent";
import { UpdateDepartmentDialog } from "@/features/settings/components/UpdateDepartmentDialog";
import { getDepartmentTypeLabel } from "@/features/settings/constants/department-types";
import { fetchOrganizationDepartments } from "@/features/settings/services/settings.service";
import type { OrganizationDepartment } from "@/features/settings/types/settings.types";

type OrganizationDepartmentsTabProps = {
  isActive: boolean;
};

function departmentMeta(department: OrganizationDepartment) {
  const scheduling = [
    department.requires_appointment ? "Appointment required" : null,
    department.walk_in_allowed ? "Walk-in" : null,
  ]
    .filter((value) => Boolean(value))
    .join(", ");

  return [
    department.code,
    getDepartmentTypeLabel(department.department_type),
    scheduling,
  ]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function OrganizationDepartmentsTab({
  isActive,
}: OrganizationDepartmentsTabProps) {
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

  const clinicGroups = useMemo(
    () =>
      groupByClinicName(departments, (department) => department.clinic_name),
    [departments],
  );

  if (!isActive) {
    return null;
  }

  function handleCreated(_department: OrganizationDepartment) {
    setReloadToken((current) => current + 1);
  }

  function handleUpdated(updatedDepartment: OrganizationDepartment) {
    setDepartments((current) =>
      current.map((department) =>
        department.uuid === updatedDepartment.uuid
          ? updatedDepartment
          : department,
      ),
    );
  }

  return (
    <>
      <OrganizationTabPanel
        description="Work groups inside each clinic, such as OPD or Dental."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            Add department
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : departments.length === 0 ? (
          <p className="text-sm text-slate-400">
            No departments yet. Add one such as OPD or Dental.
          </p>
        ) : (
          <div className="space-y-7">
            {clinicGroups.map((group) => (
              <OrganizationClinicGroup
                key={group.clinicName}
                title={group.clinicName}
                count={group.items.length}
              >
                {group.items.map((department) => (
                  <OrganizationEntityRow
                    key={department.uuid}
                    title={department.name}
                    description={department.description || undefined}
                    meta={departmentMeta(department)}
                    status={department.is_active ? "Active" : "Inactive"}
                    actions={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingDepartment(department)}
                      >
                        Update
                      </Button>
                    }
                  />
                ))}
              </OrganizationClinicGroup>
            ))}
          </div>
        )}
      </OrganizationTabPanel>

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
