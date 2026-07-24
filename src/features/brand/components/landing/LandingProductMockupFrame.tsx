import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingProductMockupFrameProps = {
  children: ReactNode;
  title?: string;
  /** When set, shows a clear stub banner - not a fake screenshot. */
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
        <p className="landing-body mb-3 flex items-start gap-2 rounded-xl border border-dashed border-[color:var(--landing-teal)]/35 bg-[color:var(--landing-warm)] px-3 py-2 text-xs leading-relaxed text-[color:var(--landing-ledger-ink)]">
          <span
            className="mt-0.5 shrink-0 rounded-md bg-[color:var(--landing-teal)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
            aria-hidden="true"
          >
            Mockup
          </span>
          {placeholderNote}
        </p>
      ) : null}
      <div
        className={cn(
          "overflow-hidden rounded-[20px] border border-[color:var(--landing-border)] bg-white",
          elevated
            ? "shadow-[var(--landing-shadow-hero)]"
            : "shadow-[var(--landing-shadow-hover)]",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[color:var(--landing-border)] bg-[#f4f5f7] px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#d1d5db]" />
            <span className="size-2.5 rounded-full bg-[#d1d5db]" />
            <span className="size-2.5 rounded-full bg-[#d1d5db]" />
          </div>
          <p className="mx-auto max-w-[14rem] truncate rounded-md bg-white/80 px-3 py-1 text-center text-[11px] text-[color:var(--landing-ledger-ink)]">
            {title}
          </p>
          <span className="w-10" aria-hidden="true" />
        </div>
        <div
          className={cn(
            "bg-white",
            !compact && "min-h-[240px] sm:min-h-[280px]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
