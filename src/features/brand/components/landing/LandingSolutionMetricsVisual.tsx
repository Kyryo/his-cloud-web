"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type MetricCard = {
  label: string;
  value: string;
  detail: string;
  trend?: {
    direction: "up" | "down";
    /** Positive outcome? down is good for time-to-resolution */
    favorable: boolean;
    text: string;
  };
  className: string;
  zIndex: number;
};

const METRICS: MetricCard[] = [
  {
    label: "Claims submitted",
    value: "1,204",
    detail: "this month",
    trend: { direction: "up", favorable: true, text: "12%" },
    className: "left-[4%] top-[8%] sm:left-[6%] sm:top-[10%] lg:left-[2%] lg:top-[6%]",
    zIndex: 30,
  },
  {
    label: "Payment matched",
    value: "MWK 2.4M",
    detail: "matched automatically",
    trend: { direction: "up", favorable: true, text: "89%" },
    className:
      "right-[2%] top-[28%] sm:right-[4%] sm:top-[30%] lg:right-[0%] lg:top-[26%]",
    zIndex: 40,
  },
  {
    label: "Time to resolution",
    value: "2 days",
    detail: "avg · was 11",
    trend: { direction: "down", favorable: true, text: "9 days" },
    className:
      "bottom-[6%] left-[12%] sm:bottom-[8%] sm:left-[14%] lg:bottom-[4%] lg:left-[10%]",
    zIndex: 20,
  },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Soft, unreadable product surface — texture only, no data. */
function GhostAppSurface() {
  return (
    <div
      className="absolute inset-3 overflow-hidden rounded-[18px] border sm:inset-4"
      style={{
        borderColor: "color-mix(in srgb, var(--color-brand-border) 70%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--color-brand-tint) 55%, white)",
      }}
      aria-hidden="true"
    >
      <div
        className="h-9 border-b"
        style={{ borderColor: "var(--color-brand-border)" }}
      >
        <div className="flex h-full items-center gap-2 px-4">
          <span
            className="h-2 w-16 rounded-full"
            style={{ backgroundColor: "var(--color-brand-muted)", opacity: 0.35 }}
          />
          <span
            className="h-2 w-10 rounded-full"
            style={{ backgroundColor: "var(--color-brand-muted)", opacity: 0.22 }}
          />
        </div>
      </div>
      <div className="grid h-[calc(100%-2.25rem)] grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr]">
        <div
          className="border-r p-3"
          style={{ borderColor: "var(--color-brand-border)" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-2.5 h-2 rounded-full"
              style={{
                width: `${55 + (i % 3) * 12}%`,
                backgroundColor: "var(--color-brand-muted)",
                opacity: 0.2,
              }}
            />
          ))}
        </div>
        <div className="p-3 sm:p-4">
          <div className="mb-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor: "var(--color-brand-muted)",
                  opacity: 0.18 + i * 0.02,
                }}
              />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, row) => (
            <div key={row} className="mb-2.5 flex gap-2">
              {Array.from({ length: 4 }).map((_, col) => (
                <span
                  key={col}
                  className="h-2.5 flex-1 rounded-sm"
                  style={{
                    backgroundColor:
                      col === 0
                        ? "var(--color-brand-sky)"
                        : "var(--color-brand-muted)",
                    opacity: col === 0 ? 0.12 : 0.14 + ((row + col) % 3) * 0.03,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricStatCard({
  metric,
  index,
  reduceMotion,
}: {
  metric: MetricCard;
  index: number;
  reduceMotion: boolean | null;
}) {
  const TrendIcon =
    metric.trend?.direction === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor = metric.trend?.favorable
    ? "text-emerald-600"
    : "text-red-600";

  return (
    <motion.article
      className={cn(
        "absolute w-[min(100%,17.5rem)] rounded-[14px] border bg-white p-4 sm:w-[18.5rem] sm:p-5",
        "shadow-[0_10px_30px_-8px_rgba(15,23,42,0.14),0_4px_12px_-4px_rgba(15,23,42,0.08)]",
        metric.className,
      )}
      style={{
        borderColor: "var(--color-brand-border)",
        zIndex: metric.zIndex,
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: 0.55,
        delay: reduceMotion ? 0 : index * 0.15,
        ease: easeOut,
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--color-brand-muted)" }}
      >
        {metric.label}
      </p>
      <div className="mt-2 flex items-end gap-2">
        <p
          className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
          style={{ color: "var(--color-brand-navy)" }}
        >
          {metric.value}
        </p>
        {metric.trend ? (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-0.5 text-xs font-semibold",
              trendColor,
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {metric.trend.text}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--color-brand-slate)" }}>
        {metric.detail}
      </p>
    </motion.article>
  );
}

export function LandingSolutionMetricsVisual({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative isolate min-h-[340px] w-full overflow-hidden rounded-[22px] sm:min-h-[400px] lg:min-h-[440px]",
        className,
      )}
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-brand-tint) 40%, white)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 scale-[1.02] opacity-[0.13] blur-[1.5px]">
        <GhostAppSurface />
      </div>

      {METRICS.map((metric, index) => (
        <MetricStatCard
          key={metric.label}
          metric={metric}
          index={index}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}
