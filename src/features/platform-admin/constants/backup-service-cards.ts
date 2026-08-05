import type { LucideIcon } from "lucide-react";
import { Database, Server } from "lucide-react";

import { ROUTES } from "@/constants/routes";

export type PlatformBackupCard = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
};

export type PlatformBackupSection = {
  id: string;
  title: string;
  description?: string;
  items: PlatformBackupCard[];
};

export function getPlatformBackupSections(): PlatformBackupSection[] {
  return [
    {
      id: "services",
      title: "Services",
      description: "Backup catalogs stored in Cloudflare R2.",
      items: [
        {
          id: "hmis",
          label: "HMIS",
          description:
            "PostgreSQL database and Django media archives for the main HMIS platform.",
          icon: Database,
          href: ROUTES.platformAdminBackupsHmis,
        },
        {
          id: "claims-engine",
          label: "Claims engine",
          description:
            "MySQL database archives for the claims-engine / payer integration service.",
          icon: Server,
          href: ROUTES.platformAdminBackupsClaimsEngine,
          badge: "MySQL",
        },
      ],
    },
  ];
}
