import { z } from "zod";

export const organizationGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required"),
});

export type OrganizationGroupFormValues = z.infer<typeof organizationGroupSchema>;

export const organizationGroupDefaultValues: OrganizationGroupFormValues = {
  name: "",
};

export function toCreateOrganizationGroupPayload(
  values: OrganizationGroupFormValues,
) {
  return {
    name: values.name.trim(),
  };
}

export function toUpdateOrganizationGroupPayload(
  values: OrganizationGroupFormValues,
) {
  return {
    name: values.name.trim(),
  };
}
