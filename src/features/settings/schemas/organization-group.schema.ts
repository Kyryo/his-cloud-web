import { z } from "zod";

import {
  isPortalGroupName,
  type PortalGroupName,
} from "@/constants/portal-groups";

export const organizationGroupSchema = z.object({
  name: z
    .string({ required_error: "Select a group" })
    .trim()
    .min(1, "Select a group")
    .refine((value): value is PortalGroupName => isPortalGroupName(value), {
      message: "Select a valid portal group",
    }),
});

export type OrganizationGroupFormValues = z.infer<typeof organizationGroupSchema>;

export const organizationGroupDefaultValues: OrganizationGroupFormValues = {
  name: "" as PortalGroupName,
};

export function toCreateOrganizationGroupPayload(
  values: OrganizationGroupFormValues,
) {
  return {
    name: values.name,
  };
}

export function toUpdateOrganizationGroupPayload(
  values: OrganizationGroupFormValues,
) {
  return {
    name: values.name,
  };
}
