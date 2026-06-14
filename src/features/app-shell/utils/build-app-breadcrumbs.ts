import { ROUTES } from "@/constants/routes";
import {
  getModuleLabel,
  isNavItemActive,
  isSettingsNavActive,
  navigation,
} from "@/features/app-shell/constants/navigation-config";

export type AppBreadcrumb = {
  label: string;
  href?: string;
};

export function applyPageLabelToCrumbs(
  crumbs: AppBreadcrumb[],
  pageLabel?: string | null,
): AppBreadcrumb[] {
  if (!pageLabel?.trim() || crumbs.length === 0) {
    return crumbs;
  }

  const next = [...crumbs];
  next[next.length - 1] = {
    ...next[next.length - 1],
    label: pageLabel.trim(),
  };

  return next;
}

function findNavItemByPathname(pathname: string) {
  return navigation.find(
    (item) =>
      item.enabledInWebNew && isNavItemActive(pathname, item.href),
  );
}

export function buildAppBreadcrumbs(pathname: string): AppBreadcrumb[] {
  if (isSettingsNavActive(pathname)) {
    if (pathname === ROUTES.settingsAccount) {
      return [{ label: "Settings" }, { label: "Account" }];
    }

    if (pathname === ROUTES.settingsOrganization) {
      return [{ label: "Settings" }, { label: "Organization" }];
    }

    if (pathname === ROUTES.settingsVisitManagement) {
      return [{ label: "Settings" }, { label: "Visit Management" }];
    }

    if (pathname === ROUTES.settingsFinanceOperations) {
      return [{ label: "Settings" }, { label: "Finance & Operations" }];
    }

    if (pathname === ROUTES.settingsUserManagement) {
      return [{ label: "Settings" }, { label: "User Management" }];
    }

    if (pathname === ROUTES.settingsModules) {
      return [{ label: "Settings" }, { label: "Modules" }];
    }

    if (pathname === ROUTES.settingsModuleInventory) {
      return [
        { label: "Settings" },
        { label: "Modules", href: ROUTES.settingsModules },
        { label: "Inventory" },
      ];
    }

    return [{ label: "Settings" }];
  }

  const navItem = findNavItemByPathname(pathname);

  if (navItem?.requiredGroup === "Registration") {
    if (pathname === ROUTES.customers) {
      return [
        { label: getModuleLabel("Registration") },
        { label: "Clients" },
      ];
    }

    return [
      { label: getModuleLabel("Registration") },
      { label: "Clients", href: ROUTES.customers },
      { label: "Client details" },
    ];
  }

  if (navItem?.requiredGroup === "Billing") {
    if (pathname === ROUTES.salesOrders) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Sales Orders" },
      ];
    }

    return [
      { label: getModuleLabel("Billing") },
      { label: "Sales Orders", href: ROUTES.salesOrders },
      { label: "Order details" },
    ];
  }

  if (navItem?.requiredGroup === "Inventory") {
    const inventoryListRoutes: Record<string, string> = {
      [ROUTES.inventoryStock]: "Stock",
      [ROUTES.inventoryProducts]: "Products",
      [ROUTES.inventoryPurchaseOrders]: "Purchase orders",
      [ROUTES.inventoryInternalOrders]: "Internal orders",
      [ROUTES.inventoryStockAdjustments]: "Stock adjustments",
      [ROUTES.inventoryMovements]: "Movements",
      [ROUTES.inventoryBatches]: "Batches",
    };

    const listHref = Object.keys(inventoryListRoutes).find((href) =>
      isNavItemActive(pathname, href),
    );
    const listLabel = listHref ? inventoryListRoutes[listHref] : navItem.name;

    if (pathname === listHref) {
      return [{ label: getModuleLabel("Inventory") }, { label: listLabel }];
    }

    return [
      { label: getModuleLabel("Inventory") },
      { label: listLabel, href: listHref },
      { label: "Details" },
    ];
  }

  if (navItem?.moduleName === "Therapy") {
    if (pathname === navItem.href) {
      return [{ label: "Therapy" }, { label: navItem.name }];
    }

    return [
      { label: "Therapy" },
      { label: navItem.name, href: navItem.href },
      { label: "Visit details" },
    ];
  }

  if (navItem) {
    const moduleLabel = navItem.requiredGroup
      ? getModuleLabel(navItem.requiredGroup)
      : undefined;

    if (moduleLabel) {
      return [
        { label: moduleLabel },
        { label: navItem.name },
      ];
    }

    return [{ label: navItem.name }];
  }

  const segment = pathname.split("/").filter(Boolean).at(-1);
  if (!segment) {
    return [{ label: "Home" }];
  }

  return [
    {
      label: segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    },
  ];
}
