import type { LucideIcon } from "lucide-react";
import { Mail, ShieldCheck } from "lucide-react";

import { ROUTES } from "@/constants/routes";

export type IntegrationSettingsCard = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
};

export type IntegrationSettingsSection = {
  id: string;
  title: string;
  description?: string;
  items: IntegrationSettingsCard[];
};

export function getIntegrationSettingsSections(): IntegrationSettingsSection[] {
  return [
    {
      id: "communication",
      title: "Communication",
      description: "Outbound messaging and notifications.",
      items: [
        {
          id: "email",
          label: "Email",
          description: "SMTP delivery for appointment notifications and other outbound email.",
          icon: Mail,
          href: ROUTES.settingsIntegrationsEmail,
        },
      ],
    },
    {
      id: "insurance",
      title: "Insurance integrations",
      description: "Connect payers and configure electronic claims for your region.",
      items: [
        {
          id: "masm-eclaims",
          label: "MASM eClaims",
          description:
            "Credentials, API endpoints, and practitioner mappings for MASM claim submission.",
          icon: ShieldCheck,
          href: ROUTES.settingsIntegrationsMasemEclaims,
          badge: "Malawi",
        },
      ],
    },
  ];
}
