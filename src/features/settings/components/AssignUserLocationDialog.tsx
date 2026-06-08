"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import { ASSOCIATION_ROLE_OPTIONS } from "@/features/settings/schemas/organization-user.schema";
import { fetchOrganizationLocations } from "@/features/settings/services/settings.service";
import {
  createUserLocationAssociation,
  fetchUserClinicAssociations,
  fetchUserLocationAssociations,
} from "@/features/settings/services/user-management.service";
import type {
  AssociationRole,
  OrganizationLocation,
} from "@/features/settings/types/settings.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AssignUserLocationDialogProps = {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
};

export function AssignUserLocationDialog({
  userId,
  open,
  onOpenChange,
  onAssigned,
}: AssignUserLocationDialogProps) {
  const { toast } = useToast();
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [assignedLocationIds, setAssignedLocationIds] = useState<Set<number>>(
    new Set(),
  );
  const [assignedClinicIds, setAssignedClinicIds] = useState<Set<number>>(new Set());
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedRole, setSelectedRole] = useState<AssociationRole>("staff");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);

    try {
      const [locationAssociations, clinicAssociations, locationsResponse] =
        await Promise.all([
          fetchUserLocationAssociations(userId),
          fetchUserClinicAssociations(userId),
          fetchOrganizationLocations(),
        ]);
      setAssignedLocationIds(
        new Set(locationAssociations.map((item) => item.location.id)),
      );
      setAssignedClinicIds(
        new Set(clinicAssociations.map((item) => item.clinic.id)),
      );
      setLocations(locationsResponse.results);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load locations",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, userId]);

  useEffect(() => {
    if (open) {
      setSelectedLocationId("");
      setSelectedRole("staff");
      void loadOptions();
    }
  }, [loadOptions, open]);

  const availableLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          location.is_active &&
          assignedClinicIds.has(location.clinic) &&
          !assignedLocationIds.has(location.id),
      ),
    [assignedClinicIds, assignedLocationIds, locations],
  );

  const handleAssign = async () => {
    const locationId = Number.parseInt(selectedLocationId, 10);

    if (!Number.isFinite(locationId)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createUserLocationAssociation({
        user: userId,
        location_id: locationId,
        role: selectedRole,
      });
      toast({
        variant: "success",
        title: "Location assigned",
        description: "The user can now access this location.",
      });
      onAssigned();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not assign location",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAssign =
    assignedClinicIds.size > 0 && availableLocations.length > 0 && selectedLocationId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Assign location</DialogTitle>
          <DialogDescription>
            Locations must belong to a clinic the user already has access to.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-[140px] items-center justify-center gap-2 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading locations...
          </div>
        ) : (
          <div className="space-y-4">
            {assignedClinicIds.size === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                Assign at least one clinic before adding locations.
              </p>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-navy">Location</p>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
                disabled={
                  isSubmitting ||
                  assignedClinicIds.size === 0 ||
                  availableLocations.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      assignedClinicIds.size === 0
                        ? "Assign a clinic first"
                        : availableLocations.length === 0
                          ? "All locations are already assigned"
                          : "Select location"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableLocations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name} · {location.clinic_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-navy">Role</p>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as AssociationRole)}
                disabled={isSubmitting || assignedClinicIds.size === 0}
              >
                <SelectTrigger>
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
            </div>
          </div>
        )}

        <DialogFooter>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => void handleAssign()}
            disabled={isLoading || isSubmitting || !canAssign}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Assigning...
              </>
            ) : (
              "Assign location"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
