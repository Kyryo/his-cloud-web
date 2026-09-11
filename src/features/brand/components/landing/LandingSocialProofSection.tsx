import Image from "next/image";

import { LANDING_SOCIAL_PROOF } from "@/features/brand/constants/landing-home-content";
import { LANDING_SOCIAL_PROOF_LOGOS } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

export function LandingSocialProofSection() {
  return (
    <div aria-labelledby="landing-social-proof-heading">
      <div className="mx-auto max-w-6xl px-6 pb-5 pt-1 sm:px-10 sm:pb-6 lg:px-12">
        <h2
          id="landing-social-proof-heading"
          className="landing-body text-center text-[13px] font-medium tracking-normal text-[color:var(--landing-ledger-ink)]"
        >
          {LANDING_SOCIAL_PROOF.headline}
        </h2>
        <ul
          className="mt-2.5 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:gap-x-10"
          aria-label="Clinics using Sigma"
        >
          {LANDING_SOCIAL_PROOF_LOGOS.map((company) => (
            <li key={company.id} className="flex items-center justify-center">
              <Image
                src={company.src}
                alt={company.name}
                width={company.width}
                height={company.height}
                className={cn(
                  "h-auto w-auto object-contain grayscale-[40%]",
                  company.id === "warm-hands"
                    ? "h-8 max-w-[6.25rem] sm:h-9 sm:max-w-[7rem]"
                    : company.id === "dental-implant"
                      ? "h-8 max-w-[5.25rem] sm:h-9 sm:max-w-[5.75rem]"
                      : "h-6 max-w-[9.5rem] sm:h-7 sm:max-w-[11rem]",
                )}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
