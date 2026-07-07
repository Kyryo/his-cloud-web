import { LandingProductMockupFrame } from "@/features/brand/components/landing/LandingProductMockupFrame";

export type LandingProductScreenId =
  | "dashboard-revenue"
  | "insurance-claims"
  | "provider-performance"
  | "inventory-stock"
  | "browser-setup"
  | "onboarding-checklist"
  | "connectivity-sync"
  | "support-help";

type LandingProductScreenProps = {
  screen: LandingProductScreenId;
  placeholderNote: string;
};

function StatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "ok" | "warn" | "error" | "pending";
}) {
  const classes = {
    ok: "bg-[color:var(--landing-green-tint)] text-[color:var(--landing-green)]",
    warn: "bg-[color:var(--landing-amber-tint)] text-[color:var(--landing-amber)]",
    error: "bg-red-50 text-red-700",
    pending: "bg-[color:var(--landing-teal-tint)] text-[color:var(--landing-teal)]",
  }[tone];

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${classes}`}>
      {children}
    </span>
  );
}

function DashboardRevenueScreen() {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-sm font-semibold text-brand-navy">Finance overview</p>
      <p className="mt-0.5 text-xs text-brand-muted">June 2026 · All locations</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Revenue (MTD)", value: "MWK 4.2M" },
          { label: "Outstanding", value: "MWK 840k" },
          { label: "Visits today", value: "47" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-brand-border bg-white px-3 py-2.5"
          >
            <p className="text-[10px] text-brand-muted">{stat.label}</p>
            <p className="mt-0.5 text-sm font-semibold text-brand-navy">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-brand-border bg-white p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          Revenue by payment method
        </p>
        <div className="mt-3 space-y-2">
          {[
            { label: "Cash", pct: 42 },
            { label: "Insurance", pct: 38 },
            { label: "Mobile money", pct: 20 },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-brand-slate">{row.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-border/60">
                <div
                  className="h-full rounded-full bg-[color:var(--landing-teal)]"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-brand-muted">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsuranceClaimsScreen() {
  const rows = [
    { id: "CLM-1042", patient: "Grace M.", status: "Rejected", tone: "error" as const },
    { id: "CLM-1038", patient: "James O.", status: "Paid", tone: "ok" as const },
    { id: "CLM-1035", patient: "Fatima H.", status: "Pending", tone: "pending" as const },
    { id: "CLM-1031", patient: "Rajesh M.", status: "Approved", tone: "ok" as const },
  ];

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brand-navy">Insurance claims</p>
        <StatusBadge tone="warn">3 need follow-up</StatusBadge>
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-border text-[10px] uppercase tracking-wide text-brand-muted">
            <th className="pb-2 font-medium">Claim</th>
            <th className="pb-2 font-medium">Patient</th>
            <th className="pb-2 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-brand-border/70">
              <td className="py-2.5 font-mono text-xs text-brand-slate">{row.id}</td>
              <td className="py-2.5 text-brand-navy">{row.patient}</td>
              <td className="py-2.5 text-right">
                <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProviderPerformanceScreen() {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-sm font-semibold text-brand-navy">Provider performance</p>
      <p className="mt-0.5 text-xs text-brand-muted">Services & revenue · Last 30 days</p>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-border text-[10px] uppercase tracking-wide text-brand-muted">
            <th className="pb-2 font-medium">Provider</th>
            <th className="pb-2 font-medium">Visits</th>
            <th className="pb-2 text-right font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: "Dr. A. Phiri", visits: 124, revenue: "MWK 1.8M" },
            { name: "Nurse B. Okonkwo", visits: 89, revenue: "MWK 620k" },
            { name: "Dr. C. Mensah", visits: 76, revenue: "MWK 940k" },
          ].map((row) => (
            <tr key={row.name} className="border-b border-brand-border/70">
              <td className="py-2.5 text-brand-navy">{row.name}</td>
              <td className="py-2.5 text-brand-muted">{row.visits}</td>
              <td className="py-2.5 text-right font-medium text-brand-navy">{row.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryStockScreen() {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brand-navy">Inventory</p>
        <StatusBadge tone="warn">2 expiring soon</StatusBadge>
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-border text-[10px] uppercase tracking-wide text-brand-muted">
            <th className="pb-2 font-medium">Item</th>
            <th className="pb-2 font-medium">On hand</th>
            <th className="pb-2 text-right font-medium">Alert</th>
          </tr>
        </thead>
        <tbody>
          {[
            { item: "Paracetamol 500mg", qty: "8 boxes", alert: "Low stock", tone: "warn" as const },
            { item: "Amoxicillin 250mg", qty: "42 strips", alert: "OK", tone: "ok" as const },
            {
              item: "Metformin 500mg",
              qty: "6 bottles",
              alert: "Expires Aug",
              tone: "warn" as const,
            },
            { item: "ORS sachets", qty: "120", alert: "Fast mover", tone: "ok" as const },
          ].map((row) => (
            <tr key={row.item} className="border-b border-brand-border/70">
              <td className="py-2.5 text-brand-navy">{row.item}</td>
              <td className="py-2.5 text-brand-muted">{row.qty}</td>
              <td className="py-2.5 text-right">
                <StatusBadge tone={row.tone}>{row.alert}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BrowserSetupScreen() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center p-6 text-center sm:min-h-[280px]">
      <div className="rounded-xl border border-brand-border bg-white px-6 py-5 shadow-sm">
        <p className="text-sm font-semibold text-brand-navy">Sign in to Sigma</p>
        <p className="mt-1 text-xs text-brand-muted">Works in Chrome, Safari, or Edge — no install</p>
        <div className="mt-4 space-y-2">
          <div className="h-9 rounded-lg border border-brand-border bg-[#fafbfc] px-3 text-left text-xs leading-9 text-brand-muted">
            clinic@example.com
          </div>
          <div className="landing-btn-primary mx-auto flex h-9 w-full items-center justify-center rounded-lg text-xs font-semibold">
            Continue
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingChecklistScreen() {
  const steps = [
    { label: "Setup call completed", done: true },
    { label: "Services & billing configured", done: true },
    { label: "Staff accounts created", done: true },
    { label: "Team training", done: false },
  ];

  return (
    <div className="p-4 sm:p-5">
      <p className="text-sm font-semibold text-brand-navy">Clinic onboarding</p>
      <p className="mt-0.5 text-xs text-brand-muted">Started today · 6 hrs elapsed</p>
      <ul className="mt-4 space-y-3">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex items-center gap-3 rounded-lg border border-brand-border bg-white px-3 py-2.5"
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                step.done
                  ? "bg-[color:var(--landing-green-tint)] text-[color:var(--landing-green)]"
                  : "border border-brand-border text-brand-muted"
              }`}
              aria-hidden="true"
            >
              {step.done ? "✓" : "·"}
            </span>
            <span className="text-sm text-brand-navy">{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConnectivitySyncScreen() {
  return (
    <div className="p-4 sm:p-5">
      <div className="rounded-lg border border-brand-border bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-brand-navy">Sync status</p>
          <StatusBadge tone="ok">Connected</StatusBadge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-brand-muted">
          Last sync 2 min ago · 3G connection · 142 KB transferred today
        </p>
        <div className="mt-4 space-y-2 border-t border-brand-border pt-4">
          {[
            { action: "Visit saved", time: "10:41" },
            { action: "Invoice updated", time: "10:38" },
            { action: "Stock dispensed", time: "10:35" },
          ].map((row) => (
            <div key={row.action} className="flex justify-between text-xs">
              <span className="text-brand-slate">{row.action}</span>
              <span className="text-brand-muted">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportHelpScreen() {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-sm font-semibold text-brand-navy">Get help</p>
      <div className="mt-4 space-y-3">
        {[
          { channel: "WhatsApp support", detail: "Typical reply under 2 hours" },
          { channel: "Setup call", detail: "Included with every plan" },
          { channel: "In-app guides", detail: "Billing, stock, insurance workflows" },
        ].map((row) => (
          <div
            key={row.channel}
            className="rounded-lg border border-brand-border bg-white px-3 py-2.5"
          >
            <p className="text-sm font-medium text-brand-navy">{row.channel}</p>
            <p className="mt-0.5 text-xs text-brand-muted">{row.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREEN_RENDERERS: Record<
  LandingProductScreenId,
  () => React.ReactElement
> = {
  "dashboard-revenue": DashboardRevenueScreen,
  "insurance-claims": InsuranceClaimsScreen,
  "provider-performance": ProviderPerformanceScreen,
  "inventory-stock": InventoryStockScreen,
  "browser-setup": BrowserSetupScreen,
  "onboarding-checklist": OnboardingChecklistScreen,
  "connectivity-sync": ConnectivitySyncScreen,
  "support-help": SupportHelpScreen,
};

export function LandingProductScreen({
  screen,
  placeholderNote,
}: LandingProductScreenProps) {
  const Screen = SCREEN_RENDERERS[screen];

  return (
    <LandingProductMockupFrame placeholderNote={placeholderNote}>
      <Screen />
    </LandingProductMockupFrame>
  );
}
