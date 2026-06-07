"use client";

import { HoverPreviewCard } from "@/components/hover-preview-card";
import { ClientAvatar } from "@/components/client-avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

type RecordCreatedByMetaProps = {
  dateTime: string;
  createdByName?: string | null;
  createdByEmail?: string | null;
};

function getCreatorLabel(
  createdByName?: string | null,
  createdByEmail?: string | null,
): string | null {
  const name = createdByName?.trim();
  if (name) {
    return name;
  }

  const email = createdByEmail?.trim();
  if (email) {
    return email;
  }

  return null;
}

export function RecordCreatedByMeta({
  dateTime,
  createdByName,
  createdByEmail,
}: RecordCreatedByMetaProps) {
  const creatorLabel = getCreatorLabel(createdByName, createdByEmail);

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <time className="text-xs text-brand-muted" dateTime={dateTime}>
        {formatDisplayDateTime(dateTime)}
      </time>
      {creatorLabel ? (
        <TooltipProvider delayDuration={200}>
          <HoverPreviewCard
            side="left"
            trigger={
              <button
                type="button"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Created by ${creatorLabel}`}
              >
                <ClientAvatar
                  name={creatorLabel}
                  className="size-6 [&_span]:text-[10px]"
                />
              </button>
            }
          >
            <div className="space-y-1">
              {createdByName?.trim() ? (
                <p className="text-sm font-medium text-brand-navy">
                  {createdByName.trim()}
                </p>
              ) : null}
              {createdByEmail?.trim() ? (
                <p className="text-xs text-brand-muted">
                  {createdByEmail.trim()}
                </p>
              ) : !createdByName?.trim() ? (
                <p className="text-sm font-medium text-brand-navy">
                  {creatorLabel}
                </p>
              ) : null}
            </div>
          </HoverPreviewCard>
        </TooltipProvider>
      ) : null}
    </div>
  );
}
