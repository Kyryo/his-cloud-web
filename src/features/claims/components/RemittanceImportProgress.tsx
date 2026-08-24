"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { RemittanceBatch } from "@/features/claims/types/remittances.types";
import { remittanceDisplayName } from "@/features/claims/utils/remittance-display";
import { cn } from "@/lib/utils";

type RemittanceImportProgressProps = {
  batch: RemittanceBatch;
  className?: string;
};

const STAGES = [
  { id: "queued", label: "Queued for processing" },
  { id: "parsing", label: "Parsing remittance file" },
  { id: "matching", label: "Matching claims" },
  { id: "finalizing", label: "Finalizing import" },
] as const;

function stageIndexForStatus(status: RemittanceBatch["status"]): number {
  if (status === "queued") {
    return 0;
  }
  if (status === "processing") {
    return 1;
  }
  return 3;
}

export function RemittanceImportProgress({
  batch,
  className,
}: RemittanceImportProgressProps) {
  const baseStage = stageIndexForStatus(batch.status);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 900);
    return () => window.clearInterval(timer);
  }, [batch.id, batch.status]);

  const activeStage = useMemo(() => {
    if (batch.status === "processing") {
      // Softly advance through parsing → matching while the worker runs.
      return Math.min(2, baseStage + Math.floor(tick / 4));
    }
    return baseStage;
  }, [baseStage, batch.status, tick]);

  const progress = useMemo(() => {
    const floors = [12, 38, 62, 88];
    const floor = floors[activeStage] ?? 12;
    const pulse = Math.min(8, tick % 9);
    return Math.min(92, floor + pulse);
  }, [activeStage, tick]);

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-brand-border bg-gradient-to-b from-slate-50/80 to-white px-6 py-14 text-center",
        className,
      )}
      data-testid="remittance-import-progress"
    >
      <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-brand-border">
        <FileUp className="size-7 text-brand-primary" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        </span>
      </div>

      <h2 className="text-lg font-semibold text-brand-navy">
        Importing remittance
      </h2>
      <p className="mt-1 max-w-md text-sm text-brand-muted">
        We’re processing{" "}
        <span className="font-medium text-brand-navy">
          {remittanceDisplayName(batch)}
        </span>
        . Line items will appear here when parsing and matching finish.
      </p>

      <div className="mt-8 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between text-xs text-brand-muted">
          <span>{STAGES[activeStage]?.label ?? "Processing"}</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      <ol className="mt-8 grid w-full max-w-md gap-2 text-left sm:grid-cols-2">
        {STAGES.map((stage, index) => {
          const isDone = index < activeStage;
          const isCurrent = index === activeStage;
          return (
            <li
              key={stage.id}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-xs",
                isCurrent
                  ? "border-brand-primary/30 bg-brand-primary/5 text-brand-navy"
                  : isDone
                    ? "border-brand-border bg-white text-brand-slate"
                    : "border-transparent bg-transparent text-brand-muted",
              )}
            >
              <span className="font-medium">
                {isDone ? "Done" : isCurrent ? "In progress" : "Waiting"}
              </span>
              <span className="mt-0.5 block">{stage.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
