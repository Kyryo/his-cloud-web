"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";

import { LANDING_SOCIAL_PROOF } from "@/features/brand/constants/landing-home-content";
import { LANDING_SOCIAL_PROOF_LOGOS } from "@/features/brand/constants/landing-tokens";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

export function LandingSocialProofSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="landing-social-proof-heading"
      className="bg-white"
    >
      <motion.div
        className="mx-auto max-w-6xl px-6 pb-4 pt-8 sm:px-10 sm:pb-5 sm:pt-10 lg:px-12 lg:pt-11"
        variants={sectionVariants}
        initial={reduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          id="landing-social-proof-heading"
          variants={fadeUp}
          className="landing-body text-center text-sm font-medium tracking-normal text-[color:var(--landing-ledger-ink)] sm:text-[0.9375rem]"
        >
          {LANDING_SOCIAL_PROOF.headline}
        </motion.h2>

        <motion.div
          variants={fadeUp}
          className="mt-4 overflow-hidden rounded-[var(--landing-radius)] bg-[color:var(--landing-border)] sm:mt-5"
        >
          <ul
            className="grid grid-cols-2 gap-px md:grid-cols-3"
            aria-label="Clinics using Sigma"
          >
            {LANDING_SOCIAL_PROOF_LOGOS.map((company, index) => (
              <li
                key={company.id}
                className={cn(
                  "group flex min-h-[5.75rem] items-center justify-center bg-white px-5 py-6 sm:min-h-[6.5rem] sm:px-8 sm:py-7",
                  index === LANDING_SOCIAL_PROOF_LOGOS.length - 1 &&
                    "col-span-2 md:col-span-1",
                )}
              >
                <Image
                  src={company.src}
                  alt={company.name}
                  width={company.width}
                  height={company.height}
                  className={cn(
                    "h-auto w-auto object-contain grayscale-[40%] transition-[filter] duration-200",
                    "group-hover:grayscale-0",
                    company.imageClassName,
                  )}
                />
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
