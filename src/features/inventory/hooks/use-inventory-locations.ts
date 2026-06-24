"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";

export function inventoryLocationsQueryKey(clinicId?: number) {
  return ["inventory-locations", clinicId ?? "all"] as const;
}

export function useInventoryLocations(clinicId?: number, enabled = true) {
  return useQuery({
    queryKey: inventoryLocationsQueryKey(clinicId),
    queryFn: () => fetchInventoryLocations(clinicId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
