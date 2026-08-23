import type { AppIconName } from "@/components/icons/app-icon";
import {
  canAccessReports,
  filterNavigation,
  getModuleIcon,
  getModuleLabel,
  groupNavigationByModule,
  isMostSpecificNavItemActive,
  isNavItemActive,
  isReportsNavActive,
  isSettingsNavActive,
  sortModules,
} from "@/features/app-shell/constants/navigation-config";
import { ROUTES } from "@/constants/routes";

export type SidebarNavSection = "workspace" | "admin";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: AppIconName;
  isActive?: boolean;
  section?: SidebarNavSection;
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
  isPlatformAdmin = false,
): SidebarNavItem[] {
  const filtered = isPlatformAdmin
    ? []
    : filterNavigation(userGroups, { isTenantAdmin });
  const modules = groupNavigationByModule(filtered);
  const items: SidebarNavItem[] = [];

  for (const navItem of modules.General ?? []) {
    items.push({
      title: navItem.name,
      url: navItem.href,
      icon: navItem.icon,
      section: "workspace",
      isActive: isNavItemActive(pathname, navItem.href),
    });
  }

  for (const moduleName of sortModules(Object.keys(modules))) {
    const moduleItems = modules[moduleName] ?? [];
    if (moduleItems.length === 0) {
      continue;
    }

    const siblingHrefs = moduleItems.map((navItem) => navItem.href);
    const activeModuleItem = moduleItems.find((navItem) =>
      isMostSpecificNavItemActive(pathname, navItem.href, siblingHrefs),
    );

    items.push({
      title: getModuleLabel(moduleName),
      url: activeModuleItem?.href ?? moduleItems[0].href,
      icon: getModuleIcon(moduleName),
      section: "workspace",
      isActive: moduleItems.some((navItem) =>
        isNavItemActive(pathname, navItem.href),
      ),
      items: moduleItems.map((navItem) => ({
        title: navItem.name,
        url: navItem.href,
        isActive: isMostSpecificNavItemActive(
          pathname,
          navItem.href,
          siblingHrefs,
        ),
      })),
    });
  }

  const settingsItems = [
    {
      title: "Account",
      url: ROUTES.settingsAccount,
      isActive: isNavItemActive(pathname, ROUTES.settingsAccount),
    },
    {
      title: "Security",
      url: ROUTES.settingsSecurity,
      isActive: isNavItemActive(pathname, ROUTES.settingsSecurity),
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
            title: "User Management",
            url: ROUTES.settingsUserManagement,
            isActive: isNavItemActive(pathname, ROUTES.settingsUserManagement),
          },
          {
            title: "Modules",
            url: ROUTES.settingsModules,
            isActive:
              isNavItemActive(pathname, ROUTES.settingsModules) ||
              pathname.startsWith(`${ROUTES.settingsModules}/`),
          },
          {
            title: "Integrations",
            url: ROUTES.settingsIntegrations,
            isActive:
              isNavItemActive(pathname, ROUTES.settingsIntegrations) ||
              pathname.startsWith(`${ROUTES.settingsIntegrations}/`),
          },
        ]
      : []),
  ];

  if (isPlatformAdmin) {
    items.push({
      title: "Tenant operations",
      url: ROUTES.platformAdmin,
      icon: "shield",
      section: "admin",
      isActive:
        pathname === ROUTES.platformAdmin ||
        pathname.startsWith(`${ROUTES.platformAdminTenants}`),
      items: [
        {
          title: "Overview",
          url: ROUTES.platformAdmin,
          isActive: pathname === ROUTES.platformAdmin,
        },
        {
          title: "Tenants",
          url: ROUTES.platformAdminTenants,
          isActive:
            isNavItemActive(pathname, ROUTES.platformAdminTenants) ||
            pathname.startsWith(`${ROUTES.platformAdminTenants}/`),
        },
      ],
    });

    items.push({
      title: "Platform",
      url: ROUTES.platformAdminBackups,
      icon: "hardDrive",
      section: "admin",
      isActive: pathname.startsWith(`${ROUTES.platformAdmin}/backups`),
      items: [
        {
          title: "Backups",
          url: ROUTES.platformAdminBackups,
          isActive:
            pathname === ROUTES.platformAdminBackups ||
            pathname.startsWith(`${ROUTES.platformAdminBackups}/`),
        },
      ],
    });

    items.push({
      title: "Resources",
      url: ROUTES.platformAdminResourcesSales,
      icon: "book",
      section: "admin",
      isActive: pathname.startsWith(`${ROUTES.platformAdmin}/resources`),
      items: [
        {
          title: "Sales",
          url: ROUTES.platformAdminResourcesSales,
          isActive:
            isNavItemActive(pathname, ROUTES.platformAdminResourcesSales) ||
            pathname.startsWith(`${ROUTES.platformAdminResourcesSales}/`),
        },
      ],
    });
  }

  if (!isPlatformAdmin && canAccessReports(userGroups)) {
    items.push({
      title: "Reports & Insights",
      url: ROUTES.reportsOverview,
      icon: "analytics",
      section: "admin",
      isActive: isReportsNavActive(pathname),
      items: [
        {
          title: "Overview",
          url: ROUTES.reportsOverview,
          isActive: isNavItemActive(pathname, ROUTES.reportsOverview),
        },
        {
          title: "Analytics",
          url: ROUTES.reportsAnalytics,
          isActive: isNavItemActive(pathname, ROUTES.reportsAnalytics),
        },
        {
          title: "Today's appointments",
          url: ROUTES.reportsAppointmentsToday,
          isActive: isNavItemActive(pathname, ROUTES.reportsAppointmentsToday),
        },
        {
          title: "Reports",
          url: ROUTES.reportsExports,
          isActive: pathname === ROUTES.reportsExports,
        },
        {
          title: "Export history",
          url: ROUTES.reportsExportHistory,
          isActive: isNavItemActive(pathname, ROUTES.reportsExportHistory),
        },
      ],
    });
  }

  if (!isPlatformAdmin) {
    items.push({
      title: "Settings",
      url: ROUTES.settingsAccount,
      icon: "settings",
      section: "admin",
      isActive: isSettingsNavActive(pathname),
      items: settingsItems,
    });
  }

  return items;
}
