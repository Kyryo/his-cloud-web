import {
  THERAPY_DISCIPLINES,
  type TherapyDiscipline,
} from "@/features/therapy/types/therapy.types";

export const THERAPY_DISCIPLINE_CONFIG: Record<
  TherapyDiscipline,
  { label: string; queueLabel: string; group: string; description: string }
> = {
  speech: {
    label: "Speech Therapy",
    queueLabel: "Speech Queue",
    group: "Speech",
    description: "Review speech therapy visits in the active clinic.",
  },
  physio: {
    label: "Physiotherapy",
    queueLabel: "Physio Queue",
    group: "Physio",
    description: "Review physiotherapy visits in the active clinic.",
  },
  occupational: {
    label: "Occupational Therapy",
    queueLabel: "OT Queue",
    group: "Occupational",
    description: "Review occupational therapy visits in the active clinic.",
  },
};

export function isTherapyDiscipline(
  value: string,
): value is TherapyDiscipline {
  return THERAPY_DISCIPLINES.some((discipline) => discipline === value);
}

export function canAccessTherapyDiscipline(
  userGroups: string[],
  discipline: TherapyDiscipline,
): boolean {
  return userGroups.includes(THERAPY_DISCIPLINE_CONFIG[discipline].group);
}
