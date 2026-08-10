import { ROUTES } from "@/constants/routes";
import { getModuleLabel } from "@/features/app-shell/constants/navigation-config";
import type { User } from "@/features/auth/types/auth.types";

/** Portal modules that can be entitled via TenantGroup.is_active. */
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
    pathname.startsWith(`${ROUTES.pharmacyHistory}/`)
  ) {
    return "Dispensation";
  }

  if (pathname.startsWith("/inventory/")) {
    return "Inventory";
  }

  if (pathname.startsWith("/lab-orders")) {
    return "Lab";
  }

  return null;
}

export function portalModuleDisplayName(moduleName: string): string {
  return getModuleLabel(moduleName);
}
