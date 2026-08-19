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
};

function SigmaHealthWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-[family-name:var(--font-display)] text-[1.0625rem] font-semibold leading-none tracking-[-0.018em] text-[color:var(--landing-ink)] sm:text-[1.2rem]",
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-semibold">Sigma</span>
      Health
    </span>
  );
}

export function LandingLogo({
  className,
  imageClassName = "h-12 w-auto sm:h-14",
  priority = false,
  linked = true,
  showWordmark = false,
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
      <SigmaHealthWordmark />
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
      aria-label="SigmaHealth home"
    >
      {lockup}
    </Link>
  );
}
