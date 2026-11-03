import {
  FileBadge2,
  FlaskConical,
  ShieldAlert,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";

export const OH_ENCOUNTER_MODULES = [
  {
    id: "medical-examinations",
    label: "Medical Examinations",
    description: "Complete the exam template for this risk profile",
    icon: Stethoscope,
  },
  {
    id: "certificate",
    label: "Occupational Health Certificate",
    description: "Issue fitness certificates for HR",
    icon: FileBadge2,
  },
  {
    id: "iod",
    label: "Injury on Duty Management",
    description: "Record and manage injury-on-duty cases",
    icon: ShieldAlert,
  },
  {
    id: "immunization",
    label: "Immunization & Infectious Control",
    description: "Vaccinations and infectious disease controls",
    icon: Syringe,
  },
  {
    id: "drug-alcohol",
    label: "Drug & Alcohol Testing",
    description: "Screening and chain-of-custody records",
    icon: FlaskConical,
  },
] as const;

export type OhEncounterModuleId = (typeof OH_ENCOUNTER_MODULES)[number]["id"];

/** Secondary panel for assigning employment / risk profile (not a primary module). */
export const OH_EMPLOYMENT_PANEL_ID = "employment" as const;

export type OhEncounterPanelId = OhEncounterModuleId | typeof OH_EMPLOYMENT_PANEL_ID;

export function isOhEncounterModuleId(value: string | null | undefined): value is OhEncounterModuleId {
  return OH_ENCOUNTER_MODULES.some((module) => module.id === value);
}

export function isOhEncounterPanelId(value: string | null | undefined): value is OhEncounterPanelId {
  return value === OH_EMPLOYMENT_PANEL_ID || isOhEncounterModuleId(value);
}

export function moduleIcon(id: OhEncounterModuleId): LucideIcon {
  return OH_ENCOUNTER_MODULES.find((module) => module.id === id)!.icon;
}

/** Envelope key for risk-profile exam template answers inside examination.responses_json. */
export const EXAM_TEMPLATE_RESPONSE_KEY = "__exam_template__";
