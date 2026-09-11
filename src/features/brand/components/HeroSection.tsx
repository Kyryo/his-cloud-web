"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { HeroProductStage } from "@/features/brand/components/landing/HeroProductStage";
import { LandingSocialProofSection } from "@/features/brand/components/landing/LandingSocialProofSection";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="landing-hero-ground relative flex min-h-[100dvh] flex-col overflow-hidden bg-white pt-16">
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-5 sm:px-10 sm:py-7 lg:px-12 lg:pr-4 lg:py-8">
        <div className="grid items-center gap-7 lg:grid-cols-[minmax(22rem,1fr)_minmax(0,28rem)] lg:gap-8">
          <motion.div
            className="relative z-20"
            variants={containerVariants}
            initial={reduceMotion ? "visible" : "hidden"}
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="landing-display pb-1 text-[clamp(1.85rem,3.6vw,2.85rem)] font-semibold leading-[1.14] tracking-[-0.024em] text-[color:var(--landing-ink)]"
            >
              Stop{" "}
              <span className="relative inline-block italic font-medium tracking-[-0.02em]">
                leaking
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-0.06em] -bottom-1 h-[2px] bg-[color:var(--landing-teal)]"
                />
              </span>{" "}
              revenue after every patient visit
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="landing-body mt-4 max-w-[32rem] text-[1rem] leading-[1.6] text-[color:var(--landing-ledger-ink)] sm:mt-5 sm:text-[1.05rem] sm:leading-[1.65]"
            >
              Sigma bills patients, submits insurance claims automatically, and
              tracks every payment until you&apos;re paid fully.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-col items-start gap-3 sm:mt-7 sm:flex-row sm:items-center"
            >
              <Link
                href={ROUTES.signup}
                className="landing-focus landing-btn-primary group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 py-2.5 text-[15px] font-semibold sm:min-h-12 sm:py-3"
              >
                Start for free
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href={ROUTES.contacts}
                className="landing-focus landing-btn-secondary inline-flex min-h-11 items-center justify-center rounded-full border px-7 py-2.5 text-[15px] font-semibold sm:min-h-12 sm:py-3"
              >
                Book a demo
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-0 min-w-0"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroProductStage />
          </motion.div>
        </div>
      </div>

      <div className="relative z-20">
        <LandingSocialProofSection />
      </div>
    </section>
  );
}
