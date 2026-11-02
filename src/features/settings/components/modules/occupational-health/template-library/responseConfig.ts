import type {
  OhCatalogPossibleResponse,
  OhResponseConfig,
  OhResponseField,
} from "@/features/occupational-health/types";

export const OH_RESPONSE_TYPES = [
  "boolean",
  "text",
  "number",
  "decimal",
  "date",
  "datetime",
  "time",
  "single_select",
  "multi_select",
  "file",
] as const;

export type OhResponseType = (typeof OH_RESPONSE_TYPES)[number];

const OPTION_TYPES = new Set<OhResponseType>([
  "boolean",
  "single_select",
  "multi_select",
]);

export function defaultResponseConfig(
  responseType: OhResponseType = "boolean",
): OhResponseConfig {
  const config: OhResponseConfig = {
    response_type: responseType,
    options: [],
    validation: {},
    prompt_after_select: true,
  };
  if (OPTION_TYPES.has(responseType)) {
    config.options = [
      { code: "yes", label: "Yes" },
      { code: "no", label: "No" },
    ];
  }
  return config;
}

export function defaultResponseField(
  responseType: OhResponseType = "boolean",
  overrides?: Partial<Pick<OhResponseField, "code" | "label">>,
): OhResponseField {
  return {
    code: overrides?.code ?? "value",
    label: overrides?.label ?? "Value",
    ...defaultResponseConfig(responseType),
  };
}

export function defaultResponseFields(
  responseType: OhResponseType = "boolean",
): OhResponseField[] {
  return [defaultResponseField(responseType)];
}

export function normalizeResponseConfig(
  value: Partial<OhResponseConfig> | null | undefined,
): OhResponseConfig {
  if (!value || typeof value !== "object") {
    return defaultResponseConfig();
  }
  const responseType = (value.response_type || "boolean") as OhResponseType;
  return {
    response_type: responseType,
    options: Array.isArray(value.options)
      ? value.options.map((row) => ({
          code: String(row.code ?? "").trim(),
          label: String(row.label ?? "").trim(),
        }))
      : defaultResponseConfig(responseType).options,
    validation:
      value.validation && typeof value.validation === "object"
        ? { ...value.validation }
        : {},
    prompt_after_select: value.prompt_after_select !== false,
  };
}

export function normalizeResponseField(
  value: Partial<OhResponseField> | null | undefined,
  index = 0,
): OhResponseField {
  const base = normalizeResponseConfig(value);
  const code =
    String(value?.code ?? "").trim().toLowerCase().replaceAll(" ", "_") ||
    `field_${index + 1}`;
  const label = String(value?.label ?? "").trim() || `Field ${index + 1}`;
  return { ...base, code, label };
}

/** Accept legacy single-object configs or field arrays. */
export function normalizeResponseFields(
  value: unknown,
): OhResponseField[] {
  if (value == null || value === "") {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((row, index) =>
      normalizeResponseField(
        row && typeof row === "object" ? (row as Partial<OhResponseField>) : null,
        index,
      ),
    );
  }
  if (typeof value === "object") {
    return [normalizeResponseField(value as Partial<OhResponseField>, 0)];
  }
  return [];
}

/** Effective item fields: null override inherits the section default list. */
export function resolveEffectiveResponseFields(
  sectionDefault: OhResponseField[] | null | undefined,
  override: OhResponseField[] | null | undefined,
): { fields: OhResponseField[]; inherits: boolean } {
  const base = normalizeResponseFields(sectionDefault);
  if (override == null) {
    return { fields: base, inherits: true };
  }
  return { fields: normalizeResponseFields(override), inherits: false };
}

/** @deprecated Prefer resolveEffectiveResponseFields */
export function resolveEffectiveResponseConfig(
  sectionDefault: OhResponseConfig | null | undefined,
  override: OhResponseConfig | null | undefined,
): { config: OhResponseConfig; inherits: boolean } {
  const base = normalizeResponseConfig(sectionDefault);
  if (
    override == null ||
    (typeof override === "object" && Object.keys(override).length === 0)
  ) {
    return { config: base, inherits: true };
  }
  const normalized = normalizeResponseConfig(override);
  if (!normalized.response_type) {
    return { config: base, inherits: true };
  }
  return { config: normalized, inherits: false };
}

export function optionsFromResponseConfig(
  config: OhResponseConfig | null | undefined,
): OhCatalogPossibleResponse[] {
  return normalizeResponseConfig(config).options.filter(
    (row) => row.code && row.label,
  );
}

export function optionsFromResponseFields(
  fields: OhResponseField[] | null | undefined,
): OhCatalogPossibleResponse[] {
  const list = normalizeResponseFields(fields);
  if (list.length === 0) {
    return [];
  }
  // Preview "outcomes" under a pick: use first field that prompts after select.
  const promptField =
    list.find((field) => field.prompt_after_select) ?? list[0];
  return optionsFromResponseConfig(promptField);
}

export function responseConfigFromOptions(
  responses: OhCatalogPossibleResponse[],
  responseType: OhResponseType = "single_select",
): OhResponseConfig {
  const options = responses
    .map((row) => ({
      code: row.code.trim(),
      label: row.label.trim(),
    }))
    .filter((row) => row.code && row.label);
  return {
    response_type: responseType,
    options:
      options.length > 0 ? options : defaultResponseConfig(responseType).options,
    validation: {},
    prompt_after_select: true,
  };
}
