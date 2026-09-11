import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const TILE_RADIUS = "rounded-[1.35rem]";
const TILE_SHADOW = "shadow-[0_20px_44px_-26px_rgba(31,42,36,0.5)]";

function HeroCollageTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden bg-[color:var(--landing-warm)]",
        TILE_RADIUS,
        TILE_SHADOW,
        className,
      )}
    >
      {children}
    </figure>
  );
}

function HeroCollagePhoto({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  imageClassName,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes: string;
  imageClassName?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={92}
      priority={priority}
      sizes={sizes}
      className={cn("h-full w-full object-cover", imageClassName)}
    />
  );
}

export function HeroProductStage() {
  return (
    <div className="relative mx-auto w-full max-w-[16.5rem] sm:max-w-[20rem] lg:mx-0 lg:max-w-none">
      <div className="grid grid-cols-2 items-end gap-1.5 sm:gap-2 lg:grid-cols-12 lg:gap-2">
        <HeroCollageTile className="lg:col-span-4 lg:col-start-3">
          <div className="aspect-[5/4]">
            <HeroCollagePhoto
              src="/landing/hero-collage-front-desk.png"
              alt="A receptionist reviewing the clinic schedule at the front desk"
              width={1376}
              height={768}
              sizes="(min-width: 1280px) 180px, (min-width: 1024px) 150px, 42vw"
              imageClassName="object-[20%_center]"
            />
          </div>
        </HeroCollageTile>

        <HeroCollageTile className="lg:col-span-6">
          <div className="aspect-[5/4]">
            <HeroCollagePhoto
              src="/landing/hero-clinic-billing.jpg"
              alt="A clinic finance officer reviewing insurance claims and payments at a desk"
              width={2048}
              height={3072}
              priority
              sizes="(min-width: 1280px) 240px, (min-width: 1024px) 200px, 48vw"
              imageClassName="object-[center_16%]"
            />
          </div>
        </HeroCollageTile>

        <HeroCollageTile className="lg:col-span-7">
          <div className="aspect-[16/10]">
            <HeroCollagePhoto
              src="/landing/hero-collage-doctor.png"
              alt="A physician reviewing patient records on a laptop"
              width={1376}
              height={768}
              priority
              sizes="(min-width: 1280px) 280px, (min-width: 1024px) 240px, 48vw"
              imageClassName="object-[center_30%]"
            />
          </div>
        </HeroCollageTile>

        <HeroCollageTile className="lg:col-span-5">
          <div className="aspect-[5/4]">
            <HeroCollagePhoto
              src="/landing/hero-collage-consult.png"
              alt="A clinician reviewing visit notes with a patient"
              width={1376}
              height={768}
              sizes="(min-width: 1280px) 200px, (min-width: 1024px) 170px, 48vw"
              imageClassName="object-[60%_center]"
            />
          </div>
          <figcaption className="absolute bottom-2 left-2 w-[min(9.5rem,70%)] rounded-xl bg-white px-2.5 py-2 shadow-[0_10px_22px_-12px_rgba(31,42,36,0.5)]">
            <p className="text-[11px] font-semibold leading-none text-[color:var(--landing-ink)]">
              Claim ready
            </p>
            <p className="mt-1 text-[11px] leading-snug text-[color:var(--landing-ledger-ink)]">
              All checks passed
            </p>
          </figcaption>
        </HeroCollageTile>

        <HeroCollageTile className="col-span-2 w-[72%] justify-self-end sm:w-[68%] lg:col-span-8 lg:col-start-5 lg:w-auto">
          <div className="aspect-[2.8/1]">
            <HeroCollagePhoto
              src="/landing/hero-collage-payment.png"
              alt="A clinic front desk taking a patient card payment"
              width={1376}
              height={768}
              sizes="(min-width: 1280px) 320px, (min-width: 1024px) 260px, 70vw"
              imageClassName="object-[25%_center]"
            />
          </div>
        </HeroCollageTile>
      </div>
    </div>
  );
}
