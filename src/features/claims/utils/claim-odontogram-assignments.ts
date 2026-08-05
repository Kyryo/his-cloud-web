import type { ClaimLineItem } from "@/features/claims/types/claims.types";

export type LineTeethAssignment = {
  lineId: number;
  toothNumbers: number[];
};

export function getLineToothNumbers(line: ClaimLineItem): number[] {
  return (line.dental ?? [])
    .map((row) => row.tooth_number)
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
}

/**
 * Assign teeth to a target claim line.
 * - `add`: union onto the target; remove those teeth from other lines.
 * - `replace`: target becomes exactly `toothNumbers`; other lines are cleared.
 */
export function computeLineTeethAssignments(params: {
  lines: Array<{ id: number; toothNumbers: number[] }>;
  targetLineId: number;
  toothNumbers: number[];
  mode: "add" | "replace";
}): LineTeethAssignment[] {
  const assigned = [...new Set(params.toothNumbers)]
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  const assignedSet = new Set(assigned);

  return params.lines.map((line) => {
    if (line.id === params.targetLineId) {
      if (params.mode === "replace") {
        return { lineId: line.id, toothNumbers: assigned };
      }
      return {
        lineId: line.id,
        toothNumbers: [...new Set([...line.toothNumbers, ...assigned])].sort(
          (a, b) => a - b,
        ),
      };
    }
    if (params.mode === "replace") {
      return { lineId: line.id, toothNumbers: [] };
    }
    return {
      lineId: line.id,
      toothNumbers: line.toothNumbers.filter((n) => !assignedSet.has(n)),
    };
  });
}

export function lineTeethChanged(
  before: number[],
  after: number[],
): boolean {
  return before.join(",") !== after.join(",");
}
