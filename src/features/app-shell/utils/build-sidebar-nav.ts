import type { LucideIcon } from "lucide-react";
import { Settings } from "lucide-react";

import {
  filterNavigation,
  getModuleIcon,
  getModuleLabel,
  groupNavigationByModule,
  isNavItemActive,
  isSettingsNavActive,
  sortModules,
} from "@/features/app-shell/constants/navigation-config";
import { ROUTES } from "@/constants/routes";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
    isActive?: boolean;
  }>;
};

export function buildSidebarNavItems(
  userGroups: string[],
  pathname: string,
  isTenantAdmin = false,
): SidebarNavItem[] {
  const filtered = filterNavigation(userGroups);
  const modules = groupNavigationByModule(filtered);
  const items: SidebarNavItem[] = [];

  for (const navItem of modules.General ?? []) {
    items.push({
      title: navItem.name,
      url: navItem.href,
      icon: navItem.icon,
      isActive: isNavItemActive(pathname, navItem.href),
    });
  }

  for (const moduleName of sortModules(Object.keys(modules))) {
    const moduleItems = modules[moduleName] ?? [];
    if (moduleItems.length === 0) {
      continue;
    }

    items.push({
      title: getModuleLabel(moduleName),
      url: moduleItems[0].href,
      icon: getModuleIcon(moduleName),
      isActive: moduleItems.some((navItem) =>
        isNavItemActive(pathname, navItem.href),
      ),
      items: moduleItems.map((navItem) => ({
        title: navItem.name,
        url: navItem.href,
        isActive: isNavItemActive(pathname, navItem.href),
      })),
    });
  }

  const settingsItems = [
    {
      title: "Account",
      url: ROUTES.settingsAccount,
      isActive: isNavItemActive(pathname, ROUTES.settingsAccount),
    },
    ...(isTenantAdmin
      ? [
          {
            title: "Organization",
            url: ROUTES.settingsOrganization,
            isActive: isNavItemActive(pathname, ROUTES.settingsOrganization),
          },
          {
            title: "Visit Management",
            url: ROUTES.settingsVisitManagement,
            isActive: isNavItemActive(pathname, ROUTES.settingsVisitManagement),
          },
          {
            title: "Finance & Operations",
            url: ROUTES.settingsFinanceOperations,
            isActive: isNavItemActive(pathname, ROUTES.settingsFinanceOperations),
          },
          {
            title: "User management",
            url: ROUTES.settingsUserManagement,
            isActive: isNavItemActive(pathname, ROUTES.settingsUserManagement),
          },
        ]
      : []),
  ];

  items.push({
    title: "Settings",
    url: ROUTES.settingsAccount,
    icon: Settings,
    isActive: isSettingsNavActive(pathname),
    items: settingsItems,
  });

  return items;
}
