"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Loader2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import type { RemittanceBatchStatus } from "@/features/claims/types/remittances.types";

const STATUS_CONFIG: Record<
  RemittanceBatchStatus,
  { variant: StatusPillVariant; icon: LucideIcon; label: string }
> = {
  queued: { variant: "outline", icon: Loader2, label: "Queued" },
  processing: { variant: "secondary", icon: Loader2, label: "Processing" },
  processed: { variant: "success", icon: CheckCircle2, label: "Processed" },
  failed: { variant: "destructive", icon: XCircle, label: "Failed" },
  needs_review: {
    variant: "warning",
    icon: AlertTriangle,
    label: "Needs review",
  },
};

export function RemittanceBatchStatusBadge({
  status,
  className,
}: {
  status: RemittanceBatchStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] ?? {
    variant: "outline" as const,
    icon: FileWarning,
    label: String(status).replace(/_/g, " "),
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
