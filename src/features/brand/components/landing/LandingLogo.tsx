import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LANDING_LOGO_SRC } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

type LandingLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  linked?: boolean;
  /** Icon + SigmaHealth wordmark lockup (header). */
  showWordmark?: boolean;
  /** `inverse` for dark panels (white wordmark). */
  tone?: "default" | "inverse";
};

type SigmaHealthWordmarkProps = {
  className?: string;
  tone?: "default" | "inverse";
};

/** Matches the Sigma Health logo lockup: larger Sigma + smaller Health. */
export function SigmaHealthWordmark({
  className,
  tone = "default",
}: SigmaHealthWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-[family-name:var(--font-display)] text-[1.0625rem] font-semibold leading-none tracking-[-0.018em] sm:text-[1.2rem]",
        tone === "inverse"
          ? "text-white"
          : "text-[color:var(--landing-ink)]",
        className,
      )}
      aria-hidden="true"
    >
      <span>Sigma</span>
      <span className="ml-[0.16em] text-[0.55em]">Health.</span>
    </span>
  );
}

export function LandingLogo({
  className,
  imageClassName = "h-12 w-auto sm:h-14",
  priority = false,
  linked = true,
  showWordmark = false,
  tone = "default",
}: LandingLogoProps) {
  const image = (
    <Image
      src={LANDING_LOGO_SRC}
      alt=""
      width={128}
      height={128}
      className={cn("object-contain", imageClassName)}
      priority={priority}
      aria-hidden="true"
    />
  );

  const lockup = showWordmark ? (
    <>
      {image}
      <SigmaHealthWordmark tone={tone} />
    </>
  ) : (
    <Image
      src={LANDING_LOGO_SRC}
      alt="Sigma Health"
      width={128}
      height={128}
      className={cn("object-contain", imageClassName)}
      priority={priority}
    />
  );

  const wrapperClass = cn(
    "inline-flex shrink-0 items-center",
    showWordmark && "gap-2.5 sm:gap-3",
    className,
  );

  if (!linked) {
    return <span className={wrapperClass}>{lockup}</span>;
  }

  return (
    <Link
      href={ROUTES.home}
      className={cn(
        wrapperClass,
        "landing-focus rounded-lg transition-opacity hover:opacity-90",
      )}
      aria-label="Sigma Health home"
    >
      {lockup}
    </Link>
  );
}
