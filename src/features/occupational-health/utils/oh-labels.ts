import { humanizeOhCode } from "@/features/occupational-health/utils/oh-format";

export const EXAM_TYPES = [
  { value: "pre_employment", label: "Admission exam" },
  { value: "periodic", label: "Periodic exam" },
  { value: "transfer", label: "Change of function exam" },
  { value: "rtw", label: "Return to work exam" },
  { value: "post_incident", label: "Post-incident exam" },
  { value: "exit", label: "Demissional exam" },
] as const;

/** Exam types offered when starting Medical Examinations (excludes post_incident). */
export const MEDICAL_EXAM_START_TYPES = EXAM_TYPES.filter(
  (option) => option.value !== "post_incident",
);

export const FITNESS_OUTCOMES = [
  { value: "fit", label: "Fit" },
  { value: "fit_with_restrictions", label: "Fit with restrictions" },
  { value: "temporarily_unfit", label: "Temporarily unfit" },
  { value: "permanently_unfit", label: "Permanently unfit for job" },
  { value: "unfit", label: "Unfit" },
  { value: "deferred", label: "Deferred" },
] as const;

const EXAM_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  EXAM_TYPES.map((option) => [option.value, option.label]),
);

const OUTCOME_LABELS: Record<string, string> = Object.fromEntries(
  FITNESS_OUTCOMES.map((option) => [option.value, option.label]),
);

export function formatExamTypeLabel(examType: string): string {
  return EXAM_TYPE_LABELS[examType] ?? humanizeOhCode(examType);
}

export function formatFitnessOutcome(outcome: string): string {
  return OUTCOME_LABELS[outcome] ?? humanizeOhCode(outcome);
}
