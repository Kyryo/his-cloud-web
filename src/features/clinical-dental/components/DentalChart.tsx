"use client";

import { useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";

import type { DentalChartFinding } from "@/features/clinical-dental/types/clinical-dental.types";
import { dentalArches, toothName } from "@/features/clinical-dental/utils/dental-arches";
import {
  DENTAL_CONDITIONS,
  DENTAL_CONDITION_META,
  conditionLabel,
  formatSurfaces,
  groupFindingsByTooth,
  primaryConditionFor,
} from "@/features/clinical-dental/utils/dental-conditions";
import type { DentitionMode } from "@/features/dental/lib/dental-dentition";
import { cn } from "@/lib/utils";

type DentalChartProps = {
  findings: readonly DentalChartFinding[];
  mode: DentitionMode;
  onModeChange: (mode: DentitionMode) => void;
  selectedTooth: number | null;
  onSelectTooth: (toothNumber: number) => void;
};

const ARCH_LABELS = { upper: "Upper arch", lower: "Lower arch" } as const;

/** FDI odontogram: one keyboard-accessible button per tooth. */
export function DentalChart({
  findings,
  mode,
  onModeChange,
  selectedTooth,
  onSelectTooth,
}: DentalChartProps) {
  const arches = useMemo(() => dentalArches(mode), [mode]);
  const byTooth = useMemo(() => groupFindingsByTooth(findings), [findings]);
  const toothRefs = useRef(new Map<number, HTMLButtonElement>());

  function focusTooth(toothNumber: number | undefined) {
    if (toothNumber !== undefined) {
      toothRefs.current.get(toothNumber)?.focus();
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    row: "upper" | "lower",
    index: number,
  ) {
    const teeth = arches[row];
    const otherRow = row === "upper" ? arches.lower : arches.upper;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTooth(teeth[Math.min(index + 1, teeth.length - 1)]);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTooth(teeth[Math.max(index - 1, 0)]);
        break;
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        focusTooth(otherRow[Math.min(index, otherRow.length - 1)]);
        break;
      case "Home":
        event.preventDefault();
        focusTooth(teeth[0]);
        break;
      case "End":
        event.preventDefault();
        focusTooth(teeth[teeth.length - 1]);
        break;
      default:
        break;
    }
  }

  return (
    <div className="space-y-4" data-testid="dental-chart">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex overflow-hidden rounded-lg border border-dash-border bg-white"
          role="group"
          aria-label="Dentition"
        >
          {(["adult", "children"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => onModeChange(option)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                mode === option
                  ? "bg-brand-primary text-white"
                  : "text-brand-slate hover:bg-slate-50",
              )}
              data-testid={`dental-chart-mode-${option}`}
            >
              {option === "adult" ? "Permanent" : "Primary"}
            </button>
          ))}
        </div>
        <p className="text-xs text-brand-muted">
          FDI numbering, viewed facing the patient.
        </p>
      </div>

      {(["upper", "lower"] as const).map((row) => (
        <div key={row} className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
            {ARCH_LABELS[row]}
          </p>
          <div
            className={cn(
              "grid gap-1.5",
              mode === "children" ? "grid-cols-10" : "grid-cols-8 sm:grid-cols-16",
            )}
            role="group"
            aria-label={ARCH_LABELS[row]}
          >
            {arches[row].map((toothNumber, index) => {
              const toothFindings = byTooth.get(toothNumber) ?? [];
              const condition = primaryConditionFor(toothFindings);
              const surfaces = [
                ...new Set(toothFindings.flatMap((finding) => finding.surfaces)),
              ];
              const conditionNames = [
                ...new Set(toothFindings.map((finding) => conditionLabel(finding.condition))),
              ];
              const isSelected = selectedTooth === toothNumber;
              const isMidline = index === arches[row].length / 2;
              return (
                <button
                  key={toothNumber}
                  ref={(element) => {
                    if (element) {
                      toothRefs.current.set(toothNumber, element);
                    } else {
                      toothRefs.current.delete(toothNumber);
                    }
                  }}
                  type="button"
                  onClick={() => onSelectTooth(toothNumber)}
                  onKeyDown={(event) => handleKeyDown(event, row, index)}
                  aria-pressed={isSelected}
                  aria-label={`${toothName(toothNumber)} (${toothNumber})${
                    conditionNames.length > 0 ? `: ${conditionNames.join(", ")}` : ": sound"
                  }`}
                  title={toothName(toothNumber)}
                  className={cn(
                    "flex aspect-[3/4] min-h-12 flex-col items-center justify-between rounded-md border px-0.5 py-1 text-[11px] font-semibold tabular-nums outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1",
                    condition
                      ? DENTAL_CONDITION_META[condition].swatchClassName
                      : "border-dash-border bg-white text-brand-navy hover:bg-slate-50",
                    condition ? "border-transparent" : null,
                    isSelected ? "ring-2 ring-brand-navy ring-offset-1" : null,
                    isMidline ? "sm:ml-2" : null,
                  )}
                  data-testid={`dental-tooth-${toothNumber}`}
                  data-condition={condition ?? "sound"}
                >
                  <span>{toothNumber}</span>
                  <span className="text-[9px] font-medium leading-none opacity-90">
                    {formatSurfaces(surfaces)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <ul
        className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-dash-border/70 pt-3"
        aria-label="Chart legend"
        data-testid="dental-chart-legend"
      >
        {DENTAL_CONDITIONS.map((condition) => (
          <li key={condition} className="inline-flex items-center gap-1.5 text-xs text-brand-slate">
            <span
              className={cn(
                "inline-block size-3 rounded-sm",
                DENTAL_CONDITION_META[condition].swatchClassName,
              )}
              aria-hidden="true"
            />
            {DENTAL_CONDITION_META[condition].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
