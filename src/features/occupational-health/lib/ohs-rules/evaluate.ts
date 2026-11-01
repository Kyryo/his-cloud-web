export type OhsRuleExpr = {
  op: string;
  field?: string;
  value?: unknown;
  args?: OhsRuleExpr[];
  inputs?: Record<string, string>;
  key?: string;
};

export class OhsRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OhsRuleError";
  }
}

const ALLOWED_OPS = new Set([
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "and",
  "or",
  "present",
  "bmi",
]);

function asNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    throw new OhsRuleError("Numeric value is required.");
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    throw new OhsRuleError(`Expected a number, got ${String(value)}.`);
  }
  return number;
}

export function evaluate(
  expr: OhsRuleExpr | null | undefined,
  values: Record<string, unknown>,
): unknown {
  if (expr == null) {
    return null;
  }
  if (typeof expr !== "object" || Array.isArray(expr)) {
    throw new OhsRuleError("Expression must be an object.");
  }
  const { op } = expr;
  if (!ALLOWED_OPS.has(op)) {
    throw new OhsRuleError(`Unknown operator: ${op}.`);
  }

  if (op === "present") {
    if (!expr.field) {
      throw new OhsRuleError("present requires a field name.");
    }
    const value = values[expr.field];
    return value !== null && value !== undefined && value !== "";
  }

  if (op === "and" || op === "or") {
    if (!Array.isArray(expr.args) || expr.args.length === 0) {
      throw new OhsRuleError(`${op} requires a non-empty args list.`);
    }
    const results = expr.args.map((arg) => Boolean(evaluate(arg, values)));
    return op === "and" ? results.every(Boolean) : results.some(Boolean);
  }

  if (op === "bmi") {
    const inputs = expr.inputs ?? {};
    const heightKey = inputs.height_cm ?? "height_cm";
    const weightKey = inputs.weight_kg ?? "weight_kg";
    const heightCm = asNumber(values[heightKey]);
    const weightKg = asNumber(values[weightKey]);
    if (heightCm <= 0) {
      throw new OhsRuleError("height_cm must be positive.");
    }
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }

  if (!expr.field) {
    throw new OhsRuleError(`${op} requires a field name.`);
  }
  const left = values[expr.field];
  const right = expr.value;

  if (op === "eq") {
    return left === right;
  }
  if (op === "ne") {
    return left !== right;
  }

  const leftN = asNumber(left);
  const rightN = asNumber(right);
  if (op === "gt") return leftN > rightN;
  if (op === "gte") return leftN >= rightN;
  if (op === "lt") return leftN < rightN;
  if (op === "lte") return leftN <= rightN;
  throw new OhsRuleError(`Unhandled operator: ${op}.`);
}

export function evaluateBool(
  expr: OhsRuleExpr | null | undefined,
  values: Record<string, unknown>,
): boolean {
  if (expr == null) {
    return true;
  }
  return Boolean(evaluate(expr, values));
}

export function evaluateComputed(
  computed: OhsRuleExpr[] | null | undefined,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!computed) {
    return result;
  }
  for (const item of computed) {
    if (!item?.key) {
      continue;
    }
    try {
      result[item.key] = evaluate(item, values);
    } catch {
      // Skip unevaluable computed fields (e.g. missing height/weight).
    }
  }
  return result;
}
