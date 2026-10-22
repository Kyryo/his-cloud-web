import {
  StatusDotBadge,
  type StatusDotBadgeTone,
} from "@/components/ui/status-dot-badge";

const TONES: Record<string, StatusDotBadgeTone> = {
  draft: "neutral",
  sent: "warning",
  in_progress: "success",
  completed: "primary",
  cancelled: "danger",
  rejected: "danger",
};

export function formatReferralStatusLabel(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "sent") {
    return "Awaiting start";
  }
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

type ReferralStatusBadgeProps = {
  status: string;
  className?: string;
};

export function ReferralStatusBadge({ status, className }: ReferralStatusBadgeProps) {
  return (
    <StatusDotBadge
      tone={TONES[status.trim().toLowerCase()] ?? "neutral"}
      className={className}
    >
      {formatReferralStatusLabel(status)}
    </StatusDotBadge>
  );
}
