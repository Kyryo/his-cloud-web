import {
  TbCalendar,
  TbChartBar,
  TbLayoutDashboard,
  TbPackage,
  TbUsers,
  TbWallet,
} from "react-icons/tb";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: TbLayoutDashboard, active: true },
  { label: "Patients", icon: TbUsers, active: false },
  { label: "Visits", icon: TbCalendar, active: false },
  { label: "Billing", icon: TbWallet, active: false },
  { label: "Inventory", icon: TbPackage, active: false },
] as const;

const STAT_CARDS = [
  { label: "Patients today", value: "47" },
  { label: "Revenue", value: "K 284k" },
  { label: "Low-stock alerts", value: "3" },
] as const;

const QUEUE_ROWS = [
  {
    name: "Grace Mwale",
    visitType: "General consult",
    status: "Waiting",
    statusClass: "bg-amber-50 text-amber-800",
  },
  {
    name: "James Okello",
    visitType: "Follow-up",
    status: "In consult",
    statusClass: "bg-brand-tint text-brand-primary",
  },
  {
    name: "Fatima Hassan",
    visitType: "Antenatal",
    status: "Ready",
    statusClass: "bg-emerald-50 text-emerald-700",
  },
] as const;

export function HeroBrowserMockup() {
  return (
    <div className="landing-chrome overflow-hidden rounded-xl border-[0.5px] border-brand-border bg-white shadow-[0_16px_48px_rgba(21,101,216,0.08)]">
      <div className="flex items-center gap-3 border-b border-brand-border bg-[#f1f4f8] px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <p className="mx-auto truncate text-[11px] text-brand-muted">
          app.sigmahmis.com · Sunrise Community Clinic
        </p>
      </div>

      <div className="flex min-h-[280px] sm:min-h-[320px]">
        <aside className="hidden w-[200px] shrink-0 border-r border-brand-border bg-sidebar p-3 md:block">
          <nav className="space-y-0.5">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] ${
                    item.active
                      ? "bg-brand-tint font-medium text-brand-primary"
                      : "text-brand-muted"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 bg-[#fafbfc] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-brand-navy">Today&apos;s queue</p>
            <TbChartBar className="size-4 text-brand-muted" aria-hidden="true" />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {STAT_CARDS.map((card) => (
              <div
                key={card.label}
                className="rounded-lg border-[0.5px] border-brand-border bg-white px-2 py-2 sm:px-3 sm:py-2.5"
              >
                <p className="text-[10px] leading-tight text-brand-muted sm:text-[11px]">
                  {card.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-brand-navy sm:text-base">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {QUEUE_ROWS.map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-2 rounded-lg border-[0.5px] border-brand-border bg-white px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-brand-navy">
                    {row.name}
                  </p>
                  <p className="truncate text-[11px] text-brand-muted">{row.visitType}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${row.statusClass}`}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
