"use client";

import { StatusPill } from "@/components/ui/status-pill";

type VersionStatusChipProps = {
  versionNumber: number | null | undefined;
  status: string | null | undefined;
};

export function VersionStatusChip({ versionNumber, status }: VersionStatusChipProps) {
  if (versionNumber == null) {
    return <StatusPill label="Draft" variant="secondary" />;
  }

  const normalized = (status || "published").replaceAll("_", " ");
  const label = `v${versionNumber} · ${normalized}`;
  const variant =
    status === "published"
      ? "success"
      : status === "draft" || status === "in_review"
        ? "secondary"
        : "outline";

  return <StatusPill label={label} variant={variant} />;
}
