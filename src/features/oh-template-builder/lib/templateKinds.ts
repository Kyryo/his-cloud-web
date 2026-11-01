import { Award, ClipboardList, type LucideIcon } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import {
  TEMPLATE_KINDS,
  type TemplateKind,
} from "@/features/oh-template-builder/template-builder.types";

type TemplateKindMeta = {
  /** Singular noun, e.g. "Exam template". */
  label: string;
  pluralLabel: string;
  description: string;
  namePlaceholder: string;
  codePlaceholder: string;
  /** Settings tab id on the occupational health module page. */
  settingsTab: "exam-templates" | "catalog";
};

export const TEMPLATE_KIND_META: Record<TemplateKind, TemplateKindMeta> = {
  exam: {
    label: "Exam template",
    pluralLabel: "Exam templates",
    description:
      "Layouts clinicians fill in during an occupational health examination.",
    namePlaceholder: "Pre-employment medical",
    codePlaceholder: "PRE_EMPLOYMENT",
    settingsTab: "exam-templates",
  },
  certificate: {
    label: "COF template",
    pluralLabel: "COF templates",
    description:
      "Certificate of Fitness layouts issued at the end of an examination.",
    namePlaceholder: "Underground worker COF",
    codePlaceholder: "UNDERGROUND_COF",
    settingsTab: "catalog",
  },
};

export const TEMPLATE_KIND_ICONS: Record<TemplateKind, LucideIcon> = {
  exam: ClipboardList,
  certificate: Award,
};

export function isTemplateKind(value: string): value is TemplateKind {
  return (TEMPLATE_KINDS as readonly string[]).includes(value);
}

export function templateGalleryHref(kind: TemplateKind) {
  return `${ROUTES.settingsModuleOccupationalHealth}?tab=${TEMPLATE_KIND_META[kind].settingsTab}`;
}

export const templateQueryKeys = {
  list: (kind: TemplateKind) => ["oh-templates", kind, "list"] as const,
  detail: (kind: TemplateKind, uuid: string) =>
    ["oh-templates", kind, "detail", uuid] as const,
  attachments: (kind: TemplateKind, uuid: string) =>
    ["oh-templates", kind, "attachments", uuid] as const,
  library: (kind: TemplateKind) => ["oh-templates", kind, "library"] as const,
  items: (kind: TemplateKind, sectionUuid: string) =>
    ["oh-templates", kind, "items", sectionUuid] as const,
};
