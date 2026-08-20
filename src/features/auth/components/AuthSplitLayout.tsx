import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ROUTES } from "@/constants/routes";
import { LANDING_LOGO_SRC } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

type AuthSplitLayoutProps = {
  headline: string;
  subhead: string;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  belowCard?: ReactNode;
  className?: string;
  panelTestId?: string;
};

export function AuthSplitLayout({
  headline,
  subhead,
  imageSrc,
  imageAlt,
  children,
  belowCard,
  className,
  panelTestId,
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn("grid min-h-screen lg:grid-cols-2", className)}
    >
      <aside
        className="relative isolate flex min-h-[38vh] flex-col justify-between overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:min-h-screen lg:px-12 lg:py-12"
        data-testid={panelTestId}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[center_22%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#1f2a24] via-[#1f2a24]/55 to-[#1f2a24]/25"
        />

        <Link
          href={ROUTES.home}
          className="relative z-10 inline-flex items-center gap-2.5"
          aria-label="SigmaHealth home"
        >
          <Image
            src={LANDING_LOGO_SRC}
            alt=""
            width={128}
            height={128}
            className="h-9 w-auto object-contain sm:h-10"
            aria-hidden="true"
          />
          <span className="font-[family-name:var(--font-bricolage)] text-[1.15rem] font-semibold tracking-[-0.018em] text-white">
            SigmaHealth
          </span>
        </Link>

        <div className="relative z-10 mt-10 max-w-lg lg:mt-0">
          <h1 className="whitespace-pre-line font-[family-name:var(--font-bricolage)] text-[clamp(2.15rem,4.6vw,4.35rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white text-balance">
            {headline}
          </h1>
          <p className="mt-4 max-w-[28ch] text-base leading-relaxed text-white/80 sm:text-lg">
            {subhead}
          </p>
        </div>
      </aside>

      <div className="flex flex-col justify-center bg-white px-5 py-10 sm:px-10 lg:px-16 lg:py-12">
        <div className="mx-auto w-full max-w-[28rem]">{children}</div>
        {belowCard ? (
          <div className="mx-auto mt-6 w-full max-w-[28rem]">
            {belowCard}
          </div>
        ) : null}
      </div>
    </div>
  );
}
