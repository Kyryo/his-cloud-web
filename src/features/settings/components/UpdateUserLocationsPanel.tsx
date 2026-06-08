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
import { AssignUserLocationDialog } from "@/features/settings/components/AssignUserLocationDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { UpdateUserTabLoader } from "@/features/settings/components/UpdateUserTabLoader";
import { ASSOCIATION_ROLE_OPTIONS } from "@/features/settings/schemas/organization-user.schema";
import { fetchOrganizationLocations } from "@/features/settings/services/settings.service";
import {
  fetchUserClinicAssociations,
  fetchUserLocationAssociations,
  removeUserLocationAssociation,
  setPrimaryUserLocationAssociation,
  updateUserLocationAssociation,
} from "@/features/settings/services/user-management.service";
import type {
  AssociationRole,
  OrganizationLocation,
  UserLocationAssociation,
} from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

type UpdateUserLocationsPanelProps = {
  userId: number;
  isActive: boolean;
  onChanged?: () => void;
};

export function UpdateUserLocationsPanel({
  userId,
  isActive,
  onChanged,
}: UpdateUserLocationsPanelProps) {
  const { toast } = useToast();
  const [associations, setAssociations] = useState<UserLocationAssociation[]>([]);
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [assignedClinicIds, setAssignedClinicIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [locationAssociations, clinicAssociations, locationsResponse] =
        await Promise.all([
          fetchUserLocationAssociations(userId),
          fetchUserClinicAssociations(userId),
          fetchOrganizationLocations(),
        ]);
      setAssociations(locationAssociations);
      setLocations(locationsResponse.results);
      setAssignedClinicIds(
        new Set(clinicAssociations.map((item) => item.clinic.id)),
      );
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load location assignments",
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

  const availableLocations = useMemo(() => {
    const assignedIds = new Set(associations.map((item) => item.location.id));
    return locations.filter(
      (location) =>
        location.is_active &&
        assignedClinicIds.has(location.clinic) &&
        !assignedIds.has(location.id),
    );
  }, [assignedClinicIds, associations, locations]);

  const canAssignLocation =
    assignedClinicIds.size > 0 && availableLocations.length > 0;

  const handleAssigned = () => {
    void loadData();
    onChanged?.();
  };

  const handleRoleChange = async (
    association: UserLocationAssociation,
    role: AssociationRole,
  ) => {
    setIsMutating(true);

    try {
      await updateUserLocationAssociation(association.id, { role });
      await loadData();
      onChanged?.();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update location role",
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
      await setPrimaryUserLocationAssociation(associationId);
      await loadData();
      onChanged?.();
      toast({
        variant: "success",
        title: "Primary location updated",
        description: "This location is now the user's default.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not set primary location",
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
      await removeUserLocationAssociation(associationId);
      await loadData();
      onChanged?.();
      toast({
        variant: "success",
        title: "Location removed",
        description: "The location assignment was removed.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not remove location",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return <UpdateUserTabLoader message="Loading location assignments..." />;
  }

  return (
    <>
      {assignedClinicIds.size === 0 ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Assign at least one clinic before adding locations.
        </p>
      ) : null}

      {associations.length === 0 ? (
        <OrganizationEmptyState
          message="No locations assigned yet."
          actionLabel="Assign location"
          onAction={() => setAssignDialogOpen(true)}
          actionDisabled={!canAssignLocation}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setAssignDialogOpen(true)}
              disabled={!canAssignLocation}
            >
              Assign location
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
                      {association.location.name}
                    </p>
                    {association.is_primary ? (
                      <Badge variant="secondary">Primary</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-brand-muted">
                    {association.clinic_name} · {association.location.code}
                  </p>
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

      <AssignUserLocationDialog
        userId={userId}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssigned={handleAssigned}
      />
    </>
  );
}
