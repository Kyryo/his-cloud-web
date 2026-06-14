import type { LucideIcon } from "lucide-react";
import { Mail } from "lucide-react";

import { ROUTES } from "@/constants/routes";

export type IntegrationSettingsCard = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

export function getIntegrationSettingsCards(): IntegrationSettingsCard[] {
  return [
    {
      id: "email",
      label: "Email Settings",
      description:
        "Configure SMTP delivery for appointment notifications and other outbound email.",
      icon: Mail,
      href: ROUTES.settingsIntegrationsEmail,
    },
  ];
}
