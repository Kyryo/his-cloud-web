import { ROUTES } from "@/constants/routes";
import { getModuleLabel } from "@/features/app-shell/constants/navigation-config";
import type { User } from "@/features/auth/types/auth.types";

/** Portal modules that can be entitled via TenantGroup.is_active.
 * Keep in sync with api/eportal/tenants/constants/portal_groups.py.
 */
export const PORTAL_MODULE_NAMES = [
  "Registration",
  "Billing",
  "Claims",
  "Inventory",
  "Dispensation",
  "Lab",
  "Radiology",
  "Dental",
  "Clinical",
  "OccupationalHealth",
  "Therapy",
] as const;

export type PortalModuleName = (typeof PORTAL_MODULE_NAMES)[number];

export function isPortalModuleName(value: string | null | undefined): value is PortalModuleName {
  return Boolean(value && (PORTAL_MODULE_NAMES as readonly string[]).includes(value));
}

export function isModuleEnabled(
  user: Pick<User, "enabled_modules"> | null | undefined,
  moduleName: string,
): boolean {
  return (user?.enabled_modules ?? []).includes(moduleName);
}

/**
 * Resolve which portal module (if any) owns a pathname for entitlement gating.
 */
export function resolvePortalModuleForPath(
  pathname: string,
): PortalModuleName | null {
  if (
    pathname === ROUTES.customers ||
    pathname.startsWith(`${ROUTES.customers}/`) ||
    pathname === ROUTES.appointments ||
    pathname.startsWith(`${ROUTES.appointments}/`) ||
    pathname === ROUTES.activeVisits ||
    pathname.startsWith(`${ROUTES.activeVisits}/`) ||
    pathname === ROUTES.referrals ||
    pathname.startsWith(`${ROUTES.referrals}/`) ||
    pathname.startsWith("/visits/")
  ) {
    return "Registration";
  }

  if (
    pathname === ROUTES.salesOrders ||
    pathname.startsWith(`${ROUTES.salesOrders}/`) ||
    pathname === ROUTES.invoices ||
    pathname.startsWith(`${ROUTES.invoices}/`) ||
    pathname === ROUTES.payments ||
    pathname.startsWith(`${ROUTES.payments}/`) ||
    pathname === ROUTES.receivables ||
    pathname.startsWith(`${ROUTES.receivables}/`) ||
    pathname === ROUTES.inventoryProducts ||
    pathname.startsWith(`${ROUTES.inventoryProducts}/`) ||
    pathname === ROUTES.inventoryPricelists ||
    pathname.startsWith(`${ROUTES.inventoryPricelists}/`)
  ) {
    return "Billing";
  }

  if (pathname === ROUTES.claims || pathname.startsWith(`${ROUTES.claims}/`)) {
    return "Claims";
  }

  if (
    pathname === ROUTES.pharmacyQueue ||
    pathname.startsWith(`${ROUTES.pharmacyQueue}/`) ||
    pathname === ROUTES.pharmacyHistory ||
    pathname.startsWith(`${ROUTES.pharmacyHistory}/`) ||
    pathname === ROUTES.settingsModulePharmacy ||
    pathname.startsWith(`${ROUTES.settingsModulePharmacy}/`)
  ) {
    return "Dispensation";
  }

  if (
    pathname.startsWith("/inventory/") ||
    pathname === ROUTES.settingsModuleInventory ||
    pathname.startsWith(`${ROUTES.settingsModuleInventory}/`)
  ) {
    return "Inventory";
  }

  if (
    pathname.startsWith("/lab-orders") ||
    pathname.startsWith("/lab/") ||
    pathname === ROUTES.labOrders ||
    pathname.startsWith(`${ROUTES.labOrders}/`) ||
    pathname === ROUTES.settingsModuleLaboratory ||
    pathname.startsWith(`${ROUTES.settingsModuleLaboratory}/`)
  ) {
    return "Lab";
  }

  if (
    pathname.startsWith("/radiology") ||
    pathname === ROUTES.settingsModule("radiology") ||
    pathname.startsWith(`${ROUTES.settingsModule("radiology")}/`)
  ) {
    return "Radiology";
  }

  if (
    pathname.startsWith("/dental") ||
    pathname === ROUTES.settingsModule("dental") ||
    pathname.startsWith(`${ROUTES.settingsModule("dental")}/`)
  ) {
    return "Dental";
  }

  if (
    pathname === ROUTES.clinicalOpd ||
    pathname.startsWith(`${ROUTES.clinicalOpd}/`) ||
    pathname === ROUTES.settingsModuleClinical ||
    pathname.startsWith(`${ROUTES.settingsModuleClinical}/`)
  ) {
    return "Clinical";
  }

  if (
    pathname === ROUTES.occupationalHealth ||
    pathname.startsWith(`${ROUTES.occupationalHealth}/`) ||
    pathname === ROUTES.settingsModuleOccupationalHealth ||
    pathname.startsWith(`${ROUTES.settingsModuleOccupationalHealth}/`)
  ) {
    return "OccupationalHealth";
  }

  if (
    pathname === ROUTES.therapyPhysio ||
    pathname.startsWith(`${ROUTES.therapyPhysio}/`) ||
    pathname === ROUTES.therapySpeech ||
    pathname.startsWith(`${ROUTES.therapySpeech}/`) ||
    pathname === ROUTES.therapyOccupational ||
    pathname.startsWith(`${ROUTES.therapyOccupational}/`) ||
    pathname.startsWith("/therapy/") ||
    pathname === ROUTES.settingsModule("therapy") ||
    pathname.startsWith(`${ROUTES.settingsModule("therapy")}/`)
  ) {
    return "Therapy";
  }

  if (
    pathname === ROUTES.settingsModuleRegistration ||
    pathname.startsWith(`${ROUTES.settingsModuleRegistration}/`)
  ) {
    return "Registration";
  }

  if (
    pathname === ROUTES.settingsModule("billing") ||
    pathname.startsWith(`${ROUTES.settingsModule("billing")}/`)
  ) {
    return "Billing";
  }

  if (
    pathname === ROUTES.settingsModule("claims") ||
    pathname.startsWith(`${ROUTES.settingsModule("claims")}/`)
  ) {
    return "Claims";
  }

  return null;
}

export function portalModuleDisplayName(moduleName: string): string {
  return getModuleLabel(moduleName);
}
