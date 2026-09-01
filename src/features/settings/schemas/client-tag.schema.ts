import { z } from "zod";

export const clientTagSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(64),
  color: z
    .string()
    .trim()
    .regex(/^$|^#(?:[0-9A-Fa-f]{3}){1,2}$/, "Enter a valid hex color.")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ClientTagFormValues = z.infer<typeof clientTagSchema>;

export const clientTagDefaultValues: ClientTagFormValues = {
  name: "",
  color: "",
  description: "",
};
