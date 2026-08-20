import Image from "next/image";

export function HeroProductStage() {
  return (
    <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem] lg:mx-0 lg:max-w-[24rem] xl:max-w-[26rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -inset-y-6 rounded-[40%] bg-[color:var(--landing-teal)]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-[color:var(--landing-amber)]/20 blur-2xl"
      />

      <div className="relative flex gap-2 sm:gap-2.5">
        <div className="w-[58%] shrink-0">
          <Image
            src="/landing/hero-clinic-billing.jpg"
            alt="A clinic finance officer reviewing insurance claims and payments at a desk"
            width={2048}
            height={3072}
            quality={92}
            priority
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 240px, 55vw"
            className="aspect-[4/5] h-full w-full object-cover object-[center_20%] shadow-[0_14px_32px_-20px_rgba(31,42,36,0.45)]"
          />
        </div>

        <div className="flex w-[42%] flex-col gap-2 pt-4 sm:gap-2.5 sm:pt-6">
          <Image
            src="/landing/hero-clinic-claims.jpg"
            alt="Clinic staff checking whether insurance claims have been paid"
            width={2048}
            height={3072}
            quality={92}
            sizes="(min-width: 1280px) 200px, (min-width: 1024px) 180px, 40vw"
            className="aspect-[4/5] w-full object-cover object-[center_30%] shadow-[0_14px_32px_-20px_rgba(31,42,36,0.45)]"
          />
          <Image
            src="/landing/hero-clinic-payment.jpg"
            alt="A clinic front desk taking a patient payment"
            width={3072}
            height={2048}
            quality={92}
            sizes="(min-width: 1280px) 200px, (min-width: 1024px) 180px, 40vw"
            className="aspect-[5/4] w-full object-cover object-center shadow-[0_14px_32px_-20px_rgba(31,42,36,0.45)]"
          />
        </div>
      </div>
    </div>
  );
}
