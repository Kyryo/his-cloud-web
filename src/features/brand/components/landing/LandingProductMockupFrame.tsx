import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingProductMockupFrameProps = {
  children: ReactNode;
  title?: string;
  /** When set, shows a clear stub banner — not a fake screenshot. */
  placeholderNote?: string;
  /** Omit default min-height when showing a full screenshot image. */
  compact?: boolean;
  /** Stronger elevation for product screenshots on feature cards. */
  elevated?: boolean;
  className?: string;
};

export function LandingProductMockupFrame({
  children,
  title = "app.sigmahmis.com",
  placeholderNote,
  compact = false,
  elevated = false,
  className,
}: LandingProductMockupFrameProps) {
  return (
    <div className={cn("w-full", className)}>
      {placeholderNote ? (
        <p className="landing-body mb-3 flex items-start gap-2 rounded-lg border border-dashed border-[color:var(--landing-teal)]/40 bg-[color:var(--landing-teal-tint)]/50 px-3 py-2 text-xs leading-relaxed text-[color:var(--landing-ledger-ink)]">
          <span
            className="mt-0.5 shrink-0 rounded bg-[color:var(--landing-teal)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
            aria-hidden="true"
          >
            Mockup
          </span>
          {placeholderNote}
        </p>
      ) : null}
      <div
        className={cn(
          "overflow-hidden rounded-[14px] border border-brand-border/80 bg-white",
          elevated
            ? "shadow-[0_14px_40px_rgba(31,42,36,0.14)]"
            : "shadow-[var(--landing-shadow-hover)]",
        )}
      >
        <div className="flex items-center gap-3 border-b border-brand-border bg-[#f1f4f8] px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <p className="mx-auto truncate text-[11px] text-brand-muted">{title}</p>
        </div>
        <div
          className={cn(
            "bg-[#fafbfc]",
            !compact && "min-h-[240px] sm:min-h-[280px]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
