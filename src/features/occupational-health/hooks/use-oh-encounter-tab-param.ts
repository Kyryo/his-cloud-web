"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  OH_ENCOUNTER_TABS,
  type OhEncounterTabId,
} from "@/features/occupational-health/components/OhEncounterTabs";

const TAB_PARAM = "tab";
const DEFAULT_TAB: OhEncounterTabId = "exam";

function isOhEncounterTab(value: string | null | undefined): value is OhEncounterTabId {
  return OH_ENCOUNTER_TABS.some((tab) => tab.id === value);
}

/**
 * Seeds the active tab from `?tab=` and mirrors changes back with
 * `history.replaceState`, so reloads and shared links land on the same section
 * without a server round trip on every tab switch.
 */
export function useOhEncounterTabParam(): [
  OhEncounterTabId,
  (tab: OhEncounterTabId) => void,
] {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTabState] = useState<OhEncounterTabId>(() => {
    const requested = searchParams?.get(TAB_PARAM);
    return isOhEncounterTab(requested) ? requested : DEFAULT_TAB;
  });

  function setActiveTab(tab: OhEncounterTabId) {
    setActiveTabState(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === DEFAULT_TAB) {
      params.delete(TAB_PARAM);
    } else {
      params.set(TAB_PARAM, tab);
    }
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }

  return [activeTab, setActiveTab];
}
