"use client";

import { useEffect, useState } from "react";

import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";
import { fetchClinicConfigurations } from "@/features/inventory/services/inventory-settings.service";

export function useClinicBatchTrackingForLocation(
  locationId: number | null | undefined,
) {
  const [batchTrackingEnabled, setBatchTrackingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!locationId) {
        setBatchTrackingEnabled(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const locationsResponse = await fetchInventoryLocations();
        const location = locationsResponse.results.find((item) => item.id === locationId);

        if (!location) {
          if (!cancelled) {
            setBatchTrackingEnabled(false);
          }
          return;
        }

        const configsResponse = await fetchClinicConfigurations({ pageSize: 200 });
        const config = configsResponse.results.find(
          (item) => item.clinic === location.clinic,
        );

        if (!cancelled) {
          setBatchTrackingEnabled(config?.batch_tracking_enabled ?? false);
        }
      } catch {
        if (!cancelled) {
          setBatchTrackingEnabled(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [locationId]);

  return { batchTrackingEnabled, isLoading };
}
