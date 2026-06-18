const PROOF_STATS = [
  { value: "300+", label: "Active clinics" },
  { value: "14", label: "Countries" },
  { value: "<8 hrs", label: "Avg setup time" },
  { value: "85%", label: "Report time saved" },
] as const;

export function LandingProofStrip() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-8 sm:px-12">
      <div className="overflow-hidden rounded-xl border-[0.5px] border-brand-border">
        <div className="grid grid-cols-2 divide-x divide-y divide-brand-border bg-white lg:grid-cols-4 lg:divide-y-0">
          {PROOF_STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-5 text-center sm:px-6 sm:py-6">
              <p className="font-[family-name:var(--font-bricolage)] text-2xl font-extrabold text-brand-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-brand-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
