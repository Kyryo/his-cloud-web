import { humanizeOhCode } from "@/features/occupational-health/utils/oh-format";

export const EXAM_TYPES = [
  { value: "pre_employment", label: "Pre-employment" },
  { value: "periodic", label: "Periodic" },
  { value: "transfer", label: "Transfer" },
  { value: "rtw", label: "Return to work" },
  { value: "post_incident", label: "Post-incident" },
  { value: "exit", label: "Exit" },
] as const;

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
