import { describe, expect, it } from "vitest";

import {
  toAnalytePayload,
  toLabPanelPayload,
  toLabSettingsPayload,
  toLabTestPayload,
  toReferenceRangePayload,
  toSpecimenTypePayload,
} from "@/features/laboratory/utils/catalog-payloads";

describe("catalog payloads", () => {
  it("maps specimen type values", () => {
    expect(
      toSpecimenTypePayload({
        code: "  SER  ",
        name: " Serum ",
        container: " tube ",
        volume: "5",
        volume_unit: "mL",
        handling_notes: " keep cool ",
      }),
    ).toEqual({
      code: "SER",
      name: "Serum",
      container: "tube",
      volume: "5",
      volume_unit: "mL",
      handling_notes: "keep cool",
    });
  });

  it("maps empty volume to null", () => {
    expect(
      toSpecimenTypePayload({
        code: "SER",
        name: "Serum",
        container: "",
        volume: "  ",
        volume_unit: "",
        handling_notes: "",
      }).volume,
    ).toBeNull();
  });

  it("maps analyte decimal_precision empty to null", () => {
    expect(
      toAnalytePayload({
        code: "GLU",
        name: "Glucose",
        loinc_code: "",
        value_type: "NUMERIC",
        unit: "mg/dL",
        decimal_precision: "",
        coded_options: [],
      }),
    ).toMatchObject({
      decimal_precision: null,
      unit: "mg/dL",
      coded_options: [],
    });

    expect(
      toAnalytePayload({
        code: "GLU",
        name: "Glucose",
        loinc_code: "",
        value_type: "NUMERIC",
        unit: "",
        decimal_precision: "2",
        coded_options: [],
      }).decimal_precision,
    ).toBe(2);
  });

  it("maps coded analyte options and clears numeric fields", () => {
    expect(
      toAnalytePayload({
        code: "ABO",
        name: "Blood group",
        loinc_code: "",
        value_type: "CODED",
        unit: "mg/dL",
        decimal_precision: "2",
        coded_options: [{ code: " A ", label: " Group A " }],
      }),
    ).toEqual({
      code: "ABO",
      name: "Blood group",
      loinc_code: "",
      value_type: "CODED",
      unit: "",
      decimal_precision: null,
      coded_options: [{ code: "A", label: "Group A" }],
    });
  });

  it("maps lab test nested analytes and optional uuids", () => {
    expect(
      toLabTestPayload({
        code: "CBC",
        name: "Complete blood count",
        category: "Hematology",
        product_uuid: "",
        turnaround_hours: "24",
        primary_specimen_type_uuid: "  ",
        analytes: [
          { analyte_uuid: "a1", sort_order: 0, is_required: true },
          { analyte_uuid: "a2", sort_order: 1, is_required: false },
        ],
      }),
    ).toEqual({
      code: "CBC",
      name: "Complete blood count",
      category: "Hematology",
      product_uuid: null,
      turnaround_hours: 24,
      primary_specimen_type_uuid: null,
      analytes: [
        { analyte_uuid: "a1", sort_order: 0, is_required: true },
        { analyte_uuid: "a2", sort_order: 1, is_required: false },
      ],
    });
  });

  it("maps panel nested tests", () => {
    expect(
      toLabPanelPayload({
        code: "PANEL1",
        name: "Basic panel",
        product_uuid: "prod-1",
        tests: [{ test_uuid: "t1", sort_order: 0 }],
      }),
    ).toEqual({
      code: "PANEL1",
      name: "Basic panel",
      product_uuid: "prod-1",
      tests: [{ test_uuid: "t1", sort_order: 0 }],
    });
  });

  it("maps reference range limits and dates", () => {
    expect(
      toReferenceRangePayload({
        analyte_uuid: "a1",
        specimen_type_uuid: "",
        sex: "ANY",
        age_min_days: "0",
        age_max_days: "",
        low_normal: "3.5",
        high_normal: "5.5",
        low_critical: "",
        high_critical: "",
        effective_from: "2026-01-01",
        effective_to: "",
        text_normal: "",
      }),
    ).toEqual({
      analyte_uuid: "a1",
      specimen_type_uuid: null,
      sex: "ANY",
      age_min_days: 0,
      age_max_days: null,
      low_normal: "3.5",
      high_normal: "5.5",
      low_critical: null,
      high_critical: null,
      effective_from: "2026-01-01",
      effective_to: null,
      text_normal: "",
    });
  });

  it("omits analyzer secret when blank", () => {
    const payload = toLabSettingsPayload({
      auto_accession_on_collect: true,
      require_verify_before_release: true,
      critical_notify_enabled: false,
      default_department_uuid: "",
      report_footer: "Footer",
      report_letterhead: "Letterhead",
      analyzer_ingest_enabled: true,
      analyzer_shared_secret_hash: "  ",
    });
    expect(payload.analyzer_shared_secret_hash).toBeUndefined();
    expect(payload.default_department_uuid).toBeNull();
    expect(payload.report_footer).toBe("Footer");
  });

  it("includes analyzer secret when provided", () => {
    expect(
      toLabSettingsPayload({
        auto_accession_on_collect: false,
        require_verify_before_release: true,
        critical_notify_enabled: true,
        default_department_uuid: "dept",
        report_footer: "",
        report_letterhead: "",
        analyzer_ingest_enabled: false,
        analyzer_shared_secret_hash: "super-secret",
      }).analyzer_shared_secret_hash,
    ).toBe("super-secret");
  });
});
