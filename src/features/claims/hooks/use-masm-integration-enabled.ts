"use client";

import { useEffect, useState } from "react";

import { fetchMasmIntegrationStatus } from "@/features/claims/services/claims.service";

export function useMasmIntegrationEnabled(clinicId: number | null) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!clinicId) {
      setEnabled(false);
      return;
    }

    let active = true;
    void fetchMasmIntegrationStatus(clinicId)
      .then((status) => {
        if (active) {
          setEnabled(status.is_enabled);
        }
      })
      .catch(() => {
        if (active) {
          setEnabled(false);
        }
      });

    return () => {
      active = false;
    };
  }, [clinicId]);

  return enabled;
}
