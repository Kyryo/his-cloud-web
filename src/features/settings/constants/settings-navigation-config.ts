import { ROUTES } from "@/constants/routes";

export type SettingsNavigationItem = {
  label: string;
  href: string;
  /** Match child routes (e.g. modules/*, integrations/*). */
  matchPrefix?: boolean;
  adminOnly?: boolean;
};

export type SettingsNavigationCategory = {
  label: string;
  items: SettingsNavigationItem[];
};

export const SETTINGS_WORKSPACE_DESCRIPTION =
  "Manage your organization, users, workflows, and integrations.";

const SETTINGS_NAV_CATEGORIES: SettingsNavigationCategory[] = [
  {
    label: "General",
    items: [
      {
        label: "Organization",
        href: ROUTES.settingsOrganization,
        adminOnly: true,
      },
      {
        label: "Account",
        href: ROUTES.settingsAccount,
      },
    ],
  },
  {
    label: "Security & Access",
    items: [
      {
        label: "Security",
        href: ROUTES.settingsSecurity,
      },
      {
        label: "User Management",
        href: ROUTES.settingsUserManagement,
        adminOnly: true,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Visit Management",
        href: ROUTES.settingsVisitManagement,
        adminOnly: true,
      },
      {
        label: "Client tags",
        href: ROUTES.settingsClientTags,
        adminOnly: true,
      },
      {
        label: "Finance & Operations",
        href: ROUTES.settingsFinanceOperations,
        adminOnly: true,
      },
      {
        label: "Modules",
        href: ROUTES.settingsModules,
        matchPrefix: true,
        adminOnly: true,
      },
    ],
  },
  {
    label: "EMR",
    items: [
      {
        label: "Providers",
        href: ROUTES.settingsClinicalProviders,
        adminOnly: true,
      },
      {
        label: "Clinical role capabilities",
        href: ROUTES.settingsClinicalRoleCapabilities,
        adminOnly: true,
      },
    ],
  },
  {
    label: "Integrations",
    items: [
      {
        label: "Integrations",
        href: ROUTES.settingsIntegrations,
        matchPrefix: true,
        adminOnly: true,
      },
    ],
  },
];

export function buildSettingsNavigation(
  isTenantAdmin: boolean,
): SettingsNavigationCategory[] {
  return SETTINGS_NAV_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.filter((item) => !item.adminOnly || isTenantAdmin),
  })).filter((category) => category.items.length > 0);
}

export function flattenSettingsNavigation(
  categories: SettingsNavigationCategory[],
): SettingsNavigationItem[] {
  return categories.flatMap((category) => category.items);
}

export function isSettingsNavigationItemActive(
  pathname: string,
  item: SettingsNavigationItem,
): boolean {
  if (item.matchPrefix) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return pathname === item.href;
}

export function findActiveSettingsNavigationItem(
  pathname: string,
  categories: SettingsNavigationCategory[],
): SettingsNavigationItem | undefined {
  for (const category of categories) {
    for (const item of category.items) {
      if (isSettingsNavigationItemActive(pathname, item)) {
        return item;
      }
    }
  }

  return undefined;
}
