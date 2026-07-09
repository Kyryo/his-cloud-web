import { CheckCircle2, ChevronDown } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { LandingProductMockupFrame } from "@/features/brand/components/landing/LandingProductMockupFrame";
import { cn } from "@/lib/utils";

const FLOATING_CARD_CLASS =
  "rounded-xl border border-brand-border/60 bg-white shadow-[0_10px_32px_rgba(31,42,36,0.11)]";

const ILLUSTRATION_CANVAS_CLASS =
  "relative min-h-[200px] overflow-hidden rounded-xl bg-gradient-to-br from-white via-[color:var(--landing-warm)] to-[color:var(--landing-teal-tint)]/30 sm:min-h-[220px]";

type LandingFeatureScreenshotVisualProps = {
  src: string;
  alt: string;
  title?: string;
  /** Zoom into screenshot content for legibility at card size. 1 = no zoom. */
  cropZoom?: number;
  className?: string;
};

export function LandingFeatureScreenshotVisual({
  src,
  alt,
  title = "app.sigmahmis.com",
  cropZoom = 1,
  className,
}: LandingFeatureScreenshotVisualProps) {
  return (
    <LandingProductMockupFrame
      title={title}
      compact
      elevated
      className={className}
    >
      <div className="relative max-h-[220px] overflow-hidden bg-white sm:max-h-[240px]">
        <Image
          src={src}
          alt={alt}
          width={1440}
          height={900}
          className="h-auto w-full object-cover object-left-top brightness-[1.04] contrast-[1.08] saturate-[1.05]"
          style={
            cropZoom === 1
              ? undefined
              : {
                  transform: `scale(${cropZoom})`,
                  transformOrigin: "top left",
                }
          }
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        />
      </div>
    </LandingProductMockupFrame>
  );
}

function LandingFloatingCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(FLOATING_CARD_CLASS, className)} role="presentation">
      {children}
    </div>
  );
}

export function LandingFeatureRevenueVisual() {
  const bars = [36, 52, 44, 78, 58, 68];
  const max = Math.max(...bars);
  const labels = ["M", "T", "W", "T", "F", "S"];

  return (
    <div className={cn(ILLUSTRATION_CANVAS_CLASS, "flex items-center justify-center p-5 sm:p-6")}>
      <div className="relative w-full max-w-[260px]">
        <LandingFloatingCard className="absolute -right-1 -top-1 z-10 px-3 py-2 sm:-right-2 sm:-top-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-brand-muted">
            Today
          </p>
          <p className="text-sm font-bold text-brand-navy">MWK 430,000</p>
          <span className="mt-1 inline-flex rounded-full bg-[color:var(--landing-teal-tint)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--landing-teal)]">
            +12%
          </span>
        </LandingFloatingCard>

        <LandingFloatingCard className="relative mt-10 px-4 pb-4 pt-5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-brand-muted">
            Weekly revenue
          </p>
          <div className="mt-3 flex items-end justify-between gap-1.5">
            {bars.map((height, index) => {
              const isHighlight = index === 3;
              return (
                <div key={`revenue-bar-${index}`} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-full rounded-md transition-all",
                      isHighlight
                        ? "bg-[color:var(--landing-teal)]"
                        : "bg-[color:var(--landing-teal)]/20",
                    )}
                    style={{ height: `${Math.round((height / max) * 72)}px` }}
                  />
                  <span className="text-[9px] font-medium text-brand-muted">{labels[index]}</span>
                </div>
              );
            })}
          </div>
        </LandingFloatingCard>
      </div>
    </div>
  );
}

const SCHEME_RULES = [
  {
    name: "Pre-authorisation",
    detail: "Required for specialist outpatient visits",
  },
  {
    name: "Tariff pricing",
    detail: "NHIS rate applied to line items",
  },
  {
    name: "Co-pay",
    detail: "20% client liability on medicines",
  },
];

export function LandingFeatureSchemeRulesVisual() {
  return (
    <div className={cn(ILLUSTRATION_CANVAS_CLASS, "flex items-center p-4 sm:p-5")}>
      <LandingFloatingCard className="w-full px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-brand-navy">MASM Executive</p>
            <p className="mt-0.5 text-xs text-brand-muted">Scheme rules on this invoice</p>
          </div>
          <span className="shrink-0 rounded-full bg-[color:var(--landing-teal-tint)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--landing-teal)]">
            Active
          </span>
        </div>
        <ul className="mt-3 divide-y divide-brand-border/70 border-y border-brand-border/70">
          {SCHEME_RULES.map((rule) => (
            <li key={rule.name} className="py-2.5 first:pt-3 last:pb-3">
              <p className="text-[11px] font-medium text-brand-navy">{rule.name}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-brand-muted">{rule.detail}</p>
            </li>
          ))}
        </ul>
      </LandingFloatingCard>
    </div>
  );
}

const INVENTORY_STOCK_ROWS = [
  {
    product: "Paracetamol 500mg",
    location: "Pharmacy",
    qty: "8 boxes",
    alert: "Low stock",
    tone: "warn" as const,
  },
  {
    product: "Amoxicillin 250mg",
    location: "Pharmacy",
    qty: "42 strips",
    alert: "OK",
    tone: "ok" as const,
  },
  {
    product: "Metformin 500mg",
    location: "Store",
    qty: "6 bottles",
    alert: "Expires Aug",
    tone: "warn" as const,
  },
  {
    product: "ORS sachets",
    location: "Pharmacy",
    qty: "120",
    alert: "OK",
    tone: "ok" as const,
  },
] as const;

function InventoryStatusBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "ok" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
        tone === "ok"
          ? "bg-[color:var(--landing-green-tint)] text-[color:var(--landing-green)]"
          : "bg-[color:var(--landing-amber-tint)] text-[color:var(--landing-amber)]",
      )}
    >
      {children}
    </span>
  );
}

/** Static recreation of the inventory register stock list. */
export function LandingFeatureInventoryVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-white p-5 sm:p-6",
        className,
      )}
      role="presentation"
    >
      <div>
        <h2 className="text-sm font-semibold text-brand-navy">Inventory register</h2>
        <p className="mt-1 text-sm text-brand-muted">
          On-hand quantities by location and product.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-brand-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              <th className="px-3 py-2.5 text-xs font-medium text-brand-muted">Product</th>
              <th className="hidden px-3 py-2.5 text-xs font-medium text-brand-muted sm:table-cell">
                Location
              </th>
              <th className="px-3 py-2.5 text-xs font-medium text-brand-muted">Qty on hand</th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-brand-muted">
                Alert
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {INVENTORY_STOCK_ROWS.map((row) => (
              <tr key={row.product}>
                <td className="px-3 py-2.5 font-medium text-brand-navy">{row.product}</td>
                <td className="hidden px-3 py-2.5 text-brand-muted sm:table-cell">
                  {row.location}
                </td>
                <td className="px-3 py-2.5 text-brand-muted">{row.qty}</td>
                <td className="px-3 py-2.5 text-right">
                  <InventoryStatusBadge tone={row.tone}>{row.alert}</InventoryStatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const INSURANCE_CLAIM_FIELDS = [
  { label: "Membership number", value: "3456789-0" },
  { label: "Practitioner number", value: "MA1519" },
  { label: "Service provider code", value: "153" },
  { label: "Claim reference", value: "—" },
] as const;

/** Static recreation of the invoice Claim tab card. */
export function LandingFeatureInsuranceClaimVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-white p-5 sm:p-6",
        className,
      )}
      role="presentation"
    >
      <div>
        <h2 className="text-sm font-semibold text-brand-navy">Insurance claim</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Verify the member, create a draft claim, then submit to MASM.
        </p>
      </div>

      <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50/80">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-emerald-800">All 4 checks passed</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            Details
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex h-9 items-center rounded-full bg-[color:var(--landing-teal)] px-5 text-sm font-medium text-white">
          Submit
        </span>
        <span className="inline-flex h-9 items-center rounded-full border border-brand-navy px-5 text-sm font-medium text-brand-navy">
          Edit draft
        </span>
      </div>

      <dl className="mt-5 grid gap-3 border-t border-brand-border pt-5 sm:grid-cols-2">
        {INSURANCE_CLAIM_FIELDS.map((field) => (
          <div key={field.label}>
            <dt className="text-xs text-brand-muted">{field.label}</dt>
            <dd className="text-sm text-brand-navy">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const PROVIDERS = [
  { initials: "AP", name: "Dr. A. Phiri", value: "MWK 120k", share: 100 },
  { initials: "BO", name: "Nurse B. Okonkwo", value: "MWK 95k", share: 79 },
  { initials: "CM", name: "Dr. C. Mensah", value: "MWK 78k", share: 65 },
];

export function LandingFeatureProviderVisual() {
  return (
    <div className={cn(ILLUSTRATION_CANVAS_CLASS, "flex items-center p-4 sm:p-5")}>
      <LandingFloatingCard className="relative w-full px-4 py-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-brand-muted">
          Revenue by provider
        </p>
        <ul className="mt-3 space-y-3">
          {PROVIDERS.map((provider) => (
            <li key={provider.initials} className="flex items-center gap-2.5">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-teal-tint)] text-[10px] font-bold text-[color:var(--landing-teal)]"
                aria-hidden="true"
              >
                {provider.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-medium text-brand-navy">{provider.name}</span>
                  <span className="shrink-0 font-semibold text-brand-navy">{provider.value}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[color:var(--landing-teal)]/15">
                  <div
                    className="h-full rounded-full bg-[color:var(--landing-teal)]"
                    style={{ width: `${provider.share}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </LandingFloatingCard>
    </div>
  );
}
