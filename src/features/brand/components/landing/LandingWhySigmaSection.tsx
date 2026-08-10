"use client";

import { ArrowRight, X } from "lucide-react";

import { LandingSection } from "@/features/brand/components/landing/LandingSection";
import { LANDING_WHY_SIGMA } from "@/features/brand/constants/landing-home-content";
import { useLandingReveal } from "@/features/brand/hooks/useLandingReveal";
import { cn } from "@/lib/utils";

const JOURNEY_STAGES = [
  { id: "visit", label: "Visit" },
  { id: "invoice", label: "Invoice" },
  { id: "claims", label: "Claims" },
  { id: "payment", label: "Payment" },
] as const;

type StagePresence = "present" | "absent";

function JourneyPill({
  label,
  presence,
  tone,
}: {
  label: string;
  presence: StagePresence;
  tone: "broken" | "complete";
}) {
  if (tone === "complete") {
    return (
      <div className="inline-flex min-h-9 items-center rounded-full bg-[color:var(--landing-teal)] px-3.5 text-sm font-medium text-white">
        {label}
      </div>
    );
  }

  if (presence === "present") {
    return (
      <div className="inline-flex min-h-9 items-center rounded-full bg-[color:var(--landing-ink)] px-3.5 text-sm font-medium text-white">
        {label}
      </div>
    );
  }

  return (
    <div className="inline-flex min-h-9 items-center rounded-full border border-dashed border-[color:var(--landing-ledger-ink)]/35 bg-transparent px-3.5 text-sm font-medium text-[color:var(--landing-ledger-ink)]/55">
      {label}
    </div>
  );
}

function JourneyConnector({
  variant,
}: {
  variant: "solid-arrow-teal" | "solid-arrow-ink" | "break" | "dashed";
}) {
  if (variant === "solid-arrow-teal" || variant === "solid-arrow-ink") {
    return (
      <span
        className="mx-1.5 inline-flex items-center sm:mx-2"
        aria-hidden="true"
      >
        <ArrowRight
          className={cn(
            "size-3.5",
            variant === "solid-arrow-teal"
              ? "text-[color:var(--landing-teal)]"
              : "text-[color:var(--landing-ink)]/50",
          )}
          strokeWidth={2}
        />
      </span>
    );
  }

  if (variant === "break") {
    return (
      <span
        className="mx-1.5 inline-flex min-w-[2.75rem] items-center sm:mx-2 sm:min-w-[3.25rem]"
        aria-hidden="true"
      >
        <span className="relative flex h-px w-full items-center">
          <span className="absolute inset-x-0 border-t border-dashed border-[color:var(--landing-ledger-ink)]/35" />
          <span className="relative mx-auto flex size-5 items-center justify-center rounded-full bg-white ring-1 ring-red-500/30">
            <X className="size-3 text-red-600" strokeWidth={2.5} />
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      className="mx-1.5 inline-flex min-w-[1.75rem] items-center sm:mx-2 sm:min-w-[2.25rem]"
      aria-hidden="true"
    >
      <span className="h-px w-full border-t border-dashed border-[color:var(--landing-ledger-ink)]/35" />
    </span>
  );
}

function JourneyRail({
  caption,
  tone,
}: {
  caption: string;
  tone: "broken" | "complete";
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-[color:var(--landing-border)] bg-white p-5 sm:p-6",
        tone === "complete" && "border-[color:var(--landing-teal)]/25",
      )}
    >
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.14em]",
          tone === "complete"
            ? "text-[color:var(--landing-teal)]"
            : "text-[color:var(--landing-ledger-ink)]/70",
        )}
      >
        {caption}
      </p>
      <ol className="mt-5 flex flex-wrap items-center gap-y-3">
        {JOURNEY_STAGES.map((stage, index) => {
          const isLast = index === JOURNEY_STAGES.length - 1;
          const presence: StagePresence =
            tone === "complete" || index <= 1 ? "present" : "absent";

          let connectorVariant:
            | "solid-arrow-teal"
            | "solid-arrow-ink"
            | "break"
            | "dashed" = "solid-arrow-teal";
          if (tone === "broken") {
            if (index === 0) connectorVariant = "solid-arrow-ink";
            else if (index === 1) connectorVariant = "break";
            else connectorVariant = "dashed";
          }

          return (
            <li key={stage.id} className="flex items-center">
              <JourneyPill
                label={stage.label}
                presence={presence}
                tone={tone}
              />
              {!isLast ? <JourneyConnector variant={connectorVariant} /> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LandingWhySigmaSection() {
  const { ref, isVisible } = useLandingReveal();
  const [visitLine, billLine, spreadsheetLine] = LANDING_WHY_SIGMA.paragraphs;

  return (
    <LandingSection variant="muted" id="why-sigma">
      <div
        ref={ref}
        className={cn("landing-reveal", isVisible && "is-visible")}
      >
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="landing-body text-[13px] font-medium text-[color:var(--landing-teal)]">
              {LANDING_WHY_SIGMA.eyebrow}
            </p>
            <h2 className="landing-display mt-3 text-[clamp(1.85rem,3.2vw,2.65rem)] font-semibold tracking-[-0.04em]">
              {LANDING_WHY_SIGMA.title}
            </h2>
            <div className="mt-8 space-y-3 border-l-2 border-[color:var(--landing-teal)]/30 pl-4">
              <p className="landing-body text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                {visitLine}
              </p>
              <p className="landing-body text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                {billLine}
              </p>
              <p className="landing-body text-base leading-[1.7] text-[color:var(--landing-ledger-ink)]">
                {spreadsheetLine}
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-7">
            <JourneyRail caption="Typical clinic systems" tone="broken" />
            <JourneyRail caption="With Sigma" tone="complete" />
            <div className="rounded-[20px] border border-[color:var(--landing-border)] bg-white px-5 py-4 sm:px-6 sm:py-5">
              <p className="landing-body text-base font-semibold leading-[1.65] text-[color:var(--landing-ink)] sm:text-[1.05rem]">
                {LANDING_WHY_SIGMA.closing}
              </p>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
