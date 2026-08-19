"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { HeroProductStage } from "@/features/brand/components/landing/HeroProductStage";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
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
    <section className="landing-hero-ground relative overflow-hidden pt-20">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-10 sm:px-10 sm:pb-12 sm:pt-12 lg:px-12 lg:pb-10 lg:pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <motion.div
            className="lg:col-span-7 xl:col-span-6"
            variants={containerVariants}
            initial={reduceMotion ? "visible" : "hidden"}
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="landing-display text-[clamp(2.05rem,4.1vw,3.4rem)] font-semibold leading-[1.12] tracking-[-0.018em] text-[color:var(--landing-ink)]"
            >
              Stop losing revenue after every patient visit
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="landing-body mt-5 max-w-[32rem] text-[1.05rem] leading-[1.65] text-[color:var(--landing-ledger-ink)] sm:text-lg"
            >
              Sigma bills patients, submits insurance claims automatically, and
              tracks every payment until you&apos;re paid fully.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href={ROUTES.signup}
                className="landing-focus landing-btn-primary group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-[15px] font-semibold"
              >
                Start for free
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href={ROUTES.contacts}
                className="landing-focus landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full border px-7 py-3 text-[15px] font-semibold"
              >
                Book a demo
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex justify-center lg:col-span-5 lg:justify-end xl:col-span-6"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroProductStage />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
