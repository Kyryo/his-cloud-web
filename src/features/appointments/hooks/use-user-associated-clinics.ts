"use client";

import { useEffect, useMemo, useState } from "react";

import type { User } from "@/features/auth/types/auth.types";
import { fetchClinicalClinics } from "@/features/clinical/services/clinical-catalog.service";
import type { ClinicalClinic } from "@/features/clinical/types/clinical-catalog.types";
import { useUser } from "@/providers/user-provider";

function getUserClinicIds(user: User | null): Set<number> {
  const ids = new Set<number>();

  for (const association of user?.clinics ?? []) {
    if (association.is_active) {
      ids.add(association.clinic);
    }
  }

  if (ids.size === 0 && user?.primary_clinic?.id) {
    ids.add(user.primary_clinic.id);
  }

  return ids;
}

export function useUserAssociatedClinics() {
  const { userData, isLoading: isUserLoading } = useUser();
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userClinicIds = useMemo(() => getUserClinicIds(userData), [userData]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoadingClinics(true);
      setError(null);

      try {
        const allClinics = await fetchClinicalClinics();
        if (!active) {
          return;
        }

        const associated = allClinics.filter((clinic) => userClinicIds.has(clinic.id));
        setClinics(associated);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load clinics.");
          setClinics([]);
        }
      } finally {
        if (active) {
          setIsLoadingClinics(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [userClinicIds]);

  const primaryClinicUuid = useMemo(() => {
    const primaryId = userData?.primary_clinic?.id;
    if (!primaryId) {
      return undefined;
    }

    return clinics.find((clinic) => clinic.id === primaryId)?.uuid;
  }, [clinics, userData?.primary_clinic?.id]);

  return {
    clinics,
    primaryClinicUuid,
    hasAssignedClinic: Boolean(userData?.primary_clinic),
    isLoading: isUserLoading || isLoadingClinics,
    error,
  };
}
