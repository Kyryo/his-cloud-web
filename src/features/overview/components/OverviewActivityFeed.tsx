"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchOverviewActivity } from "@/features/overview/services/overview-home.service";
import {
  activityIconName,
  type OverviewActivityItem,
} from "@/features/overview/utils/overview-start";
import { formatOverviewRelativeTime } from "@/features/overview/utils/overview-workspace";

export function OverviewActivityFeed() {
  const activity = useQuery({
    queryKey: ["overview-activity"],
    queryFn: fetchOverviewActivity,
    retry: false,
  });

  const rows = activity.data ?? [];

  return (
    <section
      aria-labelledby="overview-activity-heading"
      data-testid="overview-activity"
      className="pt-1"
    >
      <h2
        id="overview-activity-heading"
        className="text-[12px] font-medium uppercase tracking-[0.04em] text-dash-muted/80"
      >
        Your recent activity
      </h2>

      {activity.isPending ? (
        <div className="mt-3 space-y-2.5" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <Skeleton className="size-4 shrink-0 rounded-sm bg-dash-border/40" />
              <Skeleton className="h-5 w-full bg-dash-border/40" />
            </div>
          ))}
        </div>
      ) : null}

      {activity.isError ? (
        <div className="mt-3">
          <p className="text-[13px] text-dash-muted">
            Couldn&apos;t load recent activity.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-7 px-0 text-[13px] text-dash-muted"
            onClick={() => void activity.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!activity.isPending && !activity.isError && rows.length === 0 ? (
        <p className="mt-3 text-[13px] leading-5 text-dash-muted">
          No recent activity yet. The patients and records you work with will
          appear here.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ul className="mt-2">
          {rows.map((item) => (
            <li
              key={item.uuid}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2.5 gap-y-0.5 py-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-2.5 sm:gap-y-0"
            >
              <span
                className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-dash-muted/65"
                aria-hidden
              >
                <AppIcon name={activityIconName(item.icon_key)} size={14} />
              </span>
              <p className="min-w-0 text-[13px] leading-5 text-dash-muted">
                <ActivityDescription item={item} />
              </p>
              <time
                dateTime={item.occurred_at}
                className="col-start-2 shrink-0 text-[12px] text-dash-muted/70 sm:col-start-auto sm:text-right"
              >
                {formatOverviewRelativeTime(item.occurred_at)}
              </time>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function linkClassName() {
  return "font-medium text-brand-navy/80 underline-offset-2 transition-colors hover:text-brand-primary hover:underline";
}

function ActivityDescription({ item }: { item: OverviewActivityItem }) {
  const {
    description,
    patient_name: patientName,
    patient_href: patientHref,
    related_label: relatedLabel,
    related_href: relatedHref,
  } = item;

  type Chunk = { text: string; href?: string };
  const chunks: Chunk[] = [{ text: description }];

  function splitOnLabel(label: string | null, href: string | null) {
    if (!label || !href) {
      return;
    }
    const next: Chunk[] = [];
    for (const chunk of chunks) {
      if (chunk.href || !chunk.text.includes(label)) {
        next.push(chunk);
        continue;
      }
      const [before, ...rest] = chunk.text.split(label);
      next.push({ text: before });
      next.push({ text: label, href });
      next.push({ text: rest.join(label) });
    }
    chunks.splice(0, chunks.length, ...next);
  }

  // Prefer linking the related record (invoice/order), then the patient name.
  splitOnLabel(relatedLabel, relatedHref);
  splitOnLabel(patientName, patientHref);

  const nodes: ReactNode[] = chunks.map((chunk, index) => {
    if (!chunk.text) {
      return null;
    }
    if (chunk.href) {
      return (
        <Link key={`${chunk.href}-${index}`} href={chunk.href} className={linkClassName()}>
          {chunk.text}
        </Link>
      );
    }
    return <span key={index}>{chunk.text}</span>;
  });

  return <>{nodes}</>;
}
