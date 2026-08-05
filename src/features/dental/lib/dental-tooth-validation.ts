/**
 * Tooth numbering validation (FDI, Universal, Palmer) — aligned with dentist-extension/content.js.
 */

export type ToothNumberingSystem = "fdi" | "universal" | "palmer"

export interface ToothInfo {
  name: string
  type: string
  position: string
  quadrant?: number
  isPrimary?: boolean
}

const FDI: Record<number, ToothInfo> = {
  11: {
    name: "Upper Right Central Incisor",
    type: "incisor",
    position: "upper_right",
    quadrant: 1,
  },
  12: {
    name: "Upper Right Lateral Incisor",
    type: "incisor",
    position: "upper_right",
    quadrant: 1,
  },
  13: { name: "Upper Right Canine", type: "canine", position: "upper_right", quadrant: 1 },
  14: {
    name: "Upper Right First Premolar",
    type: "premolar",
    position: "upper_right",
    quadrant: 1,
  },
  15: {
    name: "Upper Right Second Premolar",
    type: "premolar",
    position: "upper_right",
    quadrant: 1,
  },
  16: { name: "Upper Right First Molar", type: "molar", position: "upper_right", quadrant: 1 },
  17: { name: "Upper Right Second Molar", type: "molar", position: "upper_right", quadrant: 1 },
  18: { name: "Upper Right Third Molar", type: "molar", position: "upper_right", quadrant: 1 },
  21: {
    name: "Upper Left Central Incisor",
    type: "incisor",
    position: "upper_left",
    quadrant: 2,
  },
  22: {
    name: "Upper Left Lateral Incisor",
    type: "incisor",
    position: "upper_left",
    quadrant: 2,
  },
  23: { name: "Upper Left Canine", type: "canine", position: "upper_left", quadrant: 2 },
  24: {
    name: "Upper Left First Premolar",
    type: "premolar",
    position: "upper_left",
    quadrant: 2,
  },
  25: {
    name: "Upper Left Second Premolar",
    type: "premolar",
    position: "upper_left",
    quadrant: 2,
  },
  26: { name: "Upper Left First Molar", type: "molar", position: "upper_left", quadrant: 2 },
  27: { name: "Upper Left Second Molar", type: "molar", position: "upper_left", quadrant: 2 },
  28: { name: "Upper Left Third Molar", type: "molar", position: "upper_left", quadrant: 2 },
  31: {
    name: "Lower Left Central Incisor",
    type: "incisor",
    position: "lower_left",
    quadrant: 3,
  },
  32: {
    name: "Lower Left Lateral Incisor",
    type: "incisor",
    position: "lower_left",
    quadrant: 3,
  },
  33: { name: "Lower Left Canine", type: "canine", position: "lower_left", quadrant: 3 },
  34: {
    name: "Lower Left First Premolar",
    type: "premolar",
    position: "lower_left",
    quadrant: 3,
  },
  35: {
    name: "Lower Left Second Premolar",
    type: "premolar",
    position: "lower_left",
    quadrant: 3,
  },
  36: { name: "Lower Left First Molar", type: "molar", position: "lower_left", quadrant: 3 },
  37: { name: "Lower Left Second Molar", type: "molar", position: "lower_left", quadrant: 3 },
  38: { name: "Lower Left Third Molar", type: "molar", position: "lower_left", quadrant: 3 },
  41: {
    name: "Lower Right Central Incisor",
    type: "incisor",
    position: "lower_right",
    quadrant: 4,
  },
  42: {
    name: "Lower Right Lateral Incisor",
    type: "incisor",
    position: "lower_right",
    quadrant: 4,
  },
  43: { name: "Lower Right Canine", type: "canine", position: "lower_right", quadrant: 4 },
  44: {
    name: "Lower Right First Premolar",
    type: "premolar",
    position: "lower_right",
    quadrant: 4,
  },
  45: {
    name: "Lower Right Second Premolar",
    type: "premolar",
    position: "lower_right",
    quadrant: 4,
  },
  46: { name: "Lower Right First Molar", type: "molar", position: "lower_right", quadrant: 4 },
  47: { name: "Lower Right Second Molar", type: "molar", position: "lower_right", quadrant: 4 },
  48: { name: "Lower Right Third Molar", type: "molar", position: "lower_right", quadrant: 4 },
  51: {
    name: "Upper Right Primary Central Incisor",
    type: "incisor",
    position: "upper_right",
    quadrant: 5,
    isPrimary: true,
  },
  52: {
    name: "Upper Right Primary Lateral Incisor",
    type: "incisor",
    position: "upper_right",
    quadrant: 5,
    isPrimary: true,
  },
  53: {
    name: "Upper Right Primary Canine",
    type: "canine",
    position: "upper_right",
    quadrant: 5,
    isPrimary: true,
  },
  54: {
    name: "Upper Right Primary First Molar",
    type: "molar",
    position: "upper_right",
    quadrant: 5,
    isPrimary: true,
  },
  55: {
    name: "Upper Right Primary Second Molar",
    type: "molar",
    position: "upper_right",
    quadrant: 5,
    isPrimary: true,
  },
  61: {
    name: "Upper Left Primary Central Incisor",
    type: "incisor",
    position: "upper_left",
    quadrant: 6,
    isPrimary: true,
  },
  62: {
    name: "Upper Left Primary Lateral Incisor",
    type: "incisor",
    position: "upper_left",
    quadrant: 6,
    isPrimary: true,
  },
  63: {
    name: "Upper Left Primary Canine",
    type: "canine",
    position: "upper_left",
    quadrant: 6,
    isPrimary: true,
  },
  64: {
    name: "Upper Left Primary First Molar",
    type: "molar",
    position: "upper_left",
    quadrant: 6,
    isPrimary: true,
  },
  65: {
    name: "Upper Left Primary Second Molar",
    type: "molar",
    position: "upper_left",
    quadrant: 6,
    isPrimary: true,
  },
  71: {
    name: "Lower Left Primary Central Incisor",
    type: "incisor",
    position: "lower_left",
    quadrant: 7,
    isPrimary: true,
  },
  72: {
    name: "Lower Left Primary Lateral Incisor",
    type: "incisor",
    position: "lower_left",
    quadrant: 7,
    isPrimary: true,
  },
  73: {
    name: "Lower Left Primary Canine",
    type: "canine",
    position: "lower_left",
    quadrant: 7,
    isPrimary: true,
  },
  74: {
    name: "Lower Left Primary First Molar",
    type: "molar",
    position: "lower_left",
    quadrant: 7,
    isPrimary: true,
  },
  75: {
    name: "Lower Left Primary Second Molar",
    type: "molar",
    position: "lower_left",
    quadrant: 7,
    isPrimary: true,
  },
  81: {
    name: "Lower Right Primary Central Incisor",
    type: "incisor",
    position: "lower_right",
    quadrant: 8,
    isPrimary: true,
  },
  82: {
    name: "Lower Right Primary Lateral Incisor",
    type: "incisor",
    position: "lower_right",
    quadrant: 8,
    isPrimary: true,
  },
  83: {
    name: "Lower Right Primary Canine",
    type: "canine",
    position: "lower_right",
    quadrant: 8,
    isPrimary: true,
  },
  84: {
    name: "Lower Right Primary First Molar",
    type: "molar",
    position: "lower_right",
    quadrant: 8,
    isPrimary: true,
  },
  85: {
    name: "Lower Right Primary Second Molar",
    type: "molar",
    position: "lower_right",
    quadrant: 8,
    isPrimary: true,
  },
}

const UNIVERSAL: Record<number | string, ToothInfo> = {
  1: { name: "Upper Right Third Molar", type: "molar", position: "upper_right" },
  2: { name: "Upper Right Second Molar", type: "molar", position: "upper_right" },
  3: { name: "Upper Right First Molar", type: "molar", position: "upper_right" },
  4: { name: "Upper Right Second Premolar", type: "premolar", position: "upper_right" },
  5: { name: "Upper Right First Premolar", type: "premolar", position: "upper_right" },
  6: { name: "Upper Right Canine", type: "canine", position: "upper_right" },
  7: { name: "Upper Right Lateral Incisor", type: "incisor", position: "upper_right" },
  8: { name: "Upper Right Central Incisor", type: "incisor", position: "upper_right" },
  9: { name: "Upper Left Central Incisor", type: "incisor", position: "upper_left" },
  10: { name: "Upper Left Lateral Incisor", type: "incisor", position: "upper_left" },
  11: { name: "Upper Left Canine", type: "canine", position: "upper_left" },
  12: { name: "Upper Left First Premolar", type: "premolar", position: "upper_left" },
  13: { name: "Upper Left Second Premolar", type: "premolar", position: "upper_left" },
  14: { name: "Upper Left First Molar", type: "molar", position: "upper_left" },
  15: { name: "Upper Left Second Molar", type: "molar", position: "upper_left" },
  16: { name: "Upper Left Third Molar", type: "molar", position: "upper_left" },
  17: { name: "Lower Left Third Molar", type: "molar", position: "lower_left" },
  18: { name: "Lower Left Second Molar", type: "molar", position: "lower_left" },
  19: { name: "Lower Left First Molar", type: "molar", position: "lower_left" },
  20: { name: "Lower Left Second Premolar", type: "premolar", position: "lower_left" },
  21: { name: "Lower Left First Premolar", type: "premolar", position: "lower_left" },
  22: { name: "Lower Left Canine", type: "canine", position: "lower_left" },
  23: { name: "Lower Left Lateral Incisor", type: "incisor", position: "lower_left" },
  24: { name: "Lower Left Central Incisor", type: "incisor", position: "lower_left" },
  25: { name: "Lower Right Central Incisor", type: "incisor", position: "lower_right" },
  26: { name: "Lower Right Lateral Incisor", type: "incisor", position: "lower_right" },
  27: { name: "Lower Right Canine", type: "canine", position: "lower_right" },
  28: { name: "Lower Right First Premolar", type: "premolar", position: "lower_right" },
  29: { name: "Lower Right Second Premolar", type: "premolar", position: "lower_right" },
  30: { name: "Lower Right First Molar", type: "molar", position: "lower_right" },
  31: { name: "Lower Right Second Molar", type: "molar", position: "lower_right" },
  32: { name: "Lower Right Third Molar", type: "molar", position: "lower_right" },
  A: {
    name: "Upper Right Primary Second Molar",
    type: "molar",
    position: "upper_right",
    isPrimary: true,
  },
  B: {
    name: "Upper Right Primary First Molar",
    type: "molar",
    position: "upper_right",
    isPrimary: true,
  },
  C: { name: "Upper Right Primary Canine", type: "canine", position: "upper_right", isPrimary: true },
  D: {
    name: "Upper Right Primary Lateral Incisor",
    type: "incisor",
    position: "upper_right",
    isPrimary: true,
  },
  E: {
    name: "Upper Right Primary Central Incisor",
    type: "incisor",
    position: "upper_right",
    isPrimary: true,
  },
  F: {
    name: "Upper Left Primary Central Incisor",
    type: "incisor",
    position: "upper_left",
    isPrimary: true,
  },
  G: {
    name: "Upper Left Primary Lateral Incisor",
    type: "incisor",
    position: "upper_left",
    isPrimary: true,
  },
  H: { name: "Upper Left Primary Canine", type: "canine", position: "upper_left", isPrimary: true },
  I: {
    name: "Upper Left Primary First Molar",
    type: "molar",
    position: "upper_left",
    isPrimary: true,
  },
  J: {
    name: "Upper Left Primary Second Molar",
    type: "molar",
    position: "upper_left",
    isPrimary: true,
  },
  K: {
    name: "Lower Left Primary Second Molar",
    type: "molar",
    position: "lower_left",
    isPrimary: true,
  },
  L: {
    name: "Lower Left Primary First Molar",
    type: "molar",
    position: "lower_left",
    isPrimary: true,
  },
  M: { name: "Lower Left Primary Canine", type: "canine", position: "lower_left", isPrimary: true },
  N: {
    name: "Lower Left Primary Lateral Incisor",
    type: "incisor",
    position: "lower_left",
    isPrimary: true,
  },
  O: {
    name: "Lower Left Primary Central Incisor",
    type: "incisor",
    position: "lower_left",
    isPrimary: true,
  },
  P: {
    name: "Lower Right Primary Central Incisor",
    type: "incisor",
    position: "lower_right",
    isPrimary: true,
  },
  Q: {
    name: "Lower Right Primary Lateral Incisor",
    type: "incisor",
    position: "lower_right",
    isPrimary: true,
  },
  R: { name: "Lower Right Primary Canine", type: "canine", position: "lower_right", isPrimary: true },
  S: {
    name: "Lower Right Primary First Molar",
    type: "molar",
    position: "lower_right",
    isPrimary: true,
  },
  T: {
    name: "Lower Right Primary Second Molar",
    type: "molar",
    position: "lower_right",
    isPrimary: true,
  },
}

const PALMER: Record<string, ToothInfo> = {
  UR1: { name: "Upper Right Central Incisor", type: "incisor", position: "upper_right" },
  UR2: { name: "Upper Right Lateral Incisor", type: "incisor", position: "upper_right" },
  UR3: { name: "Upper Right Canine", type: "canine", position: "upper_right" },
  UR4: { name: "Upper Right First Premolar", type: "premolar", position: "upper_right" },
  UR5: { name: "Upper Right Second Premolar", type: "premolar", position: "upper_right" },
  UR6: { name: "Upper Right First Molar", type: "molar", position: "upper_right" },
  UR7: { name: "Upper Right Second Molar", type: "molar", position: "upper_right" },
  UR8: { name: "Upper Right Third Molar", type: "molar", position: "upper_right" },
  UL1: { name: "Upper Left Central Incisor", type: "incisor", position: "upper_left" },
  UL2: { name: "Upper Left Lateral Incisor", type: "incisor", position: "upper_left" },
  UL3: { name: "Upper Left Canine", type: "canine", position: "upper_left" },
  UL4: { name: "Upper Left First Premolar", type: "premolar", position: "upper_left" },
  UL5: { name: "Upper Left Second Premolar", type: "premolar", position: "upper_left" },
  UL6: { name: "Upper Left First Molar", type: "molar", position: "upper_left" },
  UL7: { name: "Upper Left Second Molar", type: "molar", position: "upper_left" },
  UL8: { name: "Upper Left Third Molar", type: "molar", position: "upper_left" },
  LL1: { name: "Lower Left Central Incisor", type: "incisor", position: "lower_left" },
  LL2: { name: "Lower Left Lateral Incisor", type: "incisor", position: "lower_left" },
  LL3: { name: "Lower Left Canine", type: "canine", position: "lower_left" },
  LL4: { name: "Lower Left First Premolar", type: "premolar", position: "lower_left" },
  LL5: { name: "Lower Left Second Premolar", type: "premolar", position: "lower_left" },
  LL6: { name: "Lower Left First Molar", type: "molar", position: "lower_left" },
  LL7: { name: "Lower Left Second Molar", type: "molar", position: "lower_left" },
  LL8: { name: "Lower Left Third Molar", type: "molar", position: "lower_left" },
  LR1: { name: "Lower Right Central Incisor", type: "incisor", position: "lower_right" },
  LR2: { name: "Lower Right Lateral Incisor", type: "incisor", position: "lower_right" },
  LR3: { name: "Lower Right Canine", type: "canine", position: "lower_right" },
  LR4: { name: "Lower Right First Premolar", type: "premolar", position: "lower_right" },
  LR5: { name: "Lower Right Second Premolar", type: "premolar", position: "lower_right" },
  LR6: { name: "Lower Right First Molar", type: "molar", position: "lower_right" },
  LR7: { name: "Lower Right Second Molar", type: "molar", position: "lower_right" },
  LR8: { name: "Lower Right Third Molar", type: "molar", position: "lower_right" },
  URA: {
    name: "Upper Right Primary Central Incisor",
    type: "incisor",
    position: "upper_right",
    isPrimary: true,
  },
  URB: {
    name: "Upper Right Primary Lateral Incisor",
    type: "incisor",
    position: "upper_right",
    isPrimary: true,
  },
  URC: { name: "Upper Right Primary Canine", type: "canine", position: "upper_right", isPrimary: true },
  URD: {
    name: "Upper Right Primary First Molar",
    type: "molar",
    position: "upper_right",
    isPrimary: true,
  },
  URE: {
    name: "Upper Right Primary Second Molar",
    type: "molar",
    position: "upper_right",
    isPrimary: true,
  },
  ULA: {
    name: "Upper Left Primary Central Incisor",
    type: "incisor",
    position: "upper_left",
    isPrimary: true,
  },
  ULB: {
    name: "Upper Left Primary Lateral Incisor",
    type: "incisor",
    position: "upper_left",
    isPrimary: true,
  },
  ULC: { name: "Upper Left Primary Canine", type: "canine", position: "upper_left", isPrimary: true },
  ULD: {
    name: "Upper Left Primary First Molar",
    type: "molar",
    position: "upper_left",
    isPrimary: true,
  },
  ULE: {
    name: "Upper Left Primary Second Molar",
    type: "molar",
    position: "upper_left",
    isPrimary: true,
  },
  LLA: {
    name: "Lower Left Primary Central Incisor",
    type: "incisor",
    position: "lower_left",
    isPrimary: true,
  },
  LLB: {
    name: "Lower Left Primary Lateral Incisor",
    type: "incisor",
    position: "lower_left",
    isPrimary: true,
  },
  LLC: { name: "Lower Left Primary Canine", type: "canine", position: "lower_left", isPrimary: true },
  LLD: {
    name: "Lower Left Primary First Molar",
    type: "molar",
    position: "lower_left",
    isPrimary: true,
  },
  LLE: {
    name: "Lower Left Primary Second Molar",
    type: "molar",
    position: "lower_left",
    isPrimary: true,
  },
  LRA: {
    name: "Lower Right Primary Central Incisor",
    type: "incisor",
    position: "lower_right",
    isPrimary: true,
  },
  LRB: {
    name: "Lower Right Primary Lateral Incisor",
    type: "incisor",
    position: "lower_right",
    isPrimary: true,
  },
  LRC: { name: "Lower Right Primary Canine", type: "canine", position: "lower_right", isPrimary: true },
  LRD: {
    name: "Lower Right Primary First Molar",
    type: "molar",
    position: "lower_right",
    isPrimary: true,
  },
  LRE: {
    name: "Lower Right Primary Second Molar",
    type: "molar",
    position: "lower_right",
    isPrimary: true,
  },
}

export type ToothValidationResult =
  | {
      valid: true
      toothInfo: ToothInfo
      toothNumber: string
      numberingSystem: ToothNumberingSystem
    }
  | { valid: false; error: string }

export function validateAndGetToothInfo(
  toothNumber: string,
  numberingSystem: ToothNumberingSystem = "fdi",
): ToothValidationResult {
  const trimmed = String(toothNumber).trim().toUpperCase()

  if (!trimmed) {
    return { valid: false, error: "Tooth number is required" }
  }

  if (numberingSystem === "fdi") {
    if (!/^\d{2}$/.test(trimmed)) {
      return {
        valid: false,
        error: "FDI tooth number must be exactly 2 digits (e.g., 11, 36, 48)",
      }
    }
    const num = parseInt(trimmed, 10)
    if (!FDI[num]) {
      return {
        valid: false,
        error:
          "Invalid FDI tooth number. Valid ranges: 11-18, 21-28, 31-38, 41-48 (permanent), 51-55, 61-65, 71-75, 81-85 (primary)",
      }
    }
    return {
      valid: true,
      toothInfo: FDI[num],
      toothNumber: trimmed,
      numberingSystem: "fdi",
    }
  }

  if (numberingSystem === "universal") {
    if (/^[A-T]$/i.test(trimmed)) {
      const upperLetter = trimmed.toUpperCase()
      if (!UNIVERSAL[upperLetter]) {
        return {
          valid: false,
          error: "Invalid Universal tooth letter. Valid letters: A-T for primary teeth",
        }
      }
      return {
        valid: true,
        toothInfo: UNIVERSAL[upperLetter],
        toothNumber: upperLetter,
        numberingSystem: "universal",
      }
    }
    if (!/^\d{1,2}$/.test(trimmed)) {
      return { valid: false, error: "Universal tooth number must be 1-32 or A-T" }
    }
    const num = parseInt(trimmed, 10)
    if (num < 1 || num > 32 || !UNIVERSAL[num]) {
      return {
        valid: false,
        error: "Universal tooth number must be between 1 and 32, or A-T for primary teeth",
      }
    }
    return {
      valid: true,
      toothInfo: UNIVERSAL[num],
      toothNumber: trimmed,
      numberingSystem: "universal",
    }
  }

  if (numberingSystem === "palmer") {
    if (!/^[UL][RL](\d|[A-E])$/i.test(trimmed)) {
      return {
        valid: false,
        error:
          "Palmer notation must be in format: UR1-8, UL1-8, LL1-8, LR1-8 (or URA-E, ULA-E, etc. for primary)",
      }
    }
    if (!PALMER[trimmed]) {
      return {
        valid: false,
        error: "Invalid Palmer notation. Examples: UR1, UL8, LL3, LR5 (or URA, ULE for primary)",
      }
    }
    return {
      valid: true,
      toothInfo: PALMER[trimmed],
      toothNumber: trimmed,
      numberingSystem: "palmer",
    }
  }

  return { valid: false, error: "Unknown numbering system" }
}

export function toothNumberPlaceholder(system: ToothNumberingSystem): string {
  switch (system) {
    case "fdi":
      return "e.g., 11, 36, 48"
    case "universal":
      return "e.g., 1, 14, 32, A, T"
    case "palmer":
      return "e.g., UR1, LL6, UL8"
    default:
      return ""
  }
}

/** Resolve any valid notation to FDI (for odontogram tooth ids). */
export function toothNumberToFdiNotation(
  toothNumber: string,
  numberingSystem: ToothNumberingSystem,
): string | null {
  const result = validateAndGetToothInfo(toothNumber, numberingSystem)
  if (!result.valid) return null
  if (numberingSystem === "fdi") return result.toothNumber

  const targetName = result.toothInfo.name
  for (const [fdi, info] of Object.entries(FDI)) {
    if (info.name === targetName) {
      return fdi
    }
  }
  return null
}

/** Convert FDI notation to the active numbering system string. */
export function fdiNotationToToothNumber(
  fdi: string,
  numberingSystem: ToothNumberingSystem,
): string | null {
  const fdiNum = parseInt(fdi, 10)
  if (!FDI[fdiNum]) return null

  if (numberingSystem === "fdi") return fdi

  const targetName = FDI[fdiNum].name
  if (numberingSystem === "universal") {
    for (const [key, info] of Object.entries(UNIVERSAL)) {
      if (info.name === targetName) return String(key)
    }
  }
  if (numberingSystem === "palmer") {
    for (const [key, info] of Object.entries(PALMER)) {
      if (info.name === targetName) return key
    }
  }
  return null
}

/** All valid tooth numbers in the catalog for the active numbering system. */
export function getAllToothNumbersForSystem(
  numberingSystem: ToothNumberingSystem,
): string[] {
  const fdiNumbers = Object.keys(FDI)
    .map((key) => parseInt(key, 10))
    .filter((num) => !Number.isNaN(num))
    .sort((a, b) => a - b)

  if (numberingSystem === "fdi") {
    return fdiNumbers.map(String)
  }

  return fdiNumbers
    .map((fdi) => fdiNotationToToothNumber(String(fdi), numberingSystem))
    .filter((value): value is string => Boolean(value))
}

export function toothNumberHint(system: ToothNumberingSystem): string {
  switch (system) {
    case "fdi":
      return "FDI: 2 digits (11-48, 51-85 for primary)"
    case "universal":
      return "Universal: 1-32 or A-T for primary"
    case "palmer":
      return "Palmer: UR1-8, UL1-8, LL1-8, LR1-8"
    default:
      return ""
  }
}
