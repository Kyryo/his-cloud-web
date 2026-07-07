import { cn } from "@/lib/utils";

type LandingDottedArcDecorProps = {
  className?: string;
};

const ARC_STROKE = "#6f6252";

/** Faint dotted arc texture — sits behind post-hero screenshot and headline. */
export function LandingDottedArcDecor({ className }: LandingDottedArcDecorProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {/* Desktop: arcs sweep around centered screenshot toward headline */}
      <svg
        viewBox="0 0 1200 560"
        preserveAspectRatio="xMidYMid slice"
        className="absolute left-1/2 top-1/2 hidden h-[150%] w-[130%] -translate-x-1/2 -translate-y-1/2 sm:block"
        fill="none"
      >
        <path
          d="M-20 420 C180 80, 420 40, 600 120 S980 360, 1220 180"
          stroke={ARC_STROKE}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 12"
          opacity="0.16"
        />
        <path
          d="M80 460 C280 220, 520 180, 700 240 S1040 400, 1140 280"
          stroke={ARC_STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 16"
          opacity="0.11"
        />
        <path
          d="M200 120 C360 40, 540 80, 680 200 S920 420, 1080 360"
          stroke={ARC_STROKE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1.5 14"
          opacity="0.09"
        />
      </svg>

      {/* Mobile: simplified arc behind centered screenshot */}
      <svg
        viewBox="0 0 480 360"
        preserveAspectRatio="xMidYMid slice"
        className="absolute left-1/2 top-1/2 h-[120%] w-[125%] -translate-x-1/2 -translate-y-[45%] sm:hidden"
        fill="none"
      >
        <path
          d="M-10 280 C120 60, 260 40, 400 140 S520 300, 500 220"
          stroke={ARC_STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 10"
          opacity="0.12"
        />
      </svg>
    </div>
  );
}
