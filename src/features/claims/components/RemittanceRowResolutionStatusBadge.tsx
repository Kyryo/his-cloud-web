"use client";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDashed,
  FileSearch,
  Loader2,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import type { RemittanceRowResolutionStatus } from "@/features/claims/types/remittances.types";

const STATUS_CONFIG: Record<
  RemittanceRowResolutionStatus,
  { variant: StatusPillVariant; icon: LucideIcon; label: string }
> = {
  pending_match: {
    variant: "secondary",
    icon: Loader2,
    label: "Pending match",
  },
  unmatched: {
    variant: "warning",
    icon: AlertTriangle,
    label: "Unmatched",
  },
  pending_review: {
    variant: "warning",
    icon: FileSearch,
    label: "Pending review",
  },
  auto_applied: {
    variant: "success",
    icon: CheckCircle2,
    label: "Auto applied",
  },
  manually_resolved: {
    variant: "success",
    icon: UserCheck,
    label: "Manually resolved",
  },
  rejected: {
    variant: "destructive",
    icon: Ban,
    label: "Rejected",
  },
};

export function RemittanceRowResolutionStatusBadge({
  status,
  className,
}: {
  status: RemittanceRowResolutionStatus | string;
  className?: string;
}) {
  const normalized = String(status).toLowerCase() as RemittanceRowResolutionStatus;
  const config = STATUS_CONFIG[normalized] ?? {
    variant: "outline" as const,
    icon: CircleDashed,
    label: normalized.replace(/_/g, " "),
  };

  return (
    <StatusPill
      label={config.label}
      variant={config.variant}
      icon={config.icon}
      className={className}
    />
  );
}
