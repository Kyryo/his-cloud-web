"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDepartmentTypeLabel } from "@/features/settings/constants/department-types";
import { fetchOrganizationDepartments } from "@/features/settings/services/settings.service";
import {
  fetchUserClinicAssociations,
  grantUserDepartmentMembership,
} from "@/features/settings/services/user-management.service";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AssignUserDepartmentDialogProps = {
  userId: number;
  /** Departments the user already belongs to (UUIDs). */
  assignedDepartmentUuids: ReadonlySet<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
};

/** Offers active clinical departments in clinics the user is assigned to. */
export function AssignUserDepartmentDialog({
  userId,
  assignedDepartmentUuids,
  open,
  onOpenChange,
  onAssigned,
}: AssignUserDepartmentDialogProps) {
  const { toast } = useToast();
  const [selectedUuid, setSelectedUuid] = useState("");

  const optionsQuery = useQuery({
    queryKey: ["assign-user-department-options", userId],
    queryFn: async () => {
      const [clinics, departments] = await Promise.all([
        fetchUserClinicAssociations(userId),
        fetchOrganizationDepartments(),
      ]);
      return {
        clinicIds: new Set(clinics.map((item) => item.clinic.id)),
        departments: departments.results,
      };
    },
    enabled: open,
  });

  const grant = useMutation({
    mutationFn: (departmentUuid: string) =>
      grantUserDepartmentMembership(userId, departmentUuid),
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Department assigned",
        description: "The user can now open this department's queue and encounters.",
      });
      onAssigned();
      handleOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Could not assign department",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    },
  });

  const clinicIds = optionsQuery.data?.clinicIds;
  const availableDepartments = useMemo(
    () =>
      (optionsQuery.data?.departments ?? []).filter(
        (department) =>
          department.is_active &&
          Boolean(department.specialty_code) &&
          (clinicIds?.has(department.clinic) ?? false) &&
          !assignedDepartmentUuids.has(department.uuid),
      ),
    [assignedDepartmentUuids, clinicIds, optionsQuery.data],
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedUuid("");
    }
    onOpenChange(nextOpen);
  }

  const emptyPlaceholder =
    !clinicIds || clinicIds.size === 0
      ? "Assign a clinic first"
      : "No more clinical departments to assign";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("sm:max-w-md", appFont.className)}
        data-testid="assign-user-department-dialog"
      >
        <DialogHeader>
          <DialogTitle>Assign department</DialogTitle>
          <DialogDescription>
            Members see the department&apos;s queue and can open its encounters
            and history.
          </DialogDescription>
        </DialogHeader>

        {optionsQuery.isLoading ? (
          <div className="flex min-h-[140px] items-center justify-center gap-2 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading departments...
          </div>
        ) : optionsQuery.isError ? (
          <p className="text-sm text-red-700">Could not load departments.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-navy">Department</p>
            <Select
              value={selectedUuid}
              onValueChange={setSelectedUuid}
              disabled={grant.isPending || availableDepartments.length === 0}
            >
              <SelectTrigger aria-label="Department">
                <SelectValue
                  placeholder={
                    availableDepartments.length === 0
                      ? emptyPlaceholder
                      : "Select department"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availableDepartments.map((department) => (
                  <SelectItem key={department.uuid} value={department.uuid}>
                    {department.name} · {department.clinic_name} (
                    {getDepartmentTypeLabel(department.department_type)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <SecondaryButton
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={grant.isPending}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => grant.mutate(selectedUuid)}
            disabled={optionsQuery.isLoading || grant.isPending || !selectedUuid}
          >
            {grant.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Assigning...
              </>
            ) : (
              "Assign department"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
