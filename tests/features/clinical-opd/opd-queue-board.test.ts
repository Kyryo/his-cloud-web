import { describe, expect, it } from "vitest";

import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  canDropOnOpdBoardColumn,
  getOpdBoardMove,
  groupOpdQueueForBoard,
  isEarlierOpdBoardStage,
  withOpdQueueStage,
} from "@/features/clinical-opd/utils/opd-queue-board";

const ENCOUNTER: OpdQueueEncounter = {
  encounter_uuid: "enc-1",
  visit_uuid: "visit-1",
  visit_status: "active",
  customer_uuid: "cust-1",
  customer_name: "Jane Doe",
  department_name: "OPD",
  status: "waiting",
  started_at: null,
  mode_of_payment: "cash",
  insurance_scheme_name: null,
  queue_stage: "registered",
};

describe("opd queue board", () => {
  it("allows the live queue moves and blocks closed cards", () => {
    expect(getOpdBoardMove("registered", "triaged")).toEqual({ kind: "ready" });
    expect(getOpdBoardMove("registered", "with_clinician")).toEqual({
      kind: "encounter",
      action: "start",
    });
    expect(getOpdBoardMove("triaged", "completed")?.kind).toBe("encounter");
    expect(getOpdBoardMove("with_clinician", "cancelled")).toEqual({
      kind: "encounter",
      action: "cancel",
    });
    expect(getOpdBoardMove("completed", "registered")).toBeNull();
    expect(getOpdBoardMove("with_clinician", "triaged")).toBeNull();
    expect(canDropOnOpdBoardColumn("registered", "registered")).toBe(true);
    expect(canDropOnOpdBoardColumn("cancelled", "with_clinician")).toBe(false);
    expect(isEarlierOpdBoardStage("with_clinician", "registered")).toBe(true);
    expect(isEarlierOpdBoardStage("with_clinician", "triaged")).toBe(true);
    expect(isEarlierOpdBoardStage("registered", "with_clinician")).toBe(false);
    expect(isEarlierOpdBoardStage("triaged", "cancelled")).toBe(false);
    expect(canDropOnOpdBoardColumn("with_clinician", "triaged")).toBe(false);
  });

  it("groups every stage and patches the encounter for the target column", () => {
    const columns = groupOpdQueueForBoard([ENCOUNTER]);
    expect(columns.map((column) => column.stage)).toEqual([
      "registered",
      "triaged",
      "with_clinician",
      "completed",
      "cancelled",
    ]);
    expect(columns[0]?.encounters).toHaveLength(1);
    expect(columns[1]?.label).toBe("Ready");

    const started = withOpdQueueStage(ENCOUNTER, "with_clinician");
    expect(started.status).toBe("in_progress");
    expect(started.queue_stage).toBe("with_clinician");
    expect(started.started_at).toEqual(expect.any(String));
  });
});
