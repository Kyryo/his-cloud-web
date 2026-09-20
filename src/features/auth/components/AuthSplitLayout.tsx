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
        className="relative isolate flex min-h-[32vh] flex-col justify-between overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:min-h-screen lg:px-10 lg:py-10"
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
          className="relative z-10 inline-flex items-center gap-2"
          aria-label="SigmaHealth home"
        >
          <Image
            src={LANDING_LOGO_SRC}
            alt=""
            width={128}
            height={128}
            className="h-7 w-auto object-contain sm:h-8"
            aria-hidden="true"
          />
          <span className="font-[family-name:var(--font-bricolage)] text-[0.95rem] font-semibold tracking-[-0.018em] text-white">
            SigmaHealth
          </span>
        </Link>

        <div className="relative z-10 mt-8 max-w-md lg:mt-0">
          <h1 className="whitespace-pre-line font-[family-name:var(--font-bricolage)] text-[clamp(1.5rem,3vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white text-balance">
            {headline}
          </h1>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-white/80 sm:text-[15px]">
            {subhead}
          </p>
        </div>
      </aside>

      <div className="flex flex-col justify-center bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto w-full max-w-[22rem]">{children}</div>
        {belowCard ? (
          <div className="mx-auto mt-5 w-full max-w-[22rem]">
            {belowCard}
          </div>
        ) : null}
      </div>
    </div>
  );
}
