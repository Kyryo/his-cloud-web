"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check, ChevronDown } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllToothNumbersForSystem,
  type ToothNumberingSystem,
} from "@/features/dental/lib/dental-tooth-validation";
import { ExpandableToothNumbersSummary } from "@/features/dental/components/ExpandableToothNumbersSummary";
import { cn } from "@/lib/utils";
import "react-odontogram/style.css";
import "./claim-line-odontogram-picker.css";

const Odontogram = dynamic(
  () => import("react-odontogram").then((mod) => mod.Odontogram),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2 rounded-lg p-2" aria-busy="true">
        <Skeleton className="mx-auto h-3 w-28" />
        <Skeleton className="mx-auto size-[220px] rounded-full" />
      </div>
    ),
  },
);

const NUMBERING_OPTIONS: Array<{
  value: ToothNumberingSystem;
  label: string;
}> = [
  { value: "fdi", label: "FDI" },
  { value: "universal", label: "Universal" },
  { value: "palmer", label: "Palmer" },
];

const BRAND_ODONTOGRAM_COLORS = {
  darkBlue: "#0b6e6e",
  baseBlue: "#8aaca9",
  lightBlue: "#9fd4d4",
} as const;

type ToothNotations = {
  fdi: string;
  universal: string;
  palmer: string;
};

type OdontogramToothDetail = {
  id: string;
  notations: ToothNotations;
  type: string;
};

/** Claim teeth are always stored as FDI numbers. */
function toDefaultSelected(fdiToothNumbers: number[]): string[] {
  return fdiToothNumbers
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => `teeth-${n}`);
}

function odontogramNotationProp(
  numberingSystem: ToothNumberingSystem,
): "FDI" | "Universal" | "Palmer" {
  switch (numberingSystem) {
    case "universal":
      return "Universal";
    case "palmer":
      return "Palmer";
    default:
      return "FDI";
  }
}

export function getPermanentFdiToothNumbers(): number[] {
  return getAllToothNumbersForSystem("fdi")
    .map(Number)
    .filter((n) => n >= 11 && n <= 48)
    .sort((a, b) => a - b);
}

export type ClaimLineOdontogramPickerProps = {
  /** Currently assigned teeth as FDI numbers (union across claim lines). */
  value: number[];
  /** Fired when the user newly selects teeth on the chart (FDI). */
  onRequestAssign: (toothNumbers: number[]) => void;
  /** Fired when the user deselects teeth on the chart (FDI). */
  onRemoveTeeth: (toothNumbers: number[]) => void;
  disabled?: boolean;
  className?: string;
  /** Increment to force remount (e.g. after cancelling an assign dialog). */
  remountToken?: number | string;
  showSelectAll?: boolean;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
};

export function ClaimLineOdontogramPicker({
  value,
  onRequestAssign,
  onRemoveTeeth,
  disabled = false,
  className,
  remountToken = 0,
  showSelectAll = true,
  onSelectAll,
  onDeselectAll,
}: ClaimLineOdontogramPickerProps) {
  const [numberingSystem, setNumberingSystem] =
    useState<ToothNumberingSystem>("fdi");

  const committedRef = useRef(value);
  committedRef.current = value;

  const allTeethSelected = useMemo(() => {
    const all = getPermanentFdiToothNumbers();
    if (all.length === 0) return false;
    const selected = new Set(value);
    return all.every((tooth) => selected.has(tooth));
  }, [value]);

  const numberingLabel =
    NUMBERING_OPTIONS.find((option) => option.value === numberingSystem)
      ?.label ?? "FDI";

  const onRequestAssignRef = useRef(onRequestAssign);
  onRequestAssignRef.current = onRequestAssign;
  const onRemoveTeethRef = useRef(onRemoveTeeth);
  onRemoveTeethRef.current = onRemoveTeeth;

  /** Ignore library onChange during mount/remount sync (it can run while rendering). */
  const suppressChangeRef = useRef(true);

  const defaultSelected = useMemo(() => toDefaultSelected(value), [value]);
  const remountKey = `${numberingSystem}-${remountToken}-${defaultSelected.join(",") || "none"}`;

  useEffect(() => {
    suppressChangeRef.current = true;
    const frame = requestAnimationFrame(() => {
      suppressChangeRef.current = false;
    });
    return () => {
      cancelAnimationFrame(frame);
      suppressChangeRef.current = true;
    };
  }, [remountKey]);

  return (
    <div
      className={cn(
        "claim-line-odontogram-picker relative overflow-hidden rounded-lg border border-brand-border bg-white",
        className,
      )}
      aria-disabled={disabled || undefined}
    >
      {disabled ? (
        <div
          className="absolute inset-0 z-10 cursor-not-allowed bg-background/40"
          aria-hidden
        />
      ) : null}
      <div className="border-b border-brand-border bg-slate-50/80 px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-brand-muted">
            {disabled
              ? "Teeth assigned on this claim"
              : "Click a tooth to assign it to a claim line"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {showSelectAll &&
            !disabled &&
            (allTeethSelected ? onDeselectAll : onSelectAll) ? (
              <SecondaryButton
                type="button"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={allTeethSelected ? onDeselectAll : onSelectAll}
                data-testid={
                  allTeethSelected
                    ? "claim-odontogram-deselect-all"
                    : "claim-odontogram-select-all"
                }
              >
                {allTeethSelected ? "Deselect all" : "Select all"}
              </SecondaryButton>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SecondaryButton
                  type="button"
                  size="sm"
                  className="h-8 gap-1 px-2.5 text-xs"
                  disabled={disabled}
                  data-testid="claim-odontogram-numbering-trigger"
                >
                  {numberingLabel}
                  <ChevronDown className="size-3.5 opacity-70" aria-hidden />
                </SecondaryButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[9rem]"
                data-testid="claim-odontogram-numbering-menu"
              >
                {NUMBERING_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => setNumberingSystem(option.value)}
                    data-testid={`claim-odontogram-numbering-${option.value}`}
                  >
                    <Check
                      className={cn(
                        "size-3.5",
                        numberingSystem === option.value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                      aria-hidden
                    />
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-center px-2 py-2",
          disabled && "pointer-events-none select-none",
        )}
      >
        <div className="claim-odontogram-chart mx-auto w-full max-w-[240px]">
          <Odontogram
            key={remountKey}
            singleSelect={false}
            defaultSelected={defaultSelected}
            notation={odontogramNotationProp(numberingSystem)}
            theme="light"
            layout="circle"
            showTooltip={!disabled}
            tooltip={{ placement: "top", margin: 8 }}
            colors={BRAND_ODONTOGRAM_COLORS}
            selectedColor={BRAND_ODONTOGRAM_COLORS.darkBlue}
            hoverColor={BRAND_ODONTOGRAM_COLORS.baseBlue}
            className="mx-auto block w-full max-w-[240px]"
            styles={{
              width: "100%",
              maxWidth: "240px",
              height: "auto",
              margin: "0 auto",
            }}
            onChange={
              disabled
                ? undefined
                : (selected: OdontogramToothDetail[]) => {
                    if (suppressChangeRef.current) {
                      return;
                    }
                    const next = selected
                      .map((tooth) => Number(tooth.notations.fdi))
                      .filter((n) => Number.isFinite(n) && n > 0);
                    const uniqueNext = [...new Set(next)].sort((a, b) => a - b);
                    const current = committedRef.current;
                    const currentSet = new Set(current);
                    const nextSet = new Set(uniqueNext);
                    const added = uniqueNext.filter((n) => !currentSet.has(n));
                    const removed = current.filter((n) => !nextSet.has(n));
                    if (added.length === 0 && removed.length === 0) {
                      return;
                    }
                    // Defer: react-odontogram may invoke onChange while rendering.
                    queueMicrotask(() => {
                      if (suppressChangeRef.current) {
                        return;
                      }
                      if (removed.length > 0) {
                        onRemoveTeethRef.current(removed);
                      }
                      if (added.length > 0) {
                        onRequestAssignRef.current(added);
                      }
                    });
                  }
            }
          />
        </div>
      </div>
      <div className="border-t border-brand-border bg-slate-50/80 px-3 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
          Selected teeth
        </p>
        <div className="mt-1">
          <ExpandableToothNumbersSummary toothNumbers={value} />
        </div>
      </div>
    </div>
  );
}
