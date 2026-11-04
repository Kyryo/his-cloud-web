"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { OhPanelSection } from "@/features/occupational-health/components/OhEncounterColumns";
import {
  fetchOhExaminationProcedures,
  patchOhExaminationProcedure,
} from "@/features/occupational-health/services/oh.service";
import type { OhExamination, OhProcedureRecord } from "@/features/occupational-health/types";
import { useToast } from "@/providers/toast-provider";

type OhProcedureChecklistPanelProps = {
  examination: OhExamination | null;
  onChanged?: () => void;
};

export function OhProcedureChecklistPanel({
  examination,
  onChanged,
}: OhProcedureChecklistPanelProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<OhProcedureRecord[]>([]);
  const [complete, setComplete] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [busyUuid, setBusyUuid] = useState<string | null>(null);

  const examinationUuid = examination?.uuid ?? null;

  useEffect(() => {
    if (!examinationUuid) {
      setRows([]);
      setComplete(true);
      return;
    }
    const uuid = examinationUuid;
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const payload = await fetchOhExaminationProcedures(uuid);
        if (active) {
          setRows(payload.results);
          setComplete(payload.checklist_complete);
        }
      } catch (error) {
        if (active) {
          toast({
            variant: "error",
            title: "Could not load procedure checklist",
            description: error instanceof Error ? error.message : undefined,
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [examinationUuid, toast]);

  if (!examinationUuid) {
    return null;
  }

  const uuid = examinationUuid;

  if (isLoading) {
    return (
      <OhPanelSection description="Procedure checklist">
        <p className="text-sm text-brand-muted">Loading checklist…</p>
      </OhPanelSection>
    );
  }

  if (rows.length === 0) {
    return null;
  }

  async function markStatus(record: OhProcedureRecord, status: string) {
    setBusyUuid(record.uuid);
    try {
      const payload = await patchOhExaminationProcedure(uuid, record.uuid, {
        status,
      });
      setRows((current) =>
        current.map((row) =>
          row.uuid === payload.record.uuid ? payload.record : row,
        ),
      );
      setComplete(payload.checklist_complete);
      onChanged?.();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update procedure",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusyUuid(null);
    }
  }

  return (
    <OhPanelSection description="Procedures required by the published programme matrix.">
      {!complete ? (
        <p
          className="mb-3 text-sm text-amber-800"
          data-testid="oh-checklist-incomplete"
        >
          Mandatory procedures are still outstanding.
        </p>
      ) : (
        <p className="mb-3 text-sm text-brand-muted" data-testid="oh-checklist-complete">
          Mandatory procedures are complete.
        </p>
      )}
      <ul className="divide-y divide-brand-border" data-testid="oh-procedure-checklist">
        {rows.map((row) => (
          <li
            key={row.uuid}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-navy">
                {row.procedure_code}
              </p>
              <p className="text-xs text-slate-400">
                {row.requirement} · {row.status}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {row.status !== "performed" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busyUuid === row.uuid}
                  onClick={() => void markStatus(row, "performed")}
                >
                  Mark performed
                </Button>
              ) : null}
              {row.status !== "waived" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busyUuid === row.uuid}
                  onClick={() => void markStatus(row, "waived")}
                >
                  Waive
                </Button>
              ) : null}
              {row.status !== "outstanding" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busyUuid === row.uuid}
                  onClick={() => void markStatus(row, "outstanding")}
                >
                  Reset
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </OhPanelSection>
  );
}
