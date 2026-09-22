"use client";

import { OpdVitalReading } from "@/features/clinical-opd/components/detail/OpdVitalReading";
import type {
  OpdEncounterVitalStat,
  OpdVitalSet,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { buildVitalSetStats } from "@/features/clinical-opd/utils/opd-encounter-vitals";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

type OpdVitalSetCardProps = {
  set?: OpdVitalSet;
  /**
   * Direct label/value rows (e.g. lab test → result). When set, used instead
   * of deriving stats from `set.observations`.
   */
  readings?: OpdEncounterVitalStat[];
  /** Optional prominent title (e.g. ordered panel/product name). */
  title?: string | null;
  /** Header timestamp when not using `set`. */
  recordedAt?: string | null;
  /** Person who released/recorded, shown on the Released line when titled. */
  releasedByName?: string | null;
  /** Header secondary label when not using `set`. */
  recordedByName?: string | null;
  /** Tighter spacing for the previous-visit history column. */
  compact?: boolean;
  /** When set, each reading value is clickable (content pane editing). */
  onValueClick?: (statKey: string) => void;
  "data-testid"?: string;
};

export function OpdVitalSetCard({
  set,
  readings,
  title,
  recordedAt: recordedAtProp,
  releasedByName,
  recordedByName: recordedByNameProp,
  compact = false,
  onValueClick,
  "data-testid": dataTestId,
}: OpdVitalSetCardProps) {
  const stats = readings ?? (set ? buildVitalSetStats(set.observations) : []);
  const recordedAt = recordedAtProp ?? set?.recordedAt ?? null;
  const recordedByName = recordedByNameProp ?? set?.recordedByName ?? null;
  const hasTitle = Boolean(title?.trim());
  const releaser = releasedByName?.trim() || null;

  return (
    <article
      className={cn(
        "rounded-xl border border-dash-border/70 bg-white",
        compact ? "px-3 py-2.5" : "px-4 py-3",
      )}
      data-testid={dataTestId ?? (set ? `opd-vital-set-${set.id}` : "opd-vital-set")}
    >
      <header
        className={cn(
          "flex flex-wrap gap-x-3 gap-y-1",
          hasTitle ? "items-start justify-between" : "items-baseline justify-between",
        )}
      >
        {hasTitle ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-brand-navy">
              {title}
            </p>
            {recordedAt ? (
              <time
                dateTime={recordedAt}
                className="mt-0.5 block text-[11px] text-dash-muted"
              >
                Released {formatDisplayDateTime(recordedAt)}
                {releaser ? ` · ${releaser}` : null}
              </time>
            ) : releaser ? (
              <p className="mt-0.5 text-[11px] text-dash-muted">
                Released by {releaser}
              </p>
            ) : null}
          </div>
        ) : recordedAt ? (
          <time
            dateTime={recordedAt}
            className="text-xs font-medium text-brand-navy"
          >
            {formatDisplayDateTime(recordedAt)}
          </time>
        ) : (
          <span className="text-xs font-medium text-brand-navy">Results</span>
        )}
        {recordedByName && !hasTitle ? (
          <span className="text-[11px] text-dash-muted">{recordedByName}</span>
        ) : null}
        {hasTitle && recordedByName ? (
          <span className="shrink-0 rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-dash-muted">
            {recordedByName}
          </span>
        ) : null}
      </header>

      {stats.length === 0 ? (
        <p className="mt-2 text-xs text-dash-muted">No readings in this set.</p>
      ) : (
        <dl
          className={cn(
            "mt-2.5 flex flex-col",
            compact ? "gap-1.5" : "gap-2",
          )}
        >
          {stats.map((stat) => {
            const interactive = Boolean(onValueClick);
            return (
              <div
                key={stat.key}
                className="flex min-w-0 items-baseline justify-between gap-3"
              >
                <dt className="text-[11px] font-medium text-dash-muted">
                  {stat.label}
                </dt>
                <dd className="shrink-0 leading-tight">
                  {interactive ? (
                    <button
                      type="button"
                      className="rounded-md px-1 py-0.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      onClick={() => onValueClick?.(stat.key)}
                      data-testid={`opd-vital-set-value-${stat.key}`}
                    >
                      <OpdVitalReading
                        value={stat.value}
                        status={stat.status}
                        emptyLabel="—"
                        size="sm"
                      />
                    </button>
                  ) : (
                    <OpdVitalReading
                      value={stat.value}
                      status={stat.status}
                      emptyLabel="—"
                      size="sm"
                    />
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </article>
  );
}
