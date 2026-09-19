import { describe, expect, it } from "vitest";

import { analyteSchema } from "@/features/laboratory/schemas/analyte.schema";
import { labSettingsSchema } from "@/features/laboratory/schemas/lab-settings.schema";
import { labPanelSchema } from "@/features/laboratory/schemas/panel.schema";
import { referenceRangeSchema } from "@/features/laboratory/schemas/reference-range.schema";
import { specimenTypeSchema } from "@/features/laboratory/schemas/specimen-type.schema";
import { labTestSchema } from "@/features/laboratory/schemas/test.schema";

describe("catalog schemas", () => {
  it("parses a valid specimen type", () => {
    const parsed = specimenTypeSchema.parse({
      code: "SER",
      name: "Serum",
      container: "SST",
      volume: "5",
      volume_unit: "mL",
      handling_notes: "",
    });
    expect(parsed.code).toBe("SER");
  });

  it("rejects specimen type without name", () => {
    const result = specimenTypeSchema.safeParse({
      code: "SER",
      name: "",
      container: "",
      volume: "",
      volume_unit: "",
      handling_notes: "",
    });
    expect(result.success).toBe(false);
  });

  it("parses a valid analyte", () => {
    const parsed = analyteSchema.parse({
      code: "GLU",
      name: "Glucose",
      loinc_code: "2345-7",
      value_type: "NUMERIC",
      unit: "mg/dL",
      decimal_precision: "1",
    });
    expect(parsed.value_type).toBe("NUMERIC");
  });

  it("rejects invalid analyte value type", () => {
    const result = analyteSchema.safeParse({
      code: "GLU",
      name: "Glucose",
      loinc_code: "",
      value_type: "BOOLEAN",
      unit: "",
      decimal_precision: "",
    });
    expect(result.success).toBe(false);
  });

  it("parses reference range with required analyte and date", () => {
    const parsed = referenceRangeSchema.parse({
      analyte_uuid: "analyte-1",
      specimen_type_uuid: "",
      sex: "F",
      age_min_days: "",
      age_max_days: "",
      low_normal: "12",
      high_normal: "16",
      low_critical: "",
      high_critical: "",
      effective_from: "2026-01-01",
      effective_to: "",
      text_normal: "",
    });
    expect(parsed.sex).toBe("F");
  });

  it("rejects reference range without analyte", () => {
    const result = referenceRangeSchema.safeParse({
      analyte_uuid: "",
      specimen_type_uuid: "",
      sex: "ANY",
      age_min_days: "",
      age_max_days: "",
      low_normal: "",
      high_normal: "",
      low_critical: "",
      high_critical: "",
      effective_from: "2026-01-01",
      effective_to: "",
      text_normal: "",
    });
    expect(result.success).toBe(false);
  });

  it("parses test memberships with sort and required", () => {
    const parsed = labTestSchema.parse({
      code: "CBC",
      name: "CBC",
      category: "",
      product_uuid: "",
      turnaround_hours: "",
      primary_specimen_type_uuid: "",
      analytes: [
        { analyte_uuid: "a1", sort_order: 0, is_required: true },
        { analyte_uuid: "a2", sort_order: 1, is_required: false },
      ],
    });
    expect(parsed.analytes).toHaveLength(2);
  });

  it("parses panel memberships", () => {
    const parsed = labPanelSchema.parse({
      code: "P1",
      name: "Panel",
      product_uuid: "",
      tests: [{ test_uuid: "t1", sort_order: 0 }],
    });
    expect(parsed.tests[0]?.test_uuid).toBe("t1");
  });

  it("rejects an empty analyte code", () => {
    const result = analyteSchema.safeParse({
      code: " ",
      name: "Glucose",
      loinc_code: "",
      value_type: "NUMERIC",
      unit: "mg/dL",
      decimal_precision: "1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts lab settings toggles", () => {
    const result = labSettingsSchema.safeParse({
      auto_accession_on_collect: true,
      require_verify_before_release: true,
      critical_notify_enabled: false,
      default_department_uuid: "",
      report_footer: "Confidential",
      report_letterhead: "Acme Lab",
      analyzer_ingest_enabled: false,
      analyzer_shared_secret_hash: "",
    });
    expect(result.success).toBe(true);
  });
});
