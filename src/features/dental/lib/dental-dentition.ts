/**
 * Adult vs children (primary) dentition helpers for the odontogram chart.
 *
 * react-odontogram only renders permanent-shaped tooth IDs (teeth-11…48).
 * Children mode uses maxTeeth=5 and maps those chart IDs to primary FDI (51–85).
 */

export type DentitionMode = "adult" | "children";

const PERMANENT_FDI: number[] = [
  11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33,
  34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48,
];

const PRIMARY_FDI: number[] = [
  51, 52, 53, 54, 55, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75, 81, 82, 83, 84,
  85,
];

const PERMANENT_SET = new Set(PERMANENT_FDI);
const PRIMARY_SET = new Set(PRIMARY_FDI);

/** Chart tooth (permanent FDI position) → primary FDI. 11→51 … 45→85. */
function chartFdiToPrimary(chartFdi: number): number | null {
  if (!Number.isFinite(chartFdi)) return null;
  const quadrant = Math.floor(chartFdi / 10);
  const tooth = chartFdi % 10;
  if (quadrant < 1 || quadrant > 4 || tooth < 1 || tooth > 5) return null;
  const primary = (quadrant + 4) * 10 + tooth;
  return PRIMARY_SET.has(primary) ? primary : null;
}

/** Primary FDI → chart tooth ID number (51→11 … 85→45). */
function primaryToChartFdi(primaryFdi: number): number | null {
  if (!PRIMARY_SET.has(primaryFdi)) return null;
  const quadrant = Math.floor(primaryFdi / 10);
  const tooth = primaryFdi % 10;
  return (quadrant - 4) * 10 + tooth;
}

export function isPermanentFdi(tooth: number): boolean {
  return PERMANENT_SET.has(tooth);
}

export function isPrimaryFdi(tooth: number): boolean {
  return PRIMARY_SET.has(tooth);
}

export function getPermanentFdiToothNumbers(): number[] {
  return [...PERMANENT_FDI];
}

export function getPrimaryFdiToothNumbers(): number[] {
  return [...PRIMARY_FDI];
}

export function getFdiToothNumbersForDentition(mode: DentitionMode): number[] {
  return mode === "children"
    ? getPrimaryFdiToothNumbers()
    : getPermanentFdiToothNumbers();
}

export function filterTeethForDentition(
  teeth: number[],
  mode: DentitionMode,
): number[] {
  const set = mode === "children" ? PRIMARY_SET : PERMANENT_SET;
  return [...new Set(teeth.filter((n) => set.has(n)))].sort((a, b) => a - b);
}

/**
 * Convert stored FDI numbers to react-odontogram chart IDs for the active mode.
 * Children: primary FDI → permanent-shaped chart IDs (teeth-51 → teeth-11).
 */
export function toChartIds(teeth: number[], mode: DentitionMode): string[] {
  const ids: string[] = [];
  for (const tooth of teeth) {
    if (mode === "adult") {
      if (PERMANENT_SET.has(tooth)) ids.push(`teeth-${tooth}`);
      continue;
    }
    const chart = primaryToChartFdi(tooth);
    if (chart != null) ids.push(`teeth-${chart}`);
  }
  return ids;
}

/**
 * Map a chart FDI number (from react-odontogram notations.fdi) to stored FDI
 * for the active dentition mode.
 */
export function fromChartFdi(
  chartFdi: number,
  mode: DentitionMode,
): number | null {
  if (!Number.isFinite(chartFdi) || chartFdi <= 0) return null;
  if (mode === "adult") {
    return PERMANENT_SET.has(chartFdi) ? chartFdi : null;
  }
  return chartFdiToPrimary(chartFdi);
}

/**
 * Start on Children only when there is at least one primary tooth and no
 * permanent teeth; otherwise Adult.
 */
export function inferDentitionMode(teeth: number[]): DentitionMode {
  const hasPrimary = teeth.some((n) => PRIMARY_SET.has(n));
  const hasPermanent = teeth.some((n) => PERMANENT_SET.has(n));
  if (hasPrimary && !hasPermanent) return "children";
  return "adult";
}

export function maxTeethForDentition(mode: DentitionMode): number {
  return mode === "children" ? 5 : 8;
}

/**
 * Select-all for one dentition: keep the other dentition’s teeth, replace the
 * active dentition with `modeTeeth`.
 */
export function mergeSelectAllTeeth(
  current: number[],
  modeTeeth: number[],
): number[] {
  const sample = modeTeeth[0];
  const mode: DentitionMode =
    sample != null && isPrimaryFdi(sample) ? "children" : "adult";
  const otherMode: DentitionMode = mode === "adult" ? "children" : "adult";
  const other = filterTeethForDentition(current, otherMode);
  return [...new Set([...other, ...modeTeeth])].sort((a, b) => a - b);
}
