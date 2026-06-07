const KPI_STATS = [
  { value: "98.2%", label: "claims accepted on first submission." },
  { value: "37% faster", label: "payments from insurance companies." },
  { value: "18% cut", label: "in supply waste." },
] as const;

const PERSONA_CARDS = [
  { title: "For Finance", label: "Recover Revenue Without Adding Headcount" },
  {
    title: "For Operations",
    label: "Shorter Billing Cycles, Fewer Stockouts, Less Firefighting",
  },
  { title: "For Clinical Staff", label: "Full Continuum of Care. Always in View" },
] as const;

type StatsSectionProps = {
  className?: string;
};

export function StatsSection({ className = "" }: StatsSectionProps) {
  return (
    <section className={className.trim()}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
              What changes when you choose Sigma Health?
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold text-brand-navy sm:text-3xl">
              A calmer, tighter revenue workflow.
            </h2>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-0 overflow-hidden rounded-[28px] border border-brand-border bg-brand-tint text-left sm:grid-cols-3">
          {KPI_STATS.map((stat) => (
            <div
              key={stat.value}
              className="border-b border-brand-border p-6 last:border-r-0 sm:border-b-0 sm:border-r"
            >
              <p className="text-3xl font-bold text-brand-navy">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-brand-slate">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 text-left md:grid-cols-3">
          {PERSONA_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-[24px] border border-brand-border bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {card.title}
              </p>
              <p className="mt-3 font-[family-name:var(--font-bricolage)] text-base font-extrabold text-brand-navy">
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
