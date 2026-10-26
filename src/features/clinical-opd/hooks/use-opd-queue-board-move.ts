"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import { createNursingNote } from "@/features/clinical-opd/services/clinical-opd.service";
import type {
  OpdQueueEncounter,
  OpdQueueStage,
} from "@/features/clinical-opd/types/clinical-opd.types";
import {
  getOpdBoardMove,
  opdQueueBoardSignature,
  withOpdQueueStage,
} from "@/features/clinical-opd/utils/opd-queue-board";
import { OPD_QUEUE_STAGE_LABELS, resolveOpdQueueStage } from "@/features/clinical-opd/utils/opd-queue-stage";
import { CLINICAL_QUEUE_QUERY_ROOT } from "@/features/clinical-workspace/hooks/use-clinical-departments";
import { runVisitEncounterAction } from "@/features/visits/services/visits.service";
import { useToast } from "@/providers/toast-provider";

export type PendingOpdBoardMove = {
  encounter: OpdQueueEncounter;
  stage: "triaged" | "cancelled";
};

function stageLabel(stage: OpdQueueStage) {
  return OPD_QUEUE_STAGE_LABELS[stage];
}

export function useOpdQueueBoardMove(encounters: OpdQueueEncounter[]) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const signature = opdQueueBoardSignature(encounters);
  const [serverSignature, setServerSignature] = useState(signature);
  const [rows, setRows] = useState(encounters);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingOpdBoardMove | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const movingRef = useRef<string | null>(null);

  if (signature !== serverSignature) {
    setServerSignature(signature);
    if (!movingId) {
      setRows(encounters);
    } else {
      const optimistic = rows.find((item) => item.encounter_uuid === movingId);
      setRows(
        optimistic
          ? encounters.map((item) =>
              item.encounter_uuid === movingId
                ? {
                    ...item,
                    queue_stage: optimistic.queue_stage,
                    status: optimistic.status,
                    triaged_at: optimistic.triaged_at,
                    started_at: optimistic.started_at,
                  }
                : item,
            )
          : encounters,
      );
    }
  }

  const commitMove = useCallback(
    async (
      encounter: OpdQueueEncounter,
      stage: OpdQueueStage,
      note?: string,
    ) => {
      const from = resolveOpdQueueStage(encounter);
      const move = getOpdBoardMove(from, stage);
      if (!move || movingRef.current) {
        return false;
      }

      let snapshot: OpdQueueEncounter[] = [];
      movingRef.current = encounter.encounter_uuid;
      setMovingId(encounter.encounter_uuid);
      setRows((current) => {
        snapshot = current;
        return current.map((item) =>
          item.encounter_uuid === encounter.encounter_uuid
            ? withOpdQueueStage(item, stage)
            : item,
        );
      });

      try {
        if (move.kind === "ready") {
          const body = note?.trim() ?? "";
          if (!body) {
            throw new Error("Add a note before marking this encounter ready.");
          }
          await createNursingNote(encounter.visit_uuid, encounter.encounter_uuid, {
            body,
          });
        } else {
          await runVisitEncounterAction(
            encounter.visit_uuid,
            encounter.encounter_uuid,
            move.action,
          );
        }

        await queryClient.invalidateQueries({
          queryKey: [CLINICAL_QUEUE_QUERY_ROOT],
        });
        toast({
          variant: "success",
          title: "Queue updated",
          description: `${encounter.customer_name} is now ${stageLabel(stage).toLowerCase()}.`,
        });
        return true;
      } catch (error) {
        setRows(snapshot);
        toast({
          variant: "error",
          title: "Could not update the queue",
          description: error instanceof Error ? error.message : "Try again.",
        });
        return false;
      } finally {
        movingRef.current = null;
        setMovingId(null);
      }
    },
    [queryClient, toast],
  );

  const requestMove = useCallback(
    (encounter: OpdQueueEncounter, stage: OpdQueueStage) => {
      const move = getOpdBoardMove(resolveOpdQueueStage(encounter), stage);
      if (!move || movingRef.current) {
        return;
      }

      if (move.kind === "ready") {
        setPending({ encounter, stage: "triaged" });
        return;
      }

      if (move.action === "cancel") {
        setPending({ encounter, stage: "cancelled" });
        return;
      }

      void commitMove(encounter, stage);
    },
    [commitMove],
  );

  const dismissPending = useCallback(() => {
    if (isConfirming) {
      return;
    }
    setPending(null);
  }, [isConfirming]);

  const confirmPending = useCallback(
    async (note?: string) => {
      if (!pending) {
        return;
      }

      setIsConfirming(true);
      const saved = await commitMove(pending.encounter, pending.stage, note);
      setIsConfirming(false);
      if (saved) {
        setPending(null);
      }
    },
    [commitMove, pending],
  );

  return {
    rows,
    movingId,
    pending,
    isConfirming,
    requestMove,
    dismissPending,
    confirmPending,
  };
}
