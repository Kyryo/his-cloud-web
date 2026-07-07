import { ROUTES } from "@/constants/routes";
import {
  getModuleLabel,
  isNavItemActive,
  isReportsNavActive,
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

    if (pathname === ROUTES.settingsIntegrations) {
      return [{ label: "Settings" }, { label: "Integrations" }];
    }

    if (pathname === ROUTES.settingsIntegrationsEmail) {
      return [
        { label: "Settings" },
        { label: "Integrations", href: ROUTES.settingsIntegrations },
        { label: "Email Settings" },
      ];
    }

    if (pathname === ROUTES.settingsIntegrationsMasemEclaims) {
      return [
        { label: "Settings" },
        { label: "Integrations", href: ROUTES.settingsIntegrations },
        { label: "MASM eClaims" },
      ];
    }

    return [{ label: "Settings" }];
  }

  if (isReportsNavActive(pathname)) {
    if (pathname === ROUTES.reportsOverview) {
      return [{ label: "Reports & Insights" }, { label: "Overview" }];
    }
    if (pathname === ROUTES.reportsAnalytics) {
      return [{ label: "Reports & Insights" }, { label: "Analytics" }];
    }
    if (pathname === ROUTES.reportsExports) {
      return [{ label: "Reports & Insights" }, { label: "Reports" }];
    }
    if (pathname === ROUTES.reportsExportHistory) {
      return [{ label: "Reports & Insights" }, { label: "Export history" }];
    }
    return [{ label: "Reports & Insights" }];
  }

  const navItem = findNavItemByPathname(pathname);

  if (navItem?.requiredGroup === "Registration") {
    if (pathname === ROUTES.customers) {
      return [
        { label: getModuleLabel("Registration") },
        { label: "Clients" },
      ];
    }

    if (pathname === ROUTES.appointments) {
      return [
        { label: getModuleLabel("Registration") },
        { label: "Appointments" },
      ];
    }

    if (pathname === ROUTES.activeVisits) {
      return [
        { label: getModuleLabel("Registration") },
        { label: "Active Visits" },
      ];
    }

    if (pathname.startsWith("/visits/")) {
      return [
        { label: getModuleLabel("Registration") },
        { label: "Active Visits", href: ROUTES.activeVisits },
        { label: "Visit details" },
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

    if (pathname === ROUTES.invoices) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Invoices" },
      ];
    }

    if (pathname.startsWith(`${ROUTES.invoices}/`)) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Invoices", href: ROUTES.invoices },
        { label: "Invoice details" },
      ];
    }

    if (pathname === ROUTES.payments) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Payments" },
      ];
    }

    if (pathname.startsWith(`${ROUTES.payments}/`)) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Payments", href: ROUTES.payments },
        { label: "Payment details" },
      ];
    }

    if (pathname === ROUTES.inventoryProducts) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Products" },
      ];
    }

    if (pathname.startsWith(`${ROUTES.inventoryProducts}/`)) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Products", href: ROUTES.inventoryProducts },
        { label: "Product details" },
      ];
    }

    if (pathname === ROUTES.inventoryPricelists) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Pricelists" },
      ];
    }

    if (pathname.startsWith(`${ROUTES.inventoryPricelists}/`)) {
      return [
        { label: getModuleLabel("Billing") },
        { label: "Pricelists", href: ROUTES.inventoryPricelists },
        { label: "Pricelist details" },
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
