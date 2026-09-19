import { z } from "zod";

export const labTestAnalyteMembershipSchema = z.object({
  analyte_uuid: z.string().min(1),
  sort_order: z.number().int().min(0),
  is_required: z.boolean(),
});

export const labTestSchema = z.object({
  code: z.string().trim().min(1, "Code is required.").max(64),
  name: z.string().trim().min(1, "Name is required.").max(255),
  category: z.string().trim().max(128).optional().or(z.literal("")),
  product_uuid: z.string().trim().optional().or(z.literal("")),
  turnaround_hours: z.string().trim().optional().or(z.literal("")),
  primary_specimen_type_uuid: z.string().trim().optional().or(z.literal("")),
  analytes: z.array(labTestAnalyteMembershipSchema),
});

export type LabTestFormValues = z.infer<typeof labTestSchema>;

export const labTestDefaultValues: LabTestFormValues = {
  code: "",
  name: "",
  category: "",
  product_uuid: "",
  turnaround_hours: "",
  primary_specimen_type_uuid: "",
  analytes: [],
};
