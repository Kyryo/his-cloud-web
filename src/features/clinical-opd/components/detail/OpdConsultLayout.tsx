"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import { OpdClinicalHistoryPanel } from "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel";
import type { OpdHistorySectionId } from "@/features/clinical-opd/utils/opd-physician-history-tabs";
import { cn } from "@/lib/utils";

/** Each column pins to the top of the workspace scroller and scrolls on its own. */
const STICKY_COLUMN_CLASS =
  "xl:sticky xl:top-0 xl:max-h-[calc(100svh-4rem)] xl:overflow-y-auto";

type OpdConsultLayoutProps = {
  /** Left column: where the clinician writes. */
  form: ReactNode;
  /** Middle column: what has been recorded on this encounter. */
  content: ReactNode;
  historySection?: OpdHistorySectionId;
  "data-testid"?: string;
};

/**
 * Consult tabs share one shape: write on the left, read this encounter in the
 * middle, compare against previous visits on the right.
 */
export function OpdConsultLayout({
  form,
  content,
  historySection,
  "data-testid": dataTestId = "opd-consult-layout",
}: OpdConsultLayoutProps) {
  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[23rem_minmax(0,1fr)_22rem] 2xl:grid-cols-[26rem_minmax(0,1fr)_24rem]"
      data-testid={dataTestId}
    >
      <section
        className={cn(
          "border-b border-dash-border/70 bg-white px-4 py-5 sm:px-6 xl:border-b-0 xl:border-r xl:px-6",
          STICKY_COLUMN_CLASS,
        )}
        aria-label="Record"
        data-testid="opd-consult-form-column"
      >
        {form}
      </section>

      <section
        className={cn(
          "min-w-0 bg-slate-50/50 px-4 py-5 sm:px-6 xl:px-8",
          STICKY_COLUMN_CLASS,
        )}
        aria-label="This encounter"
        data-testid="opd-consult-content-column"
      >
        {content}
      </section>

      <div className={cn("min-w-0 bg-white", STICKY_COLUMN_CLASS)}>
        <OpdClinicalHistoryPanel section={historySection} embedded />
      </div>
    </div>
  );
}

type OpdConsultFormPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/** Heading treatment for the left column so every consult tab reads the same. */
export function OpdConsultFormPanel({
  title,
  description,
  children,
}: OpdConsultFormPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-brand-navy">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-dash-muted">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

type OpdConsultFormLockedProps = {
  message: string;
};

export function OpdConsultFormLocked({ message }: OpdConsultFormLockedProps) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border border-dashed border-dash-border/80 bg-slate-50/50 px-4 py-3.5"
      data-testid="opd-consult-form-locked"
    >
      <Lock className="mt-0.5 size-4 shrink-0 text-brand-muted" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-dash-muted">{message}</p>
    </div>
  );
}

type OpdConsultContentPanelProps = {
  title: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
  "data-testid"?: string;
};

/** Heading treatment for the middle column. */
export function OpdConsultContentPanel({
  title,
  count,
  action,
  children,
  "data-testid": dataTestId,
}: OpdConsultContentPanelProps) {
  return (
    <section className="space-y-4" data-testid={dataTestId}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-baseline gap-2 text-base font-semibold tracking-tight text-brand-navy">
          {title}
          {count && count > 0 ? (
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium leading-none tabular-nums text-brand-primary">
              {count}
            </span>
          ) : null}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
