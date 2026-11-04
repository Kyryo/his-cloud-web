import type { AppIconName } from "@/components/icons/app-icon";
import { ROUTES } from "@/constants/routes";
import {
  canAccessReports,
  filterNavigation,
  groupNavigationByModule,
  isNavItemActive,
  sortModules,
  type NavigationItem,
} from "@/features/app-shell/constants/navigation-config";

export const OVERVIEW_QUICK_LINK_LIMIT = 8;
export const OVERVIEW_QUICK_LINK_PREVIEW = 4;
const LINKS_PER_MODULE = 2;

export type OverviewQuickLink = {
  href: string;
  /** Action shown on the overview card. */
  label: string;
  /** Nav name, used where a short page title is clearer than the action. */
  pageName: string;
  description: string;
  icon: AppIconName;
};

/** Display copy only. Access still comes from filterNavigation. */
const QUICK_LINK_DESCRIPTIONS: Record<string, string> = {
  [ROUTES.customers]: "Find or register a client",
  [ROUTES.appointments]: "See who is booked today",
  [ROUTES.activeVisits]: "Follow visits in progress",
  [ROUTES.referrals]: "Review incoming referrals",
  [ROUTES.salesOrders]: "Open and bill a sales order",
  [ROUTES.invoices]: "Review invoices and balances",
  [ROUTES.payments]: "Record or look up a payment",
  [ROUTES.receivables]: "See what is still outstanding",
  [ROUTES.inventoryProducts]: "Browse products and prices",
  [ROUTES.inventoryPricelists]: "Open a pricelist",
  [ROUTES.claims]: "Check claim submissions",
  [ROUTES.claimsRemittances]: "Review remittance batches",
  [ROUTES.claimsRejections]: "Work through rejections",
  [ROUTES.pharmacyQueue]: "Dispense the current queue",
  [ROUTES.pharmacyHistory]: "Look up past dispensations",
  [ROUTES.inventoryStock]: "Check stock on hand",
  [ROUTES.inventoryPurchaseOrders]: "Open purchase orders",
  [ROUTES.inventoryInternalOrders]: "Move stock between locations",
  [ROUTES.inventoryStockAdjustments]: "Review stock adjustments",
  [ROUTES.inventoryMovements]: "See recent stock movements",
  [ROUTES.inventoryBatches]: "Look up inventory batches",
  [ROUTES.labOrders]: "Open laboratory orders",
  [ROUTES.labSpecimenTypes]: "Manage specimen types",
  [ROUTES.labAnalytes]: "Review analytes",
  [ROUTES.labTests]: "Open the test catalog",
  [ROUTES.labPanels]: "Open laboratory panels",
  [ROUTES.clinicalOpd]: "See the outpatient queue",
  [ROUTES.occupationalHealth]: "Open the OHS queue",
  [ROUTES.occupationalHealthEmployees]: "Browse OHS employees",
  [ROUTES.occupationalHealthCompliance]: "Check compliance work",
  [ROUTES.occupationalHealthSurveillance]: "Review surveillance",
  [ROUTES.therapyPhysio]: "Open the physio queue",
  [ROUTES.therapyOccupational]: "Open the occupational therapy queue",
  [ROUTES.therapySpeech]: "Open the speech queue",
  [ROUTES.reportsAppointmentsToday]: "Today's appointment list",
  [ROUTES.reportsExports]: "Run or download a report",
  [ROUTES.reportsExportHistory]: "See previous exports",
};

/** Card titles. Display copy only; access still comes from filterNavigation. */
const QUICK_LINK_ACTIONS: Record<string, string> = {
  [ROUTES.customers]: "Register or view clients",
  [ROUTES.appointments]: "Book or view appointments",
  [ROUTES.activeVisits]: "Follow active visits",
  [ROUTES.referrals]: "Review referrals",
  [ROUTES.salesOrders]: "Create or view sales orders",
  [ROUTES.invoices]: "Review or send invoices",
  [ROUTES.payments]: "Record or view payments",
  [ROUTES.receivables]: "Check outstanding balances",
  [ROUTES.inventoryProducts]: "Browse products",
  [ROUTES.inventoryPricelists]: "Open a pricelist",
  [ROUTES.claims]: "Review claim submissions",
  [ROUTES.claimsRemittances]: "Review remittances",
  [ROUTES.claimsRejections]: "Work through rejections",
  [ROUTES.pharmacyQueue]: "Dispense from the queue",
  [ROUTES.pharmacyHistory]: "Look up dispensation history",
  [ROUTES.inventoryStock]: "Check stock on hand",
  [ROUTES.inventoryPurchaseOrders]: "Open purchase orders",
  [ROUTES.inventoryInternalOrders]: "Move stock between locations",
  [ROUTES.inventoryStockAdjustments]: "Adjust stock",
  [ROUTES.inventoryMovements]: "See stock movements",
  [ROUTES.inventoryBatches]: "Look up batches",
  [ROUTES.labOrders]: "Open lab orders",
  [ROUTES.labSpecimenTypes]: "Manage specimen types",
  [ROUTES.labAnalytes]: "Review analytes",
  [ROUTES.labTests]: "Open the test catalog",
  [ROUTES.labPanels]: "Open lab panels",
  [ROUTES.clinicalOpd]: "See the outpatient queue",
  [ROUTES.occupationalHealth]: "Open the OHS queue",
  [ROUTES.occupationalHealthEmployees]: "Browse OHS employees",
  [ROUTES.occupationalHealthCompliance]: "Check OHS compliance",
  [ROUTES.occupationalHealthSurveillance]: "Review surveillance",
  [ROUTES.therapyPhysio]: "Open the physio queue",
  [ROUTES.therapyOccupational]: "Open the OT queue",
  [ROUTES.therapySpeech]: "Open the speech queue",
  [ROUTES.reportsAppointmentsToday]: "See today's appointments",
  [ROUTES.reportsExports]: "Run or download a report",
  [ROUTES.reportsExportHistory]: "See previous exports",
};

const REPORT_LINKS: OverviewQuickLink[] = [
  {
    href: ROUTES.reportsAppointmentsToday,
    label: QUICK_LINK_ACTIONS[ROUTES.reportsAppointmentsToday],
    pageName: "Today's appointments",
    description: QUICK_LINK_DESCRIPTIONS[ROUTES.reportsAppointmentsToday],
    icon: "calendar",
  },
  {
    href: ROUTES.reportsExports,
    label: QUICK_LINK_ACTIONS[ROUTES.reportsExports],
    pageName: "Reports",
    description: QUICK_LINK_DESCRIPTIONS[ROUTES.reportsExports],
    icon: "analytics",
  },
  {
    href: ROUTES.reportsExportHistory,
    label: QUICK_LINK_ACTIONS[ROUTES.reportsExportHistory],
    pageName: "Export history",
    description: QUICK_LINK_DESCRIPTIONS[ROUTES.reportsExportHistory],
    icon: "clipboard",
  },
];

function toQuickLink(item: NavigationItem): OverviewQuickLink {
  const action =
    QUICK_LINK_ACTIONS[item.href] ?? `Open ${item.name.toLowerCase()}`;
  return {
    href: item.href,
    label: action,
    pageName: item.name,
    description: QUICK_LINK_DESCRIPTIONS[item.href] ?? action,
    icon: item.icon,
  };
}

export function buildOverviewQuickLinks(
  userGroups: string[],
  enabledModules: string[],
): OverviewQuickLink[] {
  const visible = filterNavigation(userGroups, { enabledModules });
  const grouped = groupNavigationByModule(visible);
  const selected: NavigationItem[] = [];

  for (const moduleName of sortModules(Object.keys(grouped))) {
    selected.push(...(grouped[moduleName] ?? []).slice(0, LINKS_PER_MODULE));
    if (selected.length >= OVERVIEW_QUICK_LINK_LIMIT) {
      break;
    }
  }

  const links = selected.slice(0, OVERVIEW_QUICK_LINK_LIMIT).map(toQuickLink);

  if (canAccessReports(userGroups)) {
    for (const report of REPORT_LINKS.slice(0, LINKS_PER_MODULE)) {
      if (links.length >= OVERVIEW_QUICK_LINK_LIMIT) {
        break;
      }
      links.push(report);
    }
  }

  return links;
}

export function visibleWorkspaceHrefs(
  userGroups: string[],
  enabledModules: string[],
): Set<string> {
  const hrefs = new Set(
    filterNavigation(userGroups, { enabledModules }).map((item) => item.href),
  );

  if (canAccessReports(userGroups)) {
    for (const report of REPORT_LINKS) {
      hrefs.add(report.href);
    }
  }

  return hrefs;
}

export function workspaceAreaDetails(
  href: string,
  userGroups: string[],
  enabledModules: string[],
): OverviewQuickLink {
  const item = filterNavigation(userGroups, { enabledModules }).find(
    (entry) => entry.href === href,
  );
  if (item) {
    return toQuickLink(item);
  }

  const report = REPORT_LINKS.find((entry) => entry.href === href);
  if (report) {
    return report;
  }

  return {
    href,
    label: href,
    pageName: href,
    description: "",
    icon: "file",
  };
}

export function workspaceAreaLabel(
  href: string,
  userGroups: string[],
  enabledModules: string[],
): string {
  return workspaceAreaDetails(href, userGroups, enabledModules).pageName;
}

function mostSpecificHref(pathname: string, hrefs: string[]) {
  const matches = hrefs.filter((href) => isNavItemActive(pathname, href));
  if (matches.length === 0) {
    return null;
  }

  return matches.reduce((best, href) => (href.length > best.length ? href : best));
}

/** Nav href to record for this pathname, or null when the page is not a workspace area. */
export function resolveWorkspaceAreaHref(
  pathname: string,
  userGroups: string[],
  enabledModules: string[],
): string | null {
  if (!pathname || pathname === ROUTES.overview) {
    return null;
  }

  return mostSpecificHref(
    pathname,
    [...visibleWorkspaceHrefs(userGroups, enabledModules)],
  );
}
