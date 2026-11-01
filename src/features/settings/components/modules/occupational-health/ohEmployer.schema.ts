import { z } from "zod";

export const ohEmployerFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the employer name").max(255),
  code: z.string().trim().max(64),
  registrationNumber: z.string().trim().max(64),
});

export type OhEmployerFormInput = z.input<typeof ohEmployerFormSchema>;
export type OhEmployerFormValues = z.output<typeof ohEmployerFormSchema>;
