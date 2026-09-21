import type { AppIconName } from "@/components/icons/app-icon";
import {
  getModuleIcon,
  getModuleLabel,
  moduleOrder,
} from "@/features/app-shell/constants/navigation-config";
import { ROUTES } from "@/constants/routes";

export type ModuleSettingsItem = {
  id: string;
  slug: string;
  label: string;
  description: string;
  icon: AppIconName;
  href: string;
  hasSettings: boolean;
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  Registration: "Client registration, visits, and front desk workflows.",
  Billing: "Sales orders, invoices, and payment configuration.",
  Claims: "Insurance claims, submissions, and remittance settings.",
  Orders: "Clinical and service order routing.",
  Dispensation: "Pharmacy dispensing and medication workflows.",
  Lab: "Laboratory orders, results, and catalog settings.",
  Radiology: "Imaging orders and reporting configuration.",
  Inventory: "Stock, purchasing, transfers, and approval workflows.",
  Dental: "Dental clinic charting and procedure settings.",
  Clinical: "Patient records and clinical documentation.",
  Therapy: "Therapy sessions, plans, and documentation settings.",
};

/** URL slug + whether the module has a real settings surface yet. */
const MODULE_SETTINGS_META: Record<
  string,
  { slug: string; hasSettings: boolean }
> = {
  Registration: { slug: "registration", hasSettings: false },
  Billing: { slug: "billing", hasSettings: false },
  Claims: { slug: "claims", hasSettings: false },
  Orders: { slug: "orders", hasSettings: false },
  Dispensation: { slug: "pharmacy", hasSettings: true },
  Lab: { slug: "laboratory", hasSettings: true },
  Radiology: { slug: "radiology", hasSettings: false },
  Inventory: { slug: "inventory", hasSettings: true },
  Dental: { slug: "dental", hasSettings: false },
  Clinical: { slug: "clinical", hasSettings: false },
  Therapy: { slug: "therapy", hasSettings: false },
};

function hrefForSlug(slug: string): string {
  if (slug === "inventory") {
    return ROUTES.settingsModuleInventory;
  }
  if (slug === "pharmacy") {
    return ROUTES.settingsModulePharmacy;
  }
  if (slug === "laboratory") {
    return ROUTES.settingsModuleLaboratory;
  }
  return ROUTES.settingsModule(slug);
}

export function getModuleSettingsItems(): ModuleSettingsItem[] {
  return moduleOrder.map((moduleId) => {
    const meta = MODULE_SETTINGS_META[moduleId] ?? {
      slug: moduleId.toLowerCase(),
      hasSettings: false,
    };

    return {
      id: moduleId,
      slug: meta.slug,
      label: getModuleLabel(moduleId),
      description:
        MODULE_DESCRIPTIONS[moduleId] ??
        `${getModuleLabel(moduleId)} settings.`,
      icon: getModuleIcon(moduleId),
      href: hrefForSlug(meta.slug),
      hasSettings: meta.hasSettings,
    };
  });
}

export function getModuleSettingsItemBySlug(
  slug: string,
): ModuleSettingsItem | undefined {
  return getModuleSettingsItems().find((item) => item.slug === slug);
}
