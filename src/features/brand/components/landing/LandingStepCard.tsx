type LandingStepCardProps = {
  step: number;
  title: string;
  description: string;
};

export function LandingStepCard({ step, title, description }: LandingStepCardProps) {
  return (
    <li className="landing-card flex gap-5 rounded-[14px] bg-white p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--landing-shadow-hover)]">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-teal)] text-sm font-bold text-white"
        aria-hidden="true"
      >
        {step}
      </div>
      <div>
        <h3 className="landing-text-ink font-[family-name:var(--font-bricolage)] text-lg font-semibold">
          {title}
        </h3>
        <p className="landing-body mt-2 text-base leading-relaxed text-[color:var(--landing-ledger-ink)]">
          {description}
        </p>
      </div>
    </li>
  );
}
