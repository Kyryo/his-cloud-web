import { z } from "zod";

export const labPanelTestMembershipSchema = z.object({
  test_uuid: z.string().min(1),
  sort_order: z.number().int().min(0),
});

export const labPanelSchema = z.object({
  code: z.string().trim().min(1, "Code is required.").max(64),
  name: z.string().trim().min(1, "Name is required.").max(255),
  product_uuid: z.string().trim().optional().or(z.literal("")),
  tests: z.array(labPanelTestMembershipSchema),
});

export type LabPanelFormValues = z.infer<typeof labPanelSchema>;

export const labPanelDefaultValues: LabPanelFormValues = {
  code: "",
  name: "",
  product_uuid: "",
  tests: [],
};
