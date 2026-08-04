import { cn } from "@/lib/utils";

type SignupHealthcareGraphicProps = {
  className?: string;
};

/**
 * Calm abstract healthcare motif for the signup brand panel.
 * Soft claim-path / pulse / care cross — not decorative clutter.
 */
export function SignupHealthcareGraphic({ className }: SignupHealthcareGraphicProps) {
  return (
    <div className={cn("relative aspect-[4/3]", className)} aria-hidden="true">
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="signup-panel-fade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B6E6E" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#2F5E46" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B86A1F" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="signup-pulse" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0B6E6E" stopOpacity="0" />
            <stop offset="35%" stopColor="#0B6E6E" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0B6E6E" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect
          x="24"
          y="28"
          width="352"
          height="244"
          rx="28"
          fill="url(#signup-panel-fade)"
          stroke="#E0D5C8"
          strokeOpacity="0.7"
        />

        {/* Soft care cross */}
        <rect x="178" y="72" width="44" height="14" rx="7" fill="#0B6E6E" fillOpacity="0.18" />
        <rect x="193" y="57" width="14" height="44" rx="7" fill="#0B6E6E" fillOpacity="0.18" />

        {/* Pulse / claim path */}
        <path
          d="M56 168 H118 L138 128 L168 208 L198 148 L228 168 H344"
          stroke="url(#signup-pulse)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Orbiting nodes */}
        <circle cx="118" cy="168" r="5" fill="#0B6E6E" fillOpacity="0.55" />
        <circle cx="198" cy="148" r="5" fill="#2F5E46" fillOpacity="0.55" />
        <circle cx="288" cy="168" r="5" fill="#0B6E6E" fillOpacity="0.4" />

        {/* Subtle card stack suggestion */}
        <rect
          x="72"
          y="214"
          width="96"
          height="28"
          rx="10"
          fill="#FFFFFF"
          fillOpacity="0.72"
          stroke="#E0D5C8"
        />
        <rect
          x="184"
          y="214"
          width="144"
          height="28"
          rx="10"
          fill="#FFFFFF"
          fillOpacity="0.72"
          stroke="#E0D5C8"
        />
        <rect x="84" y="224" width="48" height="8" rx="4" fill="#0B6E6E" fillOpacity="0.2" />
        <rect x="196" y="224" width="72" height="8" rx="4" fill="#2F5E46" fillOpacity="0.2" />
      </svg>
    </div>
  );
}
