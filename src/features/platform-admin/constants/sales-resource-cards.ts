import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";

import { ROUTES } from "@/constants/routes";

export type PlatformAdminSalesResourceCard = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
};

export type PlatformAdminSalesResourceSection = {
  id: string;
  title: string;
  description?: string;
  items: PlatformAdminSalesResourceCard[];
};

export function getPlatformAdminSalesResourceSections():
  PlatformAdminSalesResourceSection[] {
  return [
    {
      id: "playbooks",
      title: "Playbooks",
      description: "Internal guides for how Sigma sells and supports clinics.",
      items: [
        {
          id: "sales-playbook",
          label: "Sales playbook",
          description:
            "Prospecting, discovery, pilots, and CRM standards for the Sigma sales team.",
          icon: BookOpen,
          href: ROUTES.platformAdminSalesPlaybook,
          badge: "Internal",
        },
      ],
    },
  ];
}
