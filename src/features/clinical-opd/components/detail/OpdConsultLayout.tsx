"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import { OpdClinicalHistoryPanel } from "@/features/clinical-opd/components/detail/OpdClinicalHistoryPanel";
import {
  OpdConsultColumnHeader,
  OpdConsultCountBadge,
} from "@/features/clinical-opd/components/detail/OpdConsultColumnHeader";
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
  /** Restrict which history section tabs are shown (e.g. vitals-only for nurses). */
  historyAllowedSections?: readonly OpdHistorySectionId[];
  /** Wider record column for multi-field forms (e.g. vital signs). */
  wideForm?: boolean;
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
  historyAllowedSections,
  wideForm = false,
  "data-testid": dataTestId = "opd-consult-layout",
}: OpdConsultLayoutProps) {
  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1",
        wideForm
          ? "xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)_20rem] 2xl:grid-cols-[28rem_minmax(0,1fr)_22rem]"
          : "xl:grid-cols-[21rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[23rem_minmax(0,1fr)_22rem]",
      )}
      data-testid={dataTestId}
    >
      <section
        className={cn(
          "border-b border-dash-border/70 bg-white xl:border-b-0 xl:border-r",
          STICKY_COLUMN_CLASS,
        )}
        aria-label="Record"
        data-testid="opd-consult-form-column"
      >
        {form}
      </section>

      <section
        className={cn(
          "min-w-0 bg-dash-canvas",
          STICKY_COLUMN_CLASS,
        )}
        aria-label="This visit"
        data-testid="opd-consult-content-column"
      >
        {content}
      </section>

      <div className={cn("min-w-0", STICKY_COLUMN_CLASS)}>
        <OpdClinicalHistoryPanel
          section={historySection}
          allowedSections={historyAllowedSections}
          embedded
        />
      </div>
    </div>
  );
}

type OpdConsultFormPanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

/** Left column shell: a pinned heading over the entry form. */
export function OpdConsultFormPanel({
  title,
  description,
  action,
  children,
}: OpdConsultFormPanelProps) {
  return (
    <div>
      <OpdConsultColumnHeader
        eyebrow="Record"
        title={title}
        action={action}
        className="bg-white"
      />
      <div className="space-y-4 px-4 py-4 sm:px-5">
        {description ? (
          <p className="text-xs leading-relaxed text-dash-muted">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

type OpdConsultFormLockedProps = {
  message: string;
};

export function OpdConsultFormLocked({ message }: OpdConsultFormLockedProps) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border border-dashed border-dash-border bg-dash-canvas px-3 py-3"
      data-testid="opd-consult-form-locked"
    >
      <Lock className="mt-0.5 size-4 shrink-0 text-brand-muted" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-dash-muted">{message}</p>
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

/** Middle column shell: a pinned heading over everything logged this visit. */
export function OpdConsultContentPanel({
  title,
  count,
  action,
  children,
  "data-testid": dataTestId,
}: OpdConsultContentPanelProps) {
  return (
    <section data-testid={dataTestId}>
      <OpdConsultColumnHeader
        eyebrow="This visit"
        title={title}
        meta={count === undefined ? null : <OpdConsultCountBadge count={count} />}
        action={action}
        className="bg-dash-canvas"
      />
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}
