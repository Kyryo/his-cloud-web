"use client";

import {
  Ban,
  CheckCircle2,
  Clock3,
  Loader2,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import type { ClaimPayerStatus } from "@/features/claims/types/claims.types";

const STATUS_CONFIG: Record<
  string,
  { variant: StatusPillVariant; icon: LucideIcon; label: string }
> = {
  awaiting_payer: { variant: "outline", icon: Clock3, label: "Awaiting payer" },
  processing: { variant: "outline", icon: Loader2, label: "Processing" },
  closed: { variant: "success", icon: CheckCircle2, label: "Closed" },
  failed: { variant: "destructive", icon: Ban, label: "Failed" },
  not_applicable: { variant: "outline", icon: Shield, label: "Not submitted" },
};

export function ClaimPayerStatusBadge({
  status,
  label,
  className,
}: {
  status: ClaimPayerStatus | null | undefined;
  label?: string | null;
  className?: string;
}) {
  const normalized = String(status || "awaiting_payer").toLowerCase();
  const config = STATUS_CONFIG[normalized] ?? {
    variant: "outline" as const,
    icon: Shield,
    label: label || normalized.replace(/_/g, " "),
  };
  const displayLabel =
    normalized === "not_applicable"
      ? "Not submitted"
      : label || config.label;

  return (
    <StatusPill
      label={displayLabel}
      variant={config.variant}
      icon={config.icon}
      className={className}
    />
  );
}
