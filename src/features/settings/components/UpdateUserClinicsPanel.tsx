"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssignUserClinicDialog } from "@/features/settings/components/AssignUserClinicDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { UpdateUserTabLoader } from "@/features/settings/components/UpdateUserTabLoader";
import { ASSOCIATION_ROLE_OPTIONS } from "@/features/settings/schemas/organization-user.schema";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import {
  fetchUserClinicAssociations,
  removeUserClinicAssociation,
  setPrimaryUserClinicAssociation,
  updateUserClinicAssociation,
} from "@/features/settings/services/user-management.service";
import type {
  AssociationRole,
  OrganizationClinic,
  UserClinicAssociation,
} from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

type UpdateUserClinicsPanelProps = {
  userId: number;
  isActive: boolean;
  onChanged?: () => void;
};

export function UpdateUserClinicsPanel({
  userId,
  isActive,
  onChanged,
}: UpdateUserClinicsPanelProps) {
  const { toast } = useToast();
  const [associations, setAssociations] = useState<UserClinicAssociation[]>([]);
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [clinicAssociations, clinicsResponse] = await Promise.all([
        fetchUserClinicAssociations(userId),
        fetchOrganizationClinics(),
      ]);
      setAssociations(clinicAssociations);
      setClinics(clinicsResponse.results);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load clinic assignments",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, userId]);

  useEffect(() => {
    if (isActive) {
      void loadData();
    }
  }, [isActive, loadData]);

  const availableClinics = useMemo(() => {
    const assignedIds = new Set(associations.map((item) => item.clinic.id));
    return clinics.filter(
      (clinic) => clinic.is_active && !assignedIds.has(clinic.id),
    );
  }, [associations, clinics]);

  const handleAssigned = () => {
    void loadData();
    onChanged?.();
  };

  const handleRoleChange = async (
    association: UserClinicAssociation,
    role: AssociationRole,
  ) => {
    setIsMutating(true);

    try {
      await updateUserClinicAssociation(association.id, { role });
      await loadData();
      onChanged?.();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update clinic role",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleSetPrimary = async (associationId: number) => {
    setIsMutating(true);

    try {
      await setPrimaryUserClinicAssociation(associationId);
      await loadData();
      onChanged?.();
      toast({
        variant: "success",
        title: "Primary clinic updated",
        description: "This clinic is now the user's default.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not set primary clinic",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleRemove = async (associationId: number) => {
    setIsMutating(true);

    try {
      await removeUserClinicAssociation(associationId);
      await loadData();
      onChanged?.();
      toast({
        variant: "success",
        title: "Clinic removed",
        description: "The clinic assignment was deactivated.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not remove clinic",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return <UpdateUserTabLoader message="Loading clinic assignments..." />;
  }

  return (
    <>
      {associations.length === 0 ? (
        <OrganizationEmptyState
          message="No clinics assigned yet."
          actionLabel="Assign clinic"
          onAction={() => setAssignDialogOpen(true)}
          actionDisabled={availableClinics.length === 0}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setAssignDialogOpen(true)}
              disabled={availableClinics.length === 0}
            >
              Assign clinic
            </Button>
          </div>

          <ul className="divide-y divide-brand-border rounded-xl border border-brand-border">
            {associations.map((association) => (
              <li
                key={association.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-brand-navy">
                      {association.clinic.name}
                    </p>
                    {association.is_primary ? (
                      <Badge variant="secondary">Primary</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-brand-muted">{association.clinic.code}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={association.role}
                    onValueChange={(value) =>
                      void handleRoleChange(association, value as AssociationRole)
                    }
                    disabled={isMutating}
                  >
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSOCIATION_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!association.is_primary ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-brand-muted hover:text-brand-navy"
                      onClick={() => void handleSetPrimary(association.id)}
                      disabled={isMutating}
                    >
                      Set primary
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-brand-muted hover:text-red-600"
                    onClick={() => void handleRemove(association.id)}
                    disabled={isMutating}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AssignUserClinicDialog
        userId={userId}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssigned={handleAssigned}
      />
    </>
  );
}
