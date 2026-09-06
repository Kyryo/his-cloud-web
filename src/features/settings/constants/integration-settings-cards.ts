import type { AppIconName } from "@/components/icons/app-icon";

import { ROUTES } from "@/constants/routes";

export type IntegrationSettingsItem = {
  id: string;
  label: string;
  description: string;
  icon: AppIconName;
  href: string;
  region?: string;
};

export type IntegrationSettingsSection = {
  id: string;
  title: string;
  description: string;
  items: IntegrationSettingsItem[];
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
          description:
            "SMTP delivery for appointment notifications and other outbound email.",
          icon: "notification",
          href: ROUTES.settingsIntegrationsEmail,
        },
      ],
    },
    {
      id: "insurance",
      title: "Insurance",
      description: "Connect payers and configure electronic claims for your region.",
      items: [
        {
          id: "masm-eclaims",
          label: "MASM eClaims",
          description:
            "Credentials, API endpoints, and practitioner mappings for claim submission.",
          icon: "shield",
          href: ROUTES.settingsIntegrationsMasemEclaims,
          region: "Malawi",
        },
      ],
    },
  ];
}
