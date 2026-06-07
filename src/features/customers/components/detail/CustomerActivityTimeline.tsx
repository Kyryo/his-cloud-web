"use client";

import {
  History,
  MapPin,
  NotebookPen,
  Shield,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CustomerEncounter } from "@/features/customers/types/customer-encounter.types";
import { cn } from "@/lib/utils";

import { RecordCreatedByMeta } from "./RecordCreatedByMeta";

type CustomerActivityTimelineProps = {
  encounters: CustomerEncounter[];
  hasMore: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  CUSTOMER_CREATED: UserRound,
  CUSTOMER_UPDATED: UserRound,
  CUSTOMER_ARCHIVED: UserRound,
  INSURANCE_ADDED: Shield,
  INSURANCE_UPDATED: Shield,
  INSURANCE_ARCHIVED: Shield,
  ADDRESS_ADDED: MapPin,
  ADDRESS_UPDATED: MapPin,
  ADDRESS_ARCHIVED: MapPin,
  NOTE_ADDED: NotebookPen,
  NOTE_UPDATED: NotebookPen,
  NOTE_ARCHIVED: NotebookPen,
};

function getEncounterIcon(action: string): LucideIcon {
  return ACTION_ICONS[action] ?? History;
}

export function CustomerActivityTimeline({
  encounters,
  hasMore,
  isLoadingMore = false,
  onLoadMore,
  className,
}: CustomerActivityTimelineProps) {
  return (
    <section
      className={cn("rounded-xl border border-brand-border bg-white", className)}
      data-testid="customer-activity-timeline"
    >
      <div className="border-b border-brand-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-brand-navy">Activity</h3>
        <p className="mt-0.5 text-xs text-brand-muted">
          Recent events recorded for this client.
        </p>
      </div>

      <ol className="divide-y divide-brand-border">
        {encounters.map((encounter) => {
          const Icon = getEncounterIcon(encounter.action);

          return (
            <li key={encounter.uuid} className="px-4 py-2.5">
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-border bg-slate-50 text-brand-primary">
                  <Icon className="size-3" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium leading-tight text-brand-navy">
                        {encounter.action_display}
                      </p>
                      <p className="text-xs leading-snug text-brand-slate">
                        {encounter.summary}
                      </p>
                    </div>
                    <RecordCreatedByMeta
                      dateTime={encounter.occurred_at}
                      createdByName={encounter.actor_name}
                      createdByEmail={encounter.actor_email}
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {hasMore ? (
        <div className="border-t border-brand-border px-4 py-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full sm:w-auto"
            disabled={isLoadingMore}
            onClick={onLoadMore}
            data-testid="customer-activity-load-more"
          >
            {isLoadingMore ? "Loading..." : "Load more activity"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
