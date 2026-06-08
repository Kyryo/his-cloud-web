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
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import {
  createUserClinicAssociation,
  fetchUserClinicAssociations,
} from "@/features/settings/services/user-management.service";
import type {
  AssociationRole,
  OrganizationClinic,
} from "@/features/settings/types/settings.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AssignUserClinicDialogProps = {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
};

export function AssignUserClinicDialog({
  userId,
  open,
  onOpenChange,
  onAssigned,
}: AssignUserClinicDialogProps) {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [assignedClinicIds, setAssignedClinicIds] = useState<Set<number>>(new Set());
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedRole, setSelectedRole] = useState<AssociationRole>("staff");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);

    try {
      const [associations, clinicsResponse] = await Promise.all([
        fetchUserClinicAssociations(userId),
        fetchOrganizationClinics(),
      ]);
      setAssignedClinicIds(new Set(associations.map((item) => item.clinic.id)));
      setClinics(clinicsResponse.results);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load clinics",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, userId]);

  useEffect(() => {
    if (open) {
      setSelectedClinicId("");
      setSelectedRole("staff");
      void loadOptions();
    }
  }, [loadOptions, open]);

  const availableClinics = useMemo(
    () =>
      clinics.filter(
        (clinic) => clinic.is_active && !assignedClinicIds.has(clinic.id),
      ),
    [assignedClinicIds, clinics],
  );

  const handleAssign = async () => {
    const clinicId = Number.parseInt(selectedClinicId, 10);

    if (!Number.isFinite(clinicId)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createUserClinicAssociation({
        user: userId,
        clinic_id: clinicId,
        role: selectedRole,
      });
      toast({
        variant: "success",
        title: "Clinic assigned",
        description: "The user can now access this clinic.",
      });
      onAssigned();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not assign clinic",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Assign clinic</DialogTitle>
          <DialogDescription>
            Grant access to a clinic and set the user&apos;s role within it.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-[140px] items-center justify-center gap-2 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading clinics...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-navy">Clinic</p>
              <Select
                value={selectedClinicId}
                onValueChange={setSelectedClinicId}
                disabled={isSubmitting || availableClinics.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableClinics.length === 0
                        ? "All clinics are already assigned"
                        : "Select clinic"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableClinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={String(clinic.id)}>
                      {clinic.name} ({clinic.code})
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
                disabled={isSubmitting}
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
            disabled={
              isLoading || isSubmitting || !selectedClinicId || availableClinics.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Assigning...
              </>
            ) : (
              "Assign clinic"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
