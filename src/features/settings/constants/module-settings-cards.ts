import type { AppIconName } from "@/components/icons/app-icon";
import {
  getModuleIcon,
  getModuleLabel,
  moduleOrder,
} from "@/features/app-shell/constants/navigation-config";
import { ROUTES } from "@/constants/routes";

export type ModuleSettingsItem = {
  id: string;
  label: string;
  description: string;
  icon: AppIconName;
  href?: string;
  comingSoon?: boolean;
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

export function getModuleSettingsItems(): ModuleSettingsItem[] {
  return moduleOrder.map((moduleId) => {
    const isInventory = moduleId === "Inventory";
    const isPharmacy = moduleId === "Dispensation";

    return {
      id: moduleId,
      label: getModuleLabel(moduleId),
      description:
        MODULE_DESCRIPTIONS[moduleId] ??
        `${getModuleLabel(moduleId)} settings.`,
      icon: getModuleIcon(moduleId),
      href: isInventory
        ? ROUTES.settingsModuleInventory
        : isPharmacy
          ? ROUTES.settingsModulePharmacy
          : undefined,
      comingSoon: !isInventory && !isPharmacy,
    };
  });
}
