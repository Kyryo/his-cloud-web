/** Portal Auth group catalog — keep in sync with api/eportal/tenants/constants/portal_groups.py */

export const PORTAL_GROUP_OPTIONS = [
  { name: "Registration", label: "Front Desk" },
  { name: "Billing", label: "Billing" },
  { name: "Claims", label: "Claims" },
  { name: "Inventory", label: "Inventory" },
  { name: "Dispensation", label: "Pharmacy" },
  { name: "Lab", label: "Laboratory" },
  { name: "Radiology", label: "Radiology" },
  { name: "Dental", label: "Dental" },
  { name: "Clinical", label: "Clinical" },
] as const;

export type PortalGroupName = (typeof PORTAL_GROUP_OPTIONS)[number]["name"];

export const PORTAL_GROUP_NAMES: PortalGroupName[] = PORTAL_GROUP_OPTIONS.map(
  (option) => option.name,
);

export function isPortalGroupName(value: string): value is PortalGroupName {
  return (PORTAL_GROUP_NAMES as string[]).includes(value);
}

export function portalGroupLabel(name: string): string {
  return (
    PORTAL_GROUP_OPTIONS.find((option) => option.name === name)?.label ?? name
  );
}
