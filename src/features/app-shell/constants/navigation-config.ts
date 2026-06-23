import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Calendar,
  CalendarClock,
  ClipboardList,
  Dumbbell,
  FileText,
  FlaskConical,
  HeartPulse,
  Home,
  Hospital,
  Layers,
  Package,
  Pill,
  Receipt,
  Shuffle,
  Store,
  TestTube,
  User,
  Users,
  Wallet,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

export type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  requiredGroup: string | null;
  moduleName?: string;
  enabledInWebNew: boolean;
};

export const moduleDisplayNames: Record<string, string> = {
  Registration: "Front Desk",
  Dental: "Dental Clinic",
  Billing: "Billing",
  Orders: "Orders",
  Dispensation: "Pharmacy",
  Lab: "Laboratory",
  Radiology: "Radiology",
  Inventory: "Inventory",
  Clinical: "Clinical",
  Therapy: "Therapy",
};

export const moduleIcons: Record<string, LucideIcon> = {
  Registration: User,
  Billing: Wallet,
  Orders: Shuffle,
  Dispensation: Pill,
  Lab: TestTube,
  Radiology: HeartPulse,
  Inventory: Store,
  Dental: Users,
  Clinical: Hospital,
  Therapy: Dumbbell,
};

export const moduleOrder = [
  "Registration",
  "Billing",
  "Orders",
  "Dispensation",
  "Lab",
  "Radiology",
  "Inventory",
  "Dental",
  "Clinical",
  "Therapy",
] as const;

/** Mirrors web-old navigation; only enabled routes appear in web-new for now. */
export const navigation: NavigationItem[] = [
  {
    name: "Clients",
    href: ROUTES.customers,
    icon: User,
    requiredGroup: "Registration",
    enabledInWebNew: true,
  },
  {
    name: "Appointments",
    href: ROUTES.appointments,
    icon: CalendarClock,
    requiredGroup: "Registration",
    enabledInWebNew: true,
  },
  {
    name: "Active Visits",
    href: ROUTES.activeVisits,
    icon: Calendar,
    requiredGroup: "Registration",
    enabledInWebNew: true,
  },
  {
    name: "Sales Orders",
    href: ROUTES.salesOrders,
    icon: FileText,
    requiredGroup: "Billing",
    enabledInWebNew: true,
  },
  {
    name: "Invoices",
    href: ROUTES.invoices,
    icon: Receipt,
    requiredGroup: "Billing",
    enabledInWebNew: true,
  },
  {
    name: "Payments",
    href: ROUTES.payments,
    icon: Wallet,
    requiredGroup: "Billing",
    enabledInWebNew: true,
  },
  {
    name: "Products",
    href: ROUTES.inventoryProducts,
    icon: Package,
    requiredGroup: "Billing",
    enabledInWebNew: true,
  },
  {
    name: "Pricelists",
    href: ROUTES.inventoryPricelists,
    icon: Receipt,
    requiredGroup: "Billing",
    enabledInWebNew: true,
  },
  {
    name: "Inventory Register",
    href: ROUTES.inventoryStock,
    icon: Store,
    requiredGroup: "Inventory",
    enabledInWebNew: true,
  },
  {
    name: "Purchase Orders",
    href: ROUTES.inventoryPurchaseOrders,
    icon: FileText,
    requiredGroup: "Inventory",
    enabledInWebNew: true,
  },
  {
    name: "Internal Orders",
    href: ROUTES.inventoryInternalOrders,
    icon: Shuffle,
    requiredGroup: "Inventory",
    enabledInWebNew: true,
  },
  {
    name: "Inventory Adjustments",
    href: ROUTES.inventoryStockAdjustments,
    icon: ClipboardList,
    requiredGroup: "Inventory",
    enabledInWebNew: true,
  },
  {
    name: "Movements",
    href: ROUTES.inventoryMovements,
    icon: ArrowLeftRight,
    requiredGroup: "Inventory",
    enabledInWebNew: true,
  },
  {
    name: "Batches",
    href: ROUTES.inventoryBatches,
    icon: Layers,
    requiredGroup: "Inventory",
    enabledInWebNew: true,
  },
  {
    name: "Laboratory",
    href: "/lab-orders",
    icon: FlaskConical,
    requiredGroup: "Lab",
    enabledInWebNew: false,
  },
  {
    name: "Patient File",
    href: "/patients",
    icon: FileText,
    requiredGroup: "Clinical",
    enabledInWebNew: false,
  },
  {
    name: "Physio Queue",
    href: ROUTES.therapyPhysio,
    icon: Dumbbell,
    requiredGroup: "Physio",
    moduleName: "Therapy",
    enabledInWebNew: true,
  },
  {
    name: "OT Queue",
    href: ROUTES.therapyOccupational,
    icon: Dumbbell,
    requiredGroup: "Occupational",
    moduleName: "Therapy",
    enabledInWebNew: true,
  },
  {
    name: "Speech Queue",
    href: ROUTES.therapySpeech,
    icon: Dumbbell,
    requiredGroup: "Speech",
    moduleName: "Therapy",
    enabledInWebNew: true,
  },
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
    requiredGroup: null,
    enabledInWebNew: false,
  },
];

export function isNavItemActive(pathname: string, itemHref: string) {
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

export function isSettingsNavActive(pathname: string) {
  return pathname === ROUTES.settings || pathname.startsWith(`${ROUTES.settings}/`);
}

export function hasNavAccess(item: NavigationItem, userGroups: string[]) {
  if (!item.enabledInWebNew) {
    return false;
  }
  if (!item.requiredGroup) {
    return true;
  }
  return userGroups.includes(item.requiredGroup);
}

export function filterNavigation(userGroups: string[]) {
  const groups = userGroups.length > 0 ? userGroups : ["Registration"];

  return navigation.filter((item) => hasNavAccess(item, groups));
}

export function groupNavigationByModule(items: NavigationItem[]) {
  return items.reduce<Record<string, NavigationItem[]>>((acc, item) => {
    const moduleName = item.moduleName || item.requiredGroup || "General";
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(item);
    return acc;
  }, {});
}

export function sortModules(moduleNames: string[]) {
  return moduleNames
    .filter((name) => name !== "General")
    .sort((a, b) => {
      const indexA = moduleOrder.indexOf(a as (typeof moduleOrder)[number]);
      const indexB = moduleOrder.indexOf(b as (typeof moduleOrder)[number]);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
}

export function getModuleLabel(moduleName: string) {
  return moduleDisplayNames[moduleName] ?? moduleName;
}

export function getModuleIcon(moduleName: string) {
  return moduleIcons[moduleName] ?? Store;
}

export function filterNavigationByQuery(
  modules: Record<string, NavigationItem[]>,
  availableModules: string[],
  query: string,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { modules, availableModules, hasResults: true };
  }

  const filteredModules: Record<string, NavigationItem[]> = {};
  const filteredModuleNames: string[] = [];

  for (const moduleName of availableModules) {
    const items = modules[moduleName] || [];
    const label = getModuleLabel(moduleName).toLowerCase();
    const matchedItems = items.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        item.href.toLowerCase().includes(normalized) ||
        label.includes(normalized) ||
        moduleName.toLowerCase().includes(normalized),
    );

    if (matchedItems.length > 0) {
      filteredModules[moduleName] = matchedItems;
      filteredModuleNames.push(moduleName);
    }
  }

  const generalItems = (modules.General || []).filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.href.toLowerCase().includes(normalized),
  );

  if (generalItems.length > 0) {
    filteredModules.General = generalItems;
  }

  return {
    modules: filteredModules,
    availableModules: filteredModuleNames,
    hasResults:
      filteredModuleNames.length > 0 || (filteredModules.General?.length ?? 0) > 0,
  };
}
