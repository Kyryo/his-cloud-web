import type { AppIconName } from "@/components/icons/app-icon";
import { ROUTES } from "@/constants/routes";

export type SettingsNavigationItem = {
  label: string;
  href: string;
  icon: AppIconName;
  /** Match child routes (e.g. modules/*, integrations/*). */
  matchPrefix?: boolean;
  adminOnly?: boolean;
};

export type SettingsNavigationCategory = {
  label: string;
  items: SettingsNavigationItem[];
};

const SETTINGS_BREADCRUMB_OVERRIDES: Record<string, string> = {
  [ROUTES.settingsModuleInventory]: "Inventory",
  [ROUTES.settingsModulePharmacy]: "Pharmacy",
  [ROUTES.settingsIntegrationsEmail]: "Email",
  [ROUTES.settingsIntegrationsMasemEclaims]: "MASM eClaims",
};

const SETTINGS_NAV_CATEGORIES: SettingsNavigationCategory[] = [
  {
    label: "Account",
    items: [
      {
        label: "Account",
        href: ROUTES.settingsAccount,
        icon: "user",
      },
      {
        label: "Security",
        href: ROUTES.settingsSecurity,
        icon: "shield",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        label: "Organization",
        href: ROUTES.settingsOrganization,
        icon: "building",
        adminOnly: true,
      },
      {
        label: "User Management",
        href: ROUTES.settingsUserManagement,
        icon: "users",
        adminOnly: true,
      },
      {
        label: "Visit Management",
        href: ROUTES.settingsVisitManagement,
        icon: "calendar",
        adminOnly: true,
      },
      {
        label: "Client tags",
        href: ROUTES.settingsClientTags,
        icon: "tag",
        adminOnly: true,
      },
      {
        label: "Finance & Operations",
        href: ROUTES.settingsFinanceOperations,
        icon: "wallet",
        adminOnly: true,
      },
      {
        label: "Modules",
        href: ROUTES.settingsModules,
        icon: "layers",
        matchPrefix: true,
        adminOnly: true,
      },
      {
        label: "Providers",
        href: ROUTES.settingsClinicalProviders,
        icon: "stethoscope",
        adminOnly: true,
      },
      {
        label: "Clinical role capabilities",
        href: ROUTES.settingsClinicalRoleCapabilities,
        icon: "clipboard",
        adminOnly: true,
      },
      {
        label: "Integrations",
        href: ROUTES.settingsIntegrations,
        icon: "plug",
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

export function resolveSettingsBreadcrumbLabel(
  pathname: string,
  categories: SettingsNavigationCategory[],
): string {
  const path = pathname.split("?")[0] ?? pathname;
  const override = SETTINGS_BREADCRUMB_OVERRIDES[path];
  if (override) {
    return override;
  }

  return findActiveSettingsNavigationItem(pathname, categories)?.label ?? "Settings";
}
