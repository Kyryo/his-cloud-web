"use client";

import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { formatInventoryAmount } from "@/features/inventory/utils/format-inventory";

type AnimatedPurchaseOrderTotalProps = {
  value: number;
  currency: string;
  className?: string;
};

export function AnimatedPurchaseOrderTotal({
  value,
  currency,
  className,
}: AnimatedPurchaseOrderTotalProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration: 0.35,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest),
    });

    previousValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>{formatInventoryAmount(displayValue, currency)}</span>
  );
}
