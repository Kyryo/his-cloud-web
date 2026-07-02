"use client";

import { useEffect, useState } from "react";

import type { Invoice } from "@/features/invoices/types/invoice.types";
import { fetchVisitEncounters } from "@/features/visits/services/visits.service";

export function useInvoiceEncounterUuid(
  invoice: Pick<Invoice, "encounter_uuid" | "visit_uuid">,
  enabled: boolean,
): string | null {
  const [encounterUuid, setEncounterUuid] = useState<string | null>(
    invoice.encounter_uuid ?? null,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function resolveEncounterUuid() {
      if (invoice.encounter_uuid) {
        if (!cancelled) {
          setEncounterUuid(invoice.encounter_uuid);
        }
        return;
      }

      if (!invoice.visit_uuid) {
        if (!cancelled) {
          setEncounterUuid(null);
        }
        return;
      }

      try {
        const encounters = await fetchVisitEncounters(invoice.visit_uuid);
        const activeEncounter =
          encounters.find((encounter) => encounter.is_active) ?? encounters[0] ?? null;
        if (!cancelled) {
          setEncounterUuid(activeEncounter?.uuid ?? null);
        }
      } catch {
        if (!cancelled) {
          setEncounterUuid(null);
        }
      }
    }

    void resolveEncounterUuid();

    return () => {
      cancelled = true;
    };
  }, [enabled, invoice.encounter_uuid, invoice.visit_uuid]);

  return encounterUuid;
}
