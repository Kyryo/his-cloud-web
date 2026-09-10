"use client";

import { CheckCircle2, Clock, LoaderCircle } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import {
  formatPharmacyQueueDispenseStatusLabel,
  getPharmacyQueueDispenseStatus,
  type PharmacyQueueDispenseStatus,
} from "@/features/dispensation/utils/dispensation-qty";
import { cn } from "@/lib/utils";

type PharmacyQueueDispenseStatusBadgeProps = {
  className?: string;
  status?: PharmacyQueueDispenseStatus;
  dispensableLineCount?: number;
  remainingLineCount?: number;
};

function getVariant(status: PharmacyQueueDispenseStatus): StatusPillVariant {
  switch (status) {
    case "waiting":
      return "warning";
    case "partial":
      return "secondary";
    case "complete":
      return "success";
  }
}

function getIcon(status: PharmacyQueueDispenseStatus) {
  switch (status) {
    case "waiting":
      return Clock;
    case "partial":
      return LoaderCircle;
    case "complete":
      return CheckCircle2;
  }
}

export function PharmacyQueueDispenseStatusBadge({
  status: statusProp,
  dispensableLineCount = 0,
  remainingLineCount = 0,
  className,
}: PharmacyQueueDispenseStatusBadgeProps) {
  const status =
    statusProp ??
    getPharmacyQueueDispenseStatus({
      dispensable_line_count: dispensableLineCount,
      remaining_line_count: remainingLineCount,
    });

  return (
    <StatusPill
      label={formatPharmacyQueueDispenseStatusLabel(status)}
      variant={getVariant(status)}
      icon={getIcon(status)}
      className={cn(className)}
    />
  );
}
