import type { LucideIcon } from "lucide-react";

import type { LandingAccent } from "@/features/brand/constants/landing-tokens";
import { LANDING_ACCENT_STYLES } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

type LandingBulletCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: LandingAccent;
  className?: string;
};

export function LandingBulletCard({
  title,
  description,
  icon: Icon,
  accent = "teal",
  className,
}: LandingBulletCardProps) {
  const accentStyle = LANDING_ACCENT_STYLES[accent];

  return (
    <article
      className={cn(
        "landing-card group rounded-[14px] bg-white p-6 transition-[transform,box-shadow] duration-200",
        "hover:-translate-y-0.5 hover:shadow-[var(--landing-shadow-hover)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-[10px]",
          accentStyle.iconBg,
          accentStyle.iconColor,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="landing-text-ink mt-4 font-[family-name:var(--font-bricolage)] text-lg font-semibold">
        {title}
      </h3>
      <p className="landing-body mt-2 text-base leading-relaxed text-[color:var(--landing-ledger-ink)]">
        {description}
      </p>
    </article>
  );
}
