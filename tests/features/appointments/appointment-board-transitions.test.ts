import { describe, expect, it } from "vitest";

import {
  canDropOnBoardColumn,
  getBoardMoveAction,
} from "@/features/appointments/utils/appointment-board-transitions";

describe("appointment board transitions", () => {
  it("maps scheduled drops to the matching clinic actions", () => {
    expect(getBoardMoveAction("scheduled", "confirmed")).toBe("confirm");
    expect(getBoardMoveAction("scheduled", "in_progress")).toBe("start");
    expect(getBoardMoveAction("scheduled", "cancelled")).toBe("cancel");
    expect(getBoardMoveAction("scheduled", "no_show")).toBe("no-show");
    expect(getBoardMoveAction("scheduled", "completed")).toBeNull();
  });

  it("blocks drops on terminal columns", () => {
    expect(canDropOnBoardColumn("completed", "scheduled")).toBe(false);
    expect(canDropOnBoardColumn("cancelled", "confirmed")).toBe(false);
    expect(canDropOnBoardColumn("scheduled", "scheduled")).toBe(true);
    expect(canDropOnBoardColumn("confirmed", "in_progress")).toBe(true);
  });
});
