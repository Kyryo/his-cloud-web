import type {
  AdvisorFinding,
  AdvisorRemediationTarget,
  ClaimDetail,
  ClaimLineItem,
} from "@/features/claims/types/claims.types";

export type AdvisoryFixKind =
  | "diagnosis"
  | "sync_tariff"
  | "line_quantity"
  | "line_unit_price"
  | "customer_gender"
  | "customer_dob"
  | "membership_join_date"
  | "preauth"
  | "referral"
  | "line_dental"
  | "unsupported";

export type AdvisoryFixPlan = {
  kind: AdvisoryFixKind;
  canApply: boolean;
  summary: string;
  targets: AdvisorRemediationTarget[];
};

const RULE_KIND: Record<string, AdvisoryFixKind> = {
  GLOBAL_DIAGNOSIS_REQUIRED: "diagnosis",
  GLOBAL_MISSING_TARIFF_FOR_CODED_LINE: "sync_tariff",
  GLOBAL_SINGLE_UNIT_SERVICE_QUANTITY: "line_quantity",
  GLOBAL_LINE_AMOUNT_EXCEEDS_TARIFF: "line_unit_price",
  GLOBAL_PATIENT_GENDER_TARIFF_MISMATCH: "customer_gender",
  GLOBAL_PATIENT_AGE_TARIFF_MISMATCH: "customer_dob",
  GLOBAL_MEMBERSHIP_JOIN_DATE_REQUIRED: "membership_join_date",
  MASM_VIP_2026_WAITING_PERIOD_3_MONTHS: "membership_join_date",
  MASM_VIP_2026_WAITING_PERIOD_6_MONTHS: "membership_join_date",
  MASM_VIP_2026_WAITING_PERIOD_12_MONTHS: "membership_join_date",
  MASM_VIP_2026_WAITING_PERIOD_24_MONTHS: "membership_join_date",
  MASM_VIP_2026_PREAUTH_REQUIRED: "preauth",
  GLOBAL_SERVICE_DURATION_IPD_PREAUTH: "preauth",
  MASM_VIP_2026_REFERRAL_REQUIRED: "referral",
};

const KIND_LABEL: Record<AdvisoryFixKind, string> = {
  diagnosis: "Diagnosis",
  sync_tariff: "Tariff code",
  line_quantity: "Line quantity",
  line_unit_price: "Line amount",
  customer_gender: "Patient gender",
  customer_dob: "Date of birth",
  membership_join_date: "Membership join date",
  preauth: "Pre-authorization",
  referral: "Referral",
  line_dental: "Teeth",
  unsupported: "This finding",
};

const OBJECT_KIND: Record<string, AdvisoryFixKind> = {
  claim_diagnosis: "diagnosis",
  claim_line: "sync_tariff",
  claim_line_dental: "line_dental",
  customer: "customer_gender",
  customer_insurance: "membership_join_date",
  visit_preauth: "preauth",
  claim_referral: "referral",
  coverage_policy: "unsupported",
};

export function resolveAdvisoryFixPlan(finding: AdvisorFinding): AdvisoryFixPlan {
  if (finding.source === "iq") {
    return resolveIqFixPlan(finding);
  }
  const kind = RULE_KIND[finding.code] ?? "unsupported";
  return {
    kind,
    canApply: kind !== "unsupported",
    summary: KIND_LABEL[kind],
    targets: [],
  };
}

export function kindsForRemediationTarget(
  target: AdvisorRemediationTarget,
): AdvisoryFixKind[] {
  if (target.object === "coverage_policy" || target.action === "review") {
    return ["unsupported"];
  }
  if (target.object === "claim_line") {
    const fields = target.fields ?? [];
    if (fields.includes("quantity")) {
      return ["line_quantity"];
    }
    if (fields.includes("unit_price")) {
      return ["line_unit_price"];
    }
    return ["sync_tariff"];
  }
  if (target.object === "customer") {
    const fields = target.fields ?? [];
    const kinds: AdvisoryFixKind[] = [];
    if (fields.includes("gender") || fields.length === 0) {
      kinds.push("customer_gender");
    }
    if (fields.includes("date_of_birth")) {
      kinds.push("customer_dob");
    }
    return kinds.length > 0 ? kinds : ["customer_gender"];
  }
  return [OBJECT_KIND[target.object] ?? "unsupported"];
}

export function advisoryFixTargetLabels(finding: AdvisorFinding): string[] {
  const plan = resolveAdvisoryFixPlan(finding);
  if (plan.kind === "unsupported") {
    return [];
  }
  if (plan.targets.length > 0) {
    const labels = plan.targets.flatMap((target) => {
      if (target.object === "coverage_policy" || target.action === "review") {
        return [];
      }
      const lineLabels = Object.values(target.line_labels ?? {}).filter(Boolean);
      if (lineLabels.length > 0) {
        return lineLabels.map((label) =>
          label.toLowerCase().startsWith("line") ? label : `Line ${label}`,
        );
      }
      return kindsForRemediationTarget(target)
        .filter((kind) => kind !== "unsupported")
        .map((kind) => KIND_LABEL[kind]);
    });
    return [...new Set(labels)];
  }
  return [plan.summary];
}

function findingLooksLikeQuantity(finding: AdvisorFinding): boolean {
  const code = (finding.code ?? "").toUpperCase();
  if (
    code.includes("QUANTITY") ||
    code.includes("SINGLE_UNIT") ||
    code.endsWith("_UNITS")
  ) {
    return true;
  }
  const haystack = `${finding.name ?? ""} ${finding.message ?? ""}`.toLowerCase();
  return [
    "quantity",
    "billed units",
    "units billed",
    "implausible units",
    "dispensed",
  ].some((token) => haystack.includes(token));
}

function resolveIqFixPlan(finding: AdvisorFinding): AdvisoryFixPlan {
  let targets = (finding.remediation?.targets ?? []).filter(
    (target) => target.object !== "coverage_policy" && target.action !== "review",
  );
  if (findingLooksLikeQuantity(finding)) {
    targets = targets.map((target) => {
      if (target.object !== "claim_line") {
        return target;
      }
      const fields = target.fields ?? [];
      if (fields.includes("quantity")) {
        return target;
      }
      return { ...target, fields: ["quantity"] };
    });
  }
  if (targets.length === 0) {
    return {
      kind: "unsupported",
      canApply: false,
      summary: "This IQ note cannot be applied inline",
      targets: [],
    };
  }
  const kinds = new Set(
    targets.flatMap((target) => kindsForRemediationTarget(target)),
  );
  const primaryKinds = kindsForRemediationTarget(targets[0]);
  const kind =
    primaryKinds.find((item) => item !== "unsupported") ?? "unsupported";
  const canApply =
    !(kinds.size === 1 && kinds.has("unsupported")) && kind !== "unsupported";
  return {
    kind,
    canApply,
    summary: KIND_LABEL[kind],
    targets,
  };
}

export function affectedClaimLines(
  claim: ClaimDetail | null | undefined,
  finding: AdvisorFinding | null | undefined,
): ClaimLineItem[] {
  if (!claim || !finding) {
    return [];
  }
  const all = (claim.claim_invoices ?? []).flatMap(
    (invoice) => invoice.line_items ?? [],
  );
  if (all.length === 0) {
    return [];
  }

  const ids = new Set<string>();
  const codes = new Set<string>();
  for (const target of finding.remediation?.targets ?? []) {
    if (target.object !== "claim_line" && target.object !== "claim_line_dental") {
      continue;
    }
    for (const id of target.ids ?? []) {
      ids.add(String(id));
    }
    for (const code of target.codes ?? []) {
      codes.add(String(code).trim().toUpperCase());
    }
  }
  const evidence = finding.evidence ?? {};
  for (const id of Array.isArray(evidence.line_ids) ? evidence.line_ids : []) {
    ids.add(String(id));
  }
  for (const code of [
    ...(Array.isArray(evidence.line_codes) ? evidence.line_codes : []),
    ...(Array.isArray(evidence.procedure_codes) ? evidence.procedure_codes : []),
  ]) {
    codes.add(String(code).trim().toUpperCase());
  }
  const buckets = [
    ...(Array.isArray(evidence.violating_lines) ? evidence.violating_lines : []),
    ...(Array.isArray(evidence.over_tariff) ? evidence.over_tariff : []),
  ];
  for (const item of buckets) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const record = item as Record<string, unknown>;
    if (record.id) {
      ids.add(String(record.id));
    }
    const code = record.procedure_code ?? record.code ?? record.tariff_code;
    if (code) {
      codes.add(String(code).trim().toUpperCase());
    }
  }

  if (ids.size === 0 && codes.size === 0) {
    return all;
  }
  const matched = all.filter(
    (line) =>
      ids.has(line.uuid) ||
      ids.has(String(line.id)) ||
      codes.has((line.tariff_code ?? "").trim().toUpperCase()),
  );
  return matched.length > 0 ? matched : all;
}
