import { LANDING_PROBLEM } from "@/features/brand/constants/landing-home-content";

export function LandingProblemFeatureCards() {
  return (
    <blockquote className="mx-auto max-w-2xl text-center">
      <span
        aria-hidden="true"
        className="mx-auto mb-6 block h-0.5 w-10 bg-[color:var(--landing-teal)]"
      />
      <p className="landing-display pb-1 text-[clamp(1.45rem,2.6vw,2rem)] font-medium italic leading-[1.28] tracking-[-0.025em] text-[color:var(--landing-ink)] text-balance">
        {LANDING_PROBLEM.closing}
      </p>
    </blockquote>
  );
}
