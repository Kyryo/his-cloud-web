import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LandingEmbeddedMockupProps = {
  children: ReactNode;
  className?: string;
};

/** Compact in-card browser chrome — simplified Sigma UI shell. */
export function LandingEmbeddedMockup({
  children,
  className,
}: LandingEmbeddedMockupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border/80 bg-white",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-brand-border/70 bg-[#f6f7f9] px-3 py-2">
        <div className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-[#e8e8e8]" />
          <span className="size-2 rounded-full bg-[#e8e8e8]" />
          <span className="size-2 rounded-full bg-[#e8e8e8]" />
        </div>
      </div>
      <div className="bg-[#fafbfc]">{children}</div>
    </div>
  );
}

type LandingMockupToastProps = {
  children: ReactNode;
  className?: string;
};

export function LandingMockupToast({ children, className }: LandingMockupToastProps) {
  return (
    <div
      className={cn(
        "absolute z-10 max-w-[85%] rounded-lg border border-brand-border/60 bg-white px-3 py-2 text-xs leading-snug text-brand-navy shadow-[0_8px_24px_rgba(31,42,36,0.12)]",
        className,
      )}
      role="status"
    >
      {children}
    </div>
  );
}

/** Low-opacity decorative arcs behind the mockup on the primary card. */
export function LandingMockupMotionDecor({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 text-[color:var(--landing-teal)]", className)}
      viewBox="0 0 400 240"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M-20 180 Q 120 80, 280 140 T 420 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.12"
      />
      <path
        d="M40 220 Q 180 120, 320 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 5"
        opacity="0.08"
      />
    </svg>
  );
}

export function InventoryMockupContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("p-3", compact ? "text-[10px]" : "p-4 text-xs")}>
      <p className="font-semibold text-brand-navy">Pharmacy stock</p>
      <table className="mt-2 w-full text-left">
        <thead>
          <tr className="border-b border-brand-border/70 text-[10px] uppercase tracking-wide text-brand-muted">
            <th className="pb-1.5 font-medium">Item</th>
            <th className="pb-1.5 font-medium">On hand</th>
            <th className="pb-1.5 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-brand-slate">
          <tr className="border-b border-brand-border/50">
            <td className="py-2 text-brand-navy">Paracetamol 500mg</td>
            <td className="py-2">4 units</td>
            <td className="py-2 text-right text-[color:var(--landing-amber)]">Low stock</td>
          </tr>
          <tr className="border-b border-brand-border/50">
            <td className="py-2 text-brand-navy">Amoxicillin 250mg</td>
            <td className="py-2">42 strips</td>
            <td className="py-2 text-right text-brand-muted">OK</td>
          </tr>
          {!compact ? (
            <tr>
              <td className="py-2 text-brand-navy">Metformin 500mg</td>
              <td className="py-2">6 bottles</td>
              <td className="py-2 text-right text-[color:var(--landing-amber)]">Expires Aug</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function ClaimsMockupContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("p-3", compact ? "text-[10px]" : "p-4 text-xs")}>
      <p className="font-semibold text-brand-navy">Insurance claims</p>
      <table className="mt-2 w-full text-left">
        <thead>
          <tr className="border-b border-brand-border/70 text-[10px] uppercase tracking-wide text-brand-muted">
            <th className="pb-1.5 font-medium">Claim</th>
            <th className="pb-1.5 font-medium">Patient</th>
            <th className="pb-1.5 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-brand-slate">
          <tr className="border-b border-brand-border/50">
            <td className="py-2 font-mono text-brand-navy">#1042</td>
            <td className="py-2">Grace M.</td>
            <td className="py-2 text-right text-red-700">Rejected</td>
          </tr>
          <tr className="border-b border-brand-border/50">
            <td className="py-2 font-mono text-brand-navy">#1038</td>
            <td className="py-2">James O.</td>
            <td className="py-2 text-right text-[color:var(--landing-green)]">Paid</td>
          </tr>
          {!compact ? (
            <tr>
              <td className="py-2 font-mono text-brand-navy">#1035</td>
              <td className="py-2">Fatima H.</td>
              <td className="py-2 text-right text-[color:var(--landing-teal)]">Pending</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function RevenueMockupContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("p-3", compact ? "text-[10px]" : "p-4 text-xs")}>
      <p className="font-semibold text-brand-navy">Finance overview</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-brand-border/70 bg-white px-2 py-1.5">
          <p className="text-[10px] text-brand-muted">Revenue (MTD)</p>
          <p className="font-semibold text-brand-navy">MWK 4.2M</p>
        </div>
        <div className="rounded-lg border border-brand-border/70 bg-white px-2 py-1.5">
          <p className="text-[10px] text-brand-muted">Outstanding</p>
          <p className="font-semibold text-brand-navy">MWK 840k</p>
        </div>
      </div>
      {!compact ? (
        <div className="mt-2 space-y-1.5">
          {[
            { label: "Cash", pct: 42 },
            { label: "Insurance", pct: 38 },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="w-16 text-brand-muted">{row.label}</span>
              <div className="h-1.5 flex-1 rounded-full bg-brand-border/60">
                <div
                  className="h-full rounded-full bg-[color:var(--landing-teal)]"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ExpiryMockupContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("p-3", compact ? "text-[10px]" : "p-4 text-xs")}>
      <p className="font-semibold text-brand-navy">Expiring stock</p>
      <ul className="mt-2 space-y-1.5">
        {[
          { item: "Metformin 500mg", expiry: "Aug 2026", qty: "6 bottles" },
          { item: "Gentamicin drops", expiry: "Sep 2026", qty: "3 bottles" },
        ].map((row) => (
          <li
            key={row.item}
            className="flex items-center justify-between gap-2 rounded-md border border-[color:var(--landing-amber)]/25 bg-[color:var(--landing-amber-tint)]/40 px-2 py-1.5"
          >
            <span className="text-brand-navy">{row.item}</span>
            <span className="shrink-0 text-[color:var(--landing-amber)]">{row.expiry}</span>
          </li>
        ))}
      </ul>
      {!compact ? (
        <p className="mt-2 text-[10px] text-brand-muted">{`6 bottles · ${compact ? "" : "reorder before loss"}`}</p>
      ) : null}
    </div>
  );
}

export function ProviderMockupContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("p-3", compact ? "text-[10px]" : "p-4 text-xs")}>
      <p className="font-semibold text-brand-navy">Provider performance</p>
      <table className="mt-2 w-full text-left">
        <thead>
          <tr className="border-b border-brand-border/70 text-[10px] uppercase tracking-wide text-brand-muted">
            <th className="pb-1.5 font-medium">Provider</th>
            <th className="pb-1.5 text-right font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-brand-border/50">
            <td className="py-2 text-brand-navy">Dr. A. Phiri</td>
            <td className="py-2 text-right font-medium">MWK 1.8M</td>
          </tr>
          <tr>
            <td className="py-2 text-brand-navy">Nurse B. Okonkwo</td>
            <td className="py-2 text-right font-medium">MWK 620k</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
