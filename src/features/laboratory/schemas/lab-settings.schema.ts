import { z } from "zod";

export const labSettingsSchema = z.object({
  auto_accession_on_collect: z.boolean(),
  require_verify_before_release: z.boolean(),
  critical_notify_enabled: z.boolean(),
  default_department_uuid: z.string().trim().optional().or(z.literal("")),
  report_footer: z.string().optional().or(z.literal("")),
  report_letterhead: z.string().optional().or(z.literal("")),
  analyzer_ingest_enabled: z.boolean(),
  analyzer_shared_secret_hash: z.string().optional().or(z.literal("")),
});

export type LabSettingsFormValues = z.infer<typeof labSettingsSchema>;

export const labSettingsDefaultValues: LabSettingsFormValues = {
  auto_accession_on_collect: true,
  require_verify_before_release: true,
  critical_notify_enabled: true,
  default_department_uuid: "",
  report_footer: "",
  report_letterhead: "",
  analyzer_ingest_enabled: false,
  analyzer_shared_secret_hash: "",
};
