"use client";

import { useEffect, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { StatusBanner } from "@/components/ui/status-banner";
import { fetchUnconfiguredLabProducts } from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabUnconfiguredProduct } from "@/features/laboratory/types/laboratory-catalog.types";

type UnconfiguredLabProductsBannerProps = {
  onConfigureAsTest?: (product: LabUnconfiguredProduct) => void;
  onConfigureAsPanel?: (product: LabUnconfiguredProduct) => void;
};

export function UnconfiguredLabProductsBanner({
  onConfigureAsTest,
  onConfigureAsPanel,
}: UnconfiguredLabProductsBannerProps) {
  const [items, setItems] = useState<LabUnconfiguredProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetchUnconfiguredLabProducts({ pageSize: 20 });
        if (!cancelled) {
          setItems(response.results);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || items.length === 0) {
    return null;
  }

  return (
    <StatusBanner
      variant="warning"
      message={`${items.length} laboratory product${items.length === 1 ? "" : "s"} still need a catalog row`}
      description="Usually legacy SKUs missing a charge type. New laboratory products auto-create a test or panel when billing sets the charge type—complete analytes or panel memberships on the catalog pages."
      data-testid="lab-unconfigured-products-banner"
    >
      <ul className="mt-2 space-y-2">
        {items.slice(0, 5).map((product) => {
          const asTest =
            onConfigureAsTest &&
            (product.lab_charge_type === "individual" ||
              !product.lab_charge_type);
          const asPanel =
            onConfigureAsPanel &&
            (product.lab_charge_type === "panel" || !product.lab_charge_type);
          return (
            <li
              key={product.uuid}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span className="text-amber-950">
                {product.display_name || product.name}
                {product.default_code ? (
                  <span className="text-amber-800/80">
                    {" "}
                    ({product.default_code})
                  </span>
                ) : null}
                {product.lab_charge_type ? (
                  <span className="text-amber-800/80">
                    {" "}
                    · {product.lab_charge_type}
                  </span>
                ) : null}
              </span>
              <span className="flex gap-2">
                {asTest ? (
                  <SecondaryButton
                    type="button"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => onConfigureAsTest(product)}
                  >
                    As test
                  </SecondaryButton>
                ) : null}
                {asPanel ? (
                  <SecondaryButton
                    type="button"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => onConfigureAsPanel(product)}
                  >
                    As panel
                  </SecondaryButton>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </StatusBanner>
  );
}
