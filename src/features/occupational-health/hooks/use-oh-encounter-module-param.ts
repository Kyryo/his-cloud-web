"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  isOhEncounterPanelId,
  type OhEncounterPanelId,
} from "@/features/occupational-health/lib/oh-encounter-modules";

const PANEL_PARAM = "panel";
const DEFAULT_PANEL: OhEncounterPanelId = "medical-examinations";

/**
 * Seeds the active OH module from `?panel=` and mirrors changes with
 * `history.replaceState` so reloads keep the same module without a round trip.
 */
export function useOhEncounterModuleParam(): [
  OhEncounterPanelId,
  (panel: OhEncounterPanelId) => void,
] {
  const searchParams = useSearchParams();
  const [activePanel, setActivePanelState] = useState<OhEncounterPanelId>(() => {
    const requested = searchParams?.get(PANEL_PARAM);
    // Back-compat: old ?tab=exam links open Medical Examinations.
    if (requested === "exam" || requested === "examinations") {
      return DEFAULT_PANEL;
    }
    if (requested === "employment") {
      return "employment";
    }
    return isOhEncounterPanelId(requested) ? requested : DEFAULT_PANEL;
  });

  function setActivePanel(panel: OhEncounterPanelId) {
    setActivePanelState(panel);
    const params = new URLSearchParams(window.location.search);
    if (panel === DEFAULT_PANEL) {
      params.delete(PANEL_PARAM);
      params.delete("tab");
    } else {
      params.set(PANEL_PARAM, panel);
      params.delete("tab");
    }
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }

  return [activePanel, setActivePanel];
}
