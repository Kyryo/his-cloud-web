"use client";

import { useEffect, useState } from "react";

import { fetchOrganizationCurrency } from "@/features/settings/services/settings.service";

const DEFAULT_CURRENCY = "MWK";

export function useTenantCurrency() {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchOrganizationCurrency();
        if (!cancelled) {
          setCurrency(data.currency_code || DEFAULT_CURRENCY);
        }
      } catch {
        if (!cancelled) {
          setCurrency(DEFAULT_CURRENCY);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return currency;
}
