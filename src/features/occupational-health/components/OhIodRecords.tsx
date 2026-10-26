"use client";

import { useState } from "react";
import { HardHat } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import {
  OhPanelSection,
  OhRecordItem,
  OhRecordList,
  OhRecordsEmpty,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import type { IodCase } from "@/features/occupational-health/types";
import { downloadIodStatutoryPack } from "@/features/occupational-health/services/oh.service";
import {
  formatOhDate,
  humanizeOhCode,
  newestFirst,
} from "@/features/occupational-health/utils/oh-format";
import { useToast } from "@/providers/toast-provider";

type OhIodRecordsProps = {
  iodCases: IodCase[];
};

function describeIodCase(item: IodCase): string {
  return [
    `Onset ${formatOhDate(item.onset_date)}`,
    item.safety_classification ? humanizeOhCode(item.safety_classification) : null,
    item.she_reference ? `SHE ${item.she_reference}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function OhIodRecords({ iodCases }: OhIodRecordsProps) {
  const { toast } = useToast();
  const [downloadingUuid, setDownloadingUuid] = useState<string | null>(null);

  async function handleStatutoryPack(caseUuid: string) {
    setDownloadingUuid(caseUuid);
    try {
      const { blob, filename } = await downloadIodStatutoryPack(caseUuid);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ variant: "success", title: "Statutory pack downloaded" });
    } catch (error) {
      toast({
        title: "Could not load statutory pack",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setDownloadingUuid(null);
    }
  }

  if (iodCases.length === 0) {
    return (
      <OhRecordsEmpty
        icon={HardHat}
        title="No injury on duty cases"
        description="If this attendance follows a workplace incident, open an IOD case on the left to start the statutory record."
        data-testid="oh-iod-records-empty"
      />
    );
  }

  return (
    <OhPanelSection>
      <OhRecordList data-testid="oh-iod-records">
        {newestFirst(iodCases, (item) => item.onset_date).map((item) => {
          const injury = [item.mechanism, item.body_part, item.incident_location]
            .filter(Boolean)
            .join(" · ");
          const isDownloading = downloadingUuid === item.uuid;

          return (
            <OhRecordItem
              key={item.uuid}
              title="IOD case"
              badges={
                <>
                  <OhStatusChip value={item.severity} />
                  <OhStatusChip value={item.status} />
                </>
              }
              meta={describeIodCase(item)}
              action={
                <SecondaryButton
                  type="button"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  disabled={isDownloading}
                  onClick={() => void handleStatutoryPack(item.uuid)}
                >
                  {isDownloading ? "Loading…" : "Statutory pack"}
                </SecondaryButton>
              }
            >
              {injury ? <p className="text-brand-muted">{injury}</p> : null}
              <p>{item.description}</p>
            </OhRecordItem>
          );
        })}
      </OhRecordList>
    </OhPanelSection>
  );
}
