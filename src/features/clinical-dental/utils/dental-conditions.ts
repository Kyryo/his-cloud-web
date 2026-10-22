import type {
  DentalChartFinding,
  DentalCondition,
  ToothSurface,
} from "@/features/clinical-dental/types/clinical-dental.types";

type ConditionMeta = {
  label: string;
  /** Fill of the tooth tile and legend swatch. */
  swatchClassName: string;
};

/** Display order doubles as priority when a tooth has several findings. */
export const DENTAL_CONDITIONS: readonly DentalCondition[] = [
  "missing",
  "extracted",
  "fracture",
  "caries",
  "root_canal",
  "implant",
  "crown",
  "bridge",
  "restoration",
  "sealant",
  "mobility",
  "watch",
];

export const DENTAL_CONDITION_META: Record<DentalCondition, ConditionMeta> = {
  caries: { label: "Caries", swatchClassName: "bg-red-500 text-white" },
  restoration: { label: "Restoration", swatchClassName: "bg-sky-500 text-white" },
  crown: { label: "Crown", swatchClassName: "bg-amber-400 text-amber-950" },
  missing: { label: "Missing", swatchClassName: "bg-slate-300 text-slate-700" },
  extracted: { label: "Extracted", swatchClassName: "bg-slate-500 text-white" },
  implant: { label: "Implant", swatchClassName: "bg-violet-500 text-white" },
  root_canal: { label: "Root canal", swatchClassName: "bg-rose-400 text-white" },
  fracture: { label: "Fracture", swatchClassName: "bg-orange-500 text-white" },
  bridge: { label: "Bridge", swatchClassName: "bg-cyan-500 text-white" },
  sealant: { label: "Sealant", swatchClassName: "bg-emerald-500 text-white" },
  mobility: { label: "Mobility", swatchClassName: "bg-fuchsia-500 text-white" },
  watch: { label: "Watch", swatchClassName: "bg-yellow-200 text-yellow-900" },
};

export const TOOTH_SURFACES: ReadonlyArray<{ value: ToothSurface; label: string }> = [
  { value: "M", label: "Mesial" },
  { value: "O", label: "Occlusal" },
  { value: "D", label: "Distal" },
  { value: "B", label: "Buccal" },
  { value: "L", label: "Lingual" },
  { value: "I", label: "Incisal" },
];

export function conditionLabel(condition: DentalCondition): string {
  return DENTAL_CONDITION_META[condition]?.label ?? condition;
}

/** The condition shown on a tooth tile: the highest-priority active finding. */
export function primaryConditionFor(
  findings: readonly DentalChartFinding[],
): DentalCondition | null {
  for (const condition of DENTAL_CONDITIONS) {
    if (findings.some((finding) => finding.condition === condition)) {
      return condition;
    }
  }
  return null;
}

export function groupFindingsByTooth(
  findings: readonly DentalChartFinding[],
): Map<number, DentalChartFinding[]> {
  const grouped = new Map<number, DentalChartFinding[]>();
  for (const finding of findings) {
    const existing = grouped.get(finding.tooth_number) ?? [];
    existing.push(finding);
    grouped.set(finding.tooth_number, existing);
  }
  return grouped;
}

/** Compact surface codes, e.g. ``MOD``. */
export function formatSurfaces(surfaces: readonly ToothSurface[]): string {
  return surfaces.length > 0 ? surfaces.join("") : "";
}

/** Full surface names for treatment detail rows, e.g. ``Mesial, Occlusal``. */
export function formatSurfaceLabels(surfaces: readonly ToothSurface[]): string {
  if (surfaces.length === 0) {
    return "";
  }
  const labels = new Map(TOOTH_SURFACES.map((item) => [item.value, item.label]));
  return surfaces.map((surface) => labels.get(surface) ?? surface).join(", ");
}
