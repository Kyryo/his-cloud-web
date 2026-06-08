import { z } from "zod";

export const updateOrganizationClinicSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type UpdateOrganizationClinicFormValues = z.infer<
  typeof updateOrganizationClinicSchema
>;
