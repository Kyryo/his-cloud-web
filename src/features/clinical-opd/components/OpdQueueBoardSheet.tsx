"use client";

import Link from "next/link";

import { UserIdenticon } from "@/components/UserIdenticon";
import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OpdEncounterStatusBadge } from "@/features/clinical-opd/components/OpdEncounterStatusBadge";
import { OpdQueueStageBadge } from "@/features/clinical-opd/components/OpdQueueStageBadge";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatOpdEncounterPaymentLabel } from "@/features/clinical-opd/utils/format-opd-encounter-payment";
import {
  formatAllergySeverity,
  formatOpdQueueClientMeta,
  formatOpdQueueDateTime,
  formatQueueVitalsSnapshot,
  formatWaitingMinutes,
  resolveOpdQueueStage,
} from "@/features/clinical-opd/utils/opd-queue-stage";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type OpdQueueBoardSheetProps = {
  encounter: OpdQueueEncounter | null;
  href: string | null;
  onOpenChange: (open: boolean) => void;
};

export function OpdQueueBoardSheet({
  encounter,
  href,
  onOpenChange,
}: OpdQueueBoardSheetProps) {
  const meta = encounter ? formatOpdQueueClientMeta(encounter) : "";
  const facts = encounter ? buildFacts(encounter) : [];

  return (
    <Sheet open={encounter !== null} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          appFont.className,
          "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
        )}
        data-testid="opd-queue-board-sheet"
      >
        <SheetHeader className="border-b border-dash-border/70 px-5 py-5 pr-12 text-left">
          <div className="flex items-start gap-3">
            {encounter ? (
              <UserIdenticon
                seed={encounter.customer_uuid || encounter.customer_name}
                name={encounter.customer_name}
                className="size-10 shrink-0 rounded-full"
              />
            ) : null}
            <div className="min-w-0">
              <SheetTitle className="truncate text-base">
                {encounter?.customer_name ?? "Encounter"}
              </SheetTitle>
              <SheetDescription className="truncate">
                {meta || "Queue details"}
              </SheetDescription>
            </div>
          </div>
          {encounter ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <OpdQueueStageBadge stage={resolveOpdQueueStage(encounter)} />
              <OpdEncounterStatusBadge status={encounter.status} />
            </div>
          ) : null}
        </SheetHeader>

        <dl className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-dash-border/60 py-3 last:border-b-0"
            >
              <dt className="text-[13px] text-dash-muted">{fact.label}</dt>
              <dd className="text-[13px] text-brand-navy">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {href ? (
          <div className="border-t border-dash-border/70 px-5 py-4">
            <PrimaryButton asChild className="w-full rounded-full">
              <Link href={href}>Open encounter</Link>
            </PrimaryButton>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function buildFacts(encounter: OpdQueueEncounter) {
  const vitals = formatQueueVitalsSnapshot(encounter.latest_vitals);
  const allergies = formatAllergySeverity(
    encounter.highest_allergy_severity,
    encounter.allergy_count,
  );

  return [
    { label: "Wait", value: formatWaitingMinutes(encounter.waiting_minutes) },
    { label: "Arrived", value: formatOpdQueueDateTime(encounter) },
    { label: "Department", value: encounter.department_name || "—" },
    { label: "Clinic", value: encounter.clinic_name?.trim() || "—" },
    { label: "Payment", value: formatOpdEncounterPaymentLabel(encounter) },
    { label: "Vitals", value: vitals },
    { label: "Allergies", value: allergies },
  ];
}
