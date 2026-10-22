import type { DentitionMode } from "@/features/dental/lib/dental-dentition";

export type DentalArches = {
  /** Upper arch from the patient's right (18 or 55) to left (28 or 65). */
  upper: number[];
  /** Lower arch from the patient's right (48 or 85) to left (38 or 75). */
  lower: number[];
};

function quadrant(quadrantNumber: number, count: number, descending: boolean) {
  const teeth = Array.from(
    { length: count },
    (_, index) => quadrantNumber * 10 + index + 1,
  );
  return descending ? teeth.reverse() : teeth;
}

/** FDI teeth laid out as the clinician faces the patient. */
export function dentalArches(mode: DentitionMode): DentalArches {
  if (mode === "children") {
    return {
      upper: [...quadrant(5, 5, true), ...quadrant(6, 5, false)],
      lower: [...quadrant(8, 5, true), ...quadrant(7, 5, false)],
    };
  }
  return {
    upper: [...quadrant(1, 8, true), ...quadrant(2, 8, false)],
    lower: [...quadrant(4, 8, true), ...quadrant(3, 8, false)],
  };
}

const QUADRANT_NAMES: Record<number, string> = {
  1: "upper right",
  2: "upper left",
  3: "lower left",
  4: "lower right",
  5: "upper right",
  6: "upper left",
  7: "lower left",
  8: "lower right",
};

const PERMANENT_POSITION_NAMES: Record<number, string> = {
  1: "central incisor",
  2: "lateral incisor",
  3: "canine",
  4: "first premolar",
  5: "second premolar",
  6: "first molar",
  7: "second molar",
  8: "third molar",
};

const PRIMARY_POSITION_NAMES: Record<number, string> = {
  1: "central incisor",
  2: "lateral incisor",
  3: "canine",
  4: "first molar",
  5: "second molar",
};

/** "Lower left first molar" for 36; "Upper right primary canine" for 53. */
export function toothName(toothNumber: number): string {
  const quadrantNumber = Math.floor(toothNumber / 10);
  const position = toothNumber % 10;
  const isPrimary = quadrantNumber >= 5;
  const positionName = isPrimary
    ? PRIMARY_POSITION_NAMES[position]
    : PERMANENT_POSITION_NAMES[position];
  const quadrantName = QUADRANT_NAMES[quadrantNumber];
  if (!positionName || !quadrantName) {
    return `Tooth ${toothNumber}`;
  }
  const name = `${quadrantName} ${isPrimary ? "primary " : ""}${positionName}`;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
