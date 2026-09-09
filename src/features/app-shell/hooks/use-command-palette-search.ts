"use client";

import { useQuery } from "@tanstack/react-query";

import { searchCommandPaletteRecords } from "@/features/app-shell/services/command-palette-search.service";
import type { CommandPaletteItem } from "@/features/app-shell/utils/build-command-palette-items";
import { COMMAND_PALETTE_MIN_QUERY_LENGTH } from "@/features/app-shell/utils/command-palette-records";

type UseCommandPaletteSearchOptions = {
  query: string;
  enabled: boolean;
  canSearchClients: boolean;
  canSearchBilling: boolean;
};

export function useCommandPaletteSearch({
  query,
  enabled,
  canSearchClients,
  canSearchBilling,
}: UseCommandPaletteSearchOptions): {
  items: CommandPaletteItem[];
  isSearching: boolean;
} {
  const trimmedQuery = query.trim();
  const canSearch = canSearchClients || canSearchBilling;
  const { data, isFetching } = useQuery({
    queryKey: [
      "command-palette-search",
      trimmedQuery,
      canSearchClients,
      canSearchBilling,
    ],
    queryFn: () =>
      searchCommandPaletteRecords({
        query: trimmedQuery,
        canSearchClients,
        canSearchBilling,
      }),
    enabled:
      enabled && canSearch && trimmedQuery.length >= COMMAND_PALETTE_MIN_QUERY_LENGTH,
    staleTime: 15_000,
  });

  return {
    items: data ?? [],
    isSearching: isFetching,
  };
}
