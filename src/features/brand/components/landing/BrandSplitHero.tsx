import { type ReactNode } from "react";

import { BrandParallaxPhoto } from "@/features/brand/components/landing/BrandParallaxPhoto";

type BrandSplitHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  src: string;
  alt: string;
  imageClassName?: string;
  actions?: ReactNode;
};

export function BrandSplitHero({
  eyebrow,
  title,
  description,
  src,
  alt,
  imageClassName,
  actions,
}: BrandSplitHeroProps) {
  return (
    <section className="relative md:h-dvh md:min-h-[42rem]">
      <div className="grid md:h-full md:grid-cols-2">
        <div className="flex min-w-0 flex-col justify-center px-6 pb-10 pt-28 sm:px-10 md:px-12 md:pt-24 lg:px-16 xl:pl-[max(3rem,calc((100vw-72rem)/2+3rem))] xl:pr-14">
          <p className="text-sm font-medium text-[color:var(--landing-teal)]">
            {eyebrow}
          </p>
          <h1 className="landing-display mt-5 max-w-[13ch] text-[clamp(2.15rem,4.6vw,4.1rem)] font-semibold tracking-[-0.05em] leading-[1.04] text-[color:var(--landing-ink)]">
            {title}
          </h1>
          <p className="landing-body mt-6 max-w-[32rem] text-[1.05rem] leading-[1.7] text-[color:var(--landing-ledger-ink)] sm:text-lg">
            {description}
          </p>
          {actions ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {actions}
            </div>
          ) : null}
        </div>

        <BrandParallaxPhoto
          src={src}
          alt={alt}
          variant="hero"
          className="h-[56vh] w-full md:h-full md:min-h-0"
          imageClassName={imageClassName}
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
    </section>
  );
}
