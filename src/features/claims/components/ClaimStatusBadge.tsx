"use client";

import {
  Ban,
  CheckCircle2,
  FileEdit,
  Send,
  Shield,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import type { ClaimStatus } from "@/features/claims/types/claims.types";

const STATUS_CONFIG: Record<
  string,
  { variant: StatusPillVariant; icon: LucideIcon; label: string }
> = {
  draft: { variant: "outline", icon: FileEdit, label: "Draft" },
  submitted: { variant: "default", icon: Send, label: "Submitted" },
  approved: { variant: "success", icon: CheckCircle2, label: "Approved" },
  rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
  cancelled: { variant: "outline", icon: Ban, label: "Cancelled" },
};

export function ClaimStatusBadge({
  status,
  className,
}: {
  status: ClaimStatus | null | undefined;
  className?: string;
}) {
  if (!status) {
    return (
      <StatusPill
        label="Not submitted"
        variant="outline"
        icon={Shield}
        className={className}
      />
    );
  }

  const normalized = String(status).toLowerCase();
  const config = STATUS_CONFIG[normalized] ?? {
    variant: "outline" as const,
    icon: Shield,
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
