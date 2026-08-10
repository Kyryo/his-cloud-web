"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

/**
 * Smooth upward curve — viewBox 0 0 400 220.
 * Peak sits near the right third so the callout has room.
 */
const LINE_PATH =
  "M24 168 C72 164, 108 148, 148 128 C188 108, 216 118, 256 78 C288 52, 320 44, 376 36";

const AREA_PATH = `${LINE_PATH} L376 220 L24 220 Z`;

export function LandingRevenueMetricsVisual({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "relative isolate flex min-h-[300px] w-full items-end overflow-hidden sm:min-h-[360px] lg:min-h-[400px]",
        className,
      )}
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-brand-tint) 28%, white)",
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: easeOut }}
    >
      {/* Stat callout — sits near the curve peak */}
      <motion.div
        className="absolute right-[10%] top-[16%] z-20 sm:right-[12%] sm:top-[18%]"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, delay: 0.2, ease: easeOut }}
      >
        <div className="flex items-baseline gap-1.5">
          <p
            className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
            style={{ color: "var(--color-brand-navy)" }}
          >
            MWK 3.1M
          </p>
          <span className="inline-flex items-center text-sm font-semibold text-emerald-600">
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            6%
          </span>
        </div>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--color-brand-muted)" }}
        >
          Payments received
        </p>
      </motion.div>

      {/* Hero area/line chart */}
      <motion.div
        className="relative z-10 w-full px-2 pb-8 pt-16 sm:px-4 sm:pb-10 sm:pt-20"
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <svg
          viewBox="0 0 400 220"
          className="h-auto w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="sigma-revenue-area"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--color-brand-primary)"
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor="var(--color-brand-primary)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path d={AREA_PATH} fill="url(#sigma-revenue-area)" />
          <path
            d={LINE_PATH}
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Peak marker */}
          <circle
            cx="376"
            cy="36"
            r="4"
            fill="var(--color-brand-primary)"
          />
          <circle
            cx="376"
            cy="36"
            r="8"
            fill="var(--color-brand-primary)"
            opacity="0.16"
          />
        </svg>
      </motion.div>

      <p
        className="absolute bottom-5 left-6 z-20 text-[11px] font-medium tracking-wide sm:bottom-6 sm:left-7"
        style={{ color: "var(--color-brand-muted)" }}
      >
        Jan–Dec 2026
      </p>
    </motion.div>
  );
}
