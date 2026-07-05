"use client";

import { useEffect, useRef, useState } from "react";

import { LANDING } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

const PAPER_ROWS = [
  "Paracetamol 500mg — qty ???",
  "Claim #1042 — status unknown",
  "Invoice — paid?",
] as const;

const LIVE_ROWS = [
  {
    label: "Paracetamol 500mg",
    value: "4 units · reorder soon",
    alert: true,
  },
  {
    label: "Claim #1042",
    value: "Rejected · resubmit",
    alert: false,
  },
  {
    label: "Invoice balance",
    value: "MWK 12,400 outstanding",
    alert: false,
  },
] as const;

function TornEdge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 120"
      className={cn("h-full w-3 shrink-0 text-[#faf4ea] lg:w-4", className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        fill="currentColor"
        d="M0,0 L12,4 L0,8 L10,14 L0,20 L12,26 L0,32 L11,38 L0,44 L12,50 L0,56 L10,62 L0,68 L12,74 L0,80 L11,86 L0,92 L12,98 L0,104 L10,110 L0,120 Z"
      />
    </svg>
  );
}

function TornEdgeHorizontal() {
  return (
    <svg
      viewBox="0 0 320 12"
      className="h-3 w-full shrink-0 text-[#faf4ea] lg:hidden"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        fill="currentColor"
        d="M0,0 L8,12 L16,0 L24,12 L32,0 L40,12 L48,0 L56,12 L64,0 L72,12 L80,0 L88,12 L96,0 L104,12 L112,0 L120,12 L128,0 L136,12 L144,0 L152,12 L160,0 L168,12 L176,0 L184,12 L192,0 L200,12 L208,0 L216,12 L224,0 L232,12 L240,0 L248,12 L256,0 L264,12 L272,0 L280,12 L288,0 L296,12 L304,0 L312,12 L320,0 Z"
      />
    </svg>
  );
}

export function LedgerSplitHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="w-full"
      role="img"
      aria-label="Comparison of incomplete paper clinic records beside a Sigma dashboard showing stock alerts, claim status, and outstanding invoices."
    >
      <div className="overflow-hidden rounded-[14px] shadow-[var(--landing-shadow-hover)] lg:flex lg:min-h-[320px]">
        <div
          className={cn(
            "landing-paper-panel landing-paper-fade flex flex-1 flex-col justify-center px-5 py-6 lg:max-w-[42%] lg:px-6 lg:py-8",
            isActive && "is-dimmed",
          )}
        >
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[color:var(--landing-ledger-ink)]/70">
            Register — today
          </p>
          <ul className="space-y-4">
            {PAPER_ROWS.map((row) => (
              <li
                key={row}
                className="font-mono text-sm leading-snug text-[color:var(--landing-ledger-ink)]/90 sm:text-[15px]"
              >
                {row}
              </li>
            ))}
          </ul>
        </div>

        <TornEdgeHorizontal />
        <TornEdge className="hidden lg:block" />

        <div className="flex flex-1 flex-col justify-center bg-white px-5 py-6 lg:px-6 lg:py-8">
          <p className="landing-text-teal mb-4 text-[10px] font-semibold uppercase tracking-widest">
            Sigma — live
          </p>
          <ul className="space-y-3">
            {LIVE_ROWS.map((row, index) => (
              <li
                key={row.label}
                className={cn(
                  "rounded-[10px] border border-brand-border/80 px-4 py-3",
                  row.alert &&
                    "border-[color:var(--landing-teal)]/20 bg-[color:var(--landing-teal-tint)]/60",
                  row.alert && isActive && "landing-alert-pulse is-active",
                  !row.alert && "bg-white",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-brand-muted">{row.label}</p>
                    <p className="landing-text-ink mt-0.5 text-sm font-semibold">{row.value}</p>
                  </div>
                  {row.alert ? (
                    <span
                      className="mt-1 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: LANDING.signalAmber }}
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                {index === 0 && row.alert ? (
                  <p className="landing-text-teal mt-2 text-xs">Low stock alert</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
