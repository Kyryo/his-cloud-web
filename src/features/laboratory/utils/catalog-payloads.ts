import type { AnalyteFormValues } from "@/features/laboratory/schemas/analyte.schema";
import type { LabPanelFormValues } from "@/features/laboratory/schemas/panel.schema";
import type { LabSettingsFormValues } from "@/features/laboratory/schemas/lab-settings.schema";
import type { ReferenceRangeFormValues } from "@/features/laboratory/schemas/reference-range.schema";
import type { SpecimenTypeFormValues } from "@/features/laboratory/schemas/specimen-type.schema";
import type { LabTestFormValues } from "@/features/laboratory/schemas/test.schema";
import type {
  LabAnalyteWritePayload,
  LabPanelWritePayload,
  LabReferenceRangeWritePayload,
  LabSpecimenTypeWritePayload,
  LabTenantSettingsWritePayload,
  LabTestWritePayload,
} from "@/features/laboratory/types/laboratory-catalog.types";
import {
  emptyToNull,
  parseOptionalDecimal,
  parseOptionalInt,
} from "@/features/laboratory/utils/catalog-form-utils";

export function toSpecimenTypePayload(
  values: SpecimenTypeFormValues,
): LabSpecimenTypeWritePayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    container: values.container?.trim() ?? "",
    volume: parseOptionalDecimal(values.volume),
    volume_unit: values.volume_unit?.trim() ?? "",
    handling_notes: values.handling_notes?.trim() ?? "",
  };
}

export function toAnalytePayload(
  values: AnalyteFormValues,
): LabAnalyteWritePayload {
  const valueType = values.value_type;
  const payload: LabAnalyteWritePayload = {
    code: values.code.trim(),
    name: values.name.trim(),
    loinc_code: values.loinc_code?.trim() ?? "",
    value_type: valueType,
  };

  if (valueType === "NUMERIC") {
    payload.unit = values.unit?.trim() ?? "";
    payload.decimal_precision = parseOptionalInt(values.decimal_precision);
    payload.coded_options = [];
  } else if (valueType === "CODED") {
    payload.unit = "";
    payload.decimal_precision = null;
    payload.coded_options = values.coded_options.map((option) => ({
      code: option.code.trim(),
      label: option.label.trim(),
    }));
  } else {
    payload.unit = "";
    payload.decimal_precision = null;
    payload.coded_options = [];
  }

  return payload;
}

export function toLabTestPayload(
  values: LabTestFormValues,
): LabTestWritePayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    category: values.category?.trim() ?? "",
    product_uuid: emptyToNull(values.product_uuid),
    turnaround_hours: parseOptionalInt(values.turnaround_hours),
    primary_specimen_type_uuid: emptyToNull(values.primary_specimen_type_uuid),
    analytes: values.analytes.map((row, index) => ({
      analyte_uuid: row.analyte_uuid,
      sort_order: row.sort_order ?? index,
      is_required: row.is_required,
    })),
  };
}

export function toLabPanelPayload(
  values: LabPanelFormValues,
  options?: { includeTests?: boolean },
): LabPanelWritePayload {
  const payload: LabPanelWritePayload = {
    code: values.code.trim(),
    name: values.name.trim(),
    product_uuid: emptyToNull(values.product_uuid),
  };
  if (options?.includeTests !== false) {
    payload.tests = values.tests.map((row, index) => ({
      test_uuid: row.test_uuid,
      sort_order: row.sort_order ?? index,
    }));
  }
  return payload;
}

export function toReferenceRangePayload(
  values: ReferenceRangeFormValues,
): LabReferenceRangeWritePayload {
  return {
    analyte_uuid: values.analyte_uuid.trim(),
    specimen_type_uuid: emptyToNull(values.specimen_type_uuid),
    sex: values.sex,
    age_min_days: parseOptionalInt(values.age_min_days),
    age_max_days: parseOptionalInt(values.age_max_days),
    low_normal: parseOptionalDecimal(values.low_normal),
    high_normal: parseOptionalDecimal(values.high_normal),
    low_critical: parseOptionalDecimal(values.low_critical),
    high_critical: parseOptionalDecimal(values.high_critical),
    effective_from: values.effective_from.trim(),
    effective_to: emptyToNull(values.effective_to),
    text_normal: values.text_normal?.trim() ?? "",
  };
}

export function toLabSettingsPayload(
  values: LabSettingsFormValues,
): LabTenantSettingsWritePayload {
  const payload: LabTenantSettingsWritePayload = {
    auto_accession_on_collect: values.auto_accession_on_collect,
    require_verify_before_release: values.require_verify_before_release,
    critical_notify_enabled: values.critical_notify_enabled,
    default_department_uuid: emptyToNull(values.default_department_uuid),
    report_footer: values.report_footer ?? "",
    report_letterhead: values.report_letterhead ?? "",
    analyzer_ingest_enabled: values.analyzer_ingest_enabled,
  };

  const secret = values.analyzer_shared_secret_hash?.trim() ?? "";
  if (secret) {
    payload.analyzer_shared_secret_hash = secret;
  }

  return payload;
}
