"use client";

import { useState } from "react";

import { Switch } from "@/components/ui/switch";
import { setOrganizationClinicActive } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

type ClinicActiveSwitchProps = {
  clinic: OrganizationClinic;
  onChanged: (clinic: OrganizationClinic) => void;
};

export function ClinicActiveSwitch({
  clinic,
  onChanged,
}: ClinicActiveSwitchProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function handleCheckedChange(checked: boolean) {
    setIsPending(true);
    try {
      await setOrganizationClinicActive(clinic.uuid, checked);
      onChanged({
        ...clinic,
        is_active: checked,
        status: checked ? "ACTIVE" : "INACTIVE",
      });
      toast({
        variant: "success",
        title: checked ? "Clinic turned on" : "Clinic turned off",
        description: checked
          ? `${clinic.name} is active again.`
          : `${clinic.name} is inactive.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: checked ? "Could not turn clinic on" : "Could not turn clinic off",
        description:
          error instanceof Error
            ? error.message
            : "This clinic has active visits. Finish those visits before turning it off.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Switch
      checked={clinic.is_active}
      disabled={isPending}
      onCheckedChange={(checked) => {
        void handleCheckedChange(checked);
      }}
      aria-label={
        clinic.is_active ? `Turn off ${clinic.name}` : `Turn on ${clinic.name}`
      }
    />
  );
}
