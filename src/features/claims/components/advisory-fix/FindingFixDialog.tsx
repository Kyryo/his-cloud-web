"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { applyClaimAdvisoryFinding } from "@/features/claims/services/claims.service";
import type {
  AdvisorFinding,
  ClaimDetail,
  ClaimLineItem,
} from "@/features/claims/types/claims.types";
import { getAdvisorFindingEvidenceDisplay } from "@/features/claims/utils/advisor-finding-evidence";
import {
  affectedClaimLines,
  kindsForRemediationTarget,
  resolveAdvisoryFixPlan,
  type AdvisoryFixKind,
  type AdvisoryFixPlan,
} from "@/features/claims/utils/advisory-fix-actions";
import { searchDiagnosisCatalog } from "@/features/clinical/services/clinical-diagnosis.service";
import type { DiagnosisCatalogItem } from "@/features/clinical/types/clinical-diagnosis.types";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type FindingFixDialogProps = {
  finding: AdvisorFinding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim?: ClaimDetail | null;
  canEdit?: boolean;
  onApplied?: (claim: ClaimDetail) => void;
};

export function FindingFixDialog({
  finding,
  open,
  onOpenChange,
  claim,
  canEdit = false,
  onApplied,
}: FindingFixDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("apply");
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [diagnosis, setDiagnosis] = useState<{
    code: string;
    description: string;
  } | null>(null);

  const plan = finding ? resolveAdvisoryFixPlan(finding) : null;

  useEffect(() => {
    if (!open) {
      return;
    }
    setActiveTab("apply");
    setDiagnosis(null);
    const lines = affectedClaimLines(claim, finding);
    const first = lines[0];
    const next: Record<string, string> = {
      quantity: first?.quantity ?? "1",
      unit_price: first?.unit_price ?? "",
      line_ids: lines.map((line) => line.uuid).join(","),
    };
    for (const line of lines) {
      next[`quantity__${line.uuid}`] = line.quantity;
      next[`unit_price__${line.uuid}`] = line.unit_price;
    }
    setFormValues(next);
  }, [open, finding?.code, claim]);

  useEffect(() => {
    if (!open || !claim?.customer_uuid || !plan) {
      return;
    }
    if (plan.kind !== "customer_gender" && plan.kind !== "customer_dob") {
      return;
    }
    let cancelled = false;
    void fetchCustomer(claim.customer_uuid)
      .then((customer) => {
        if (cancelled) {
          return;
        }
        setFormValues((current) => ({
          ...current,
          gender: customer.gender || current.gender || "",
          dob: customer.dob || current.dob || "",
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [claim?.customer_uuid, open, plan?.kind]);

  if (!finding) {
    return null;
  }

  const evidenceDisplay = getAdvisorFindingEvidenceDisplay(finding);
  const recommendedAction = finding.recommended_action?.trim() ?? "";
  const severityLabel =
    finding.severity === "rejection_risk"
      ? "Rejection risk"
      : finding.severity === "warning"
        ? "Warning"
        : "Advisory";
  const canApply = Boolean(canEdit && plan?.canApply);
  const applyKinds = plan ? kindsToRender(plan) : [];

  async function handleApply() {
    if (!claim || !finding || !plan?.canApply) {
      return;
    }
    setIsSaving(true);
    try {
      const payload = buildApplyPayload(plan.kind, formValues, diagnosis);
      const updated = await applyClaimAdvisoryFinding(claim.id, {
        code: finding.code,
        source: finding.source ?? "rules",
        payload,
        targets:
          finding.source === "iq"
            ? plan.targets.map((target) => ({
                object: target.object,
                action: target.action,
                ids: target.ids ?? [],
                payload: kindsForRemediationTarget(target).reduce(
                  (acc, kind) => ({
                    ...acc,
                    ...buildApplyPayload(kind, formValues, diagnosis),
                  }),
                  {} as Record<string, unknown>,
                ),
              }))
            : undefined,
      });
      onOpenChange(false);
      onApplied?.(updated);
      toast({
        variant: "success",
        title: "Fix applied",
        description: "Advisories are running again against the updated claim.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not apply this fix",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={finding.name}
      description={
        <CollapsibleFindingMessage message={finding.message} active={open} />
      }
      tabs={[
        { id: "apply", label: "Apply" },
        { id: "guidance", label: "How to resolve" },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="claim-advisory-fix-dialog"
      footer={
        <>
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Close
          </SecondaryButton>
          {activeTab === "apply" ? (
            <PrimaryButton
              type="button"
              disabled={!canApply || isSaving}
              onClick={() => void handleApply()}
              data-testid="claim-advisory-apply-submit"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Applying...
                </>
              ) : (
                "Apply fix"
              )}
            </PrimaryButton>
          ) : null}
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
            finding.severity === "rejection_risk"
              ? "bg-red-50 text-red-700"
              : finding.severity === "warning"
                ? "bg-amber-50 text-amber-800"
                : "bg-slate-100 text-brand-slate",
          )}
        >
          {severityLabel}
        </span>
        <span className="font-mono text-brand-muted">{finding.code}</span>
      </div>

      {activeTab === "apply" ? (
        <div data-testid="claim-advisory-apply-tab">
          <ApplyTab
            kinds={applyKinds}
            values={formValues}
            onChange={setFormValues}
            diagnosis={diagnosis}
            onDiagnosisChange={setDiagnosis}
            claim={claim}
            finding={finding}
          />
        </div>
      ) : (
        <GuidanceTab
          recommendedAction={recommendedAction}
          evidenceDisplay={evidenceDisplay}
        />
      )}
    </TabbedDialog>
  );
}

function kindsToRender(plan: AdvisoryFixPlan): AdvisoryFixKind[] {
  if (plan.targets.length > 0) {
    const kinds = plan.targets.flatMap((target) =>
      kindsForRemediationTarget(target),
    );
    return [...new Set(kinds.filter((kind) => kind !== "unsupported"))];
  }
  return plan.kind === "unsupported" ? [] : [plan.kind];
}

function ApplyTab({
  kinds,
  values,
  onChange,
  diagnosis,
  onDiagnosisChange,
  claim,
  finding,
}: {
  kinds: AdvisoryFixKind[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  diagnosis: { code: string; description: string } | null;
  onDiagnosisChange: (value: { code: string; description: string } | null) => void;
  claim?: ClaimDetail | null;
  finding: AdvisorFinding;
}) {
  if (kinds.length === 0) {
    return (
      <div
        className="rounded-xl border border-brand-border bg-slate-50/80 px-4 py-3.5"
        data-testid="claim-advisory-apply-unsupported"
      >
        <p className="text-sm leading-relaxed text-brand-navy">
          This finding cannot be corrected from this dialog. Open{" "}
          <span className="font-medium">How to resolve</span> for guidance, or
          use <span className="font-medium">Clear</span> if the claim should
          proceed as-is.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {kinds.map((kind) => (
        <ApplyKindFields
          key={kind}
          kind={kind}
          values={values}
          onChange={onChange}
          diagnosis={diagnosis}
          onDiagnosisChange={onDiagnosisChange}
          claim={claim}
          finding={finding}
        />
      ))}
    </div>
  );
}

function ApplyKindFields({
  kind,
  values,
  onChange,
  diagnosis,
  onDiagnosisChange,
  claim,
  finding,
}: {
  kind: AdvisoryFixKind;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  diagnosis: { code: string; description: string } | null;
  onDiagnosisChange: (value: { code: string; description: string } | null) => void;
  claim?: ClaimDetail | null;
  finding: AdvisorFinding;
}) {
  if (kind === "diagnosis") {
    return (
      <DiagnosisApplyField
        selected={diagnosis}
        onSelect={onDiagnosisChange}
      />
    );
  }

  if (kind === "sync_tariff") {
    return (
      <p className="text-sm leading-relaxed text-brand-navy">
        Apply will sync the scheme tariff code onto the affected billed lines.
      </p>
    );
  }

  if (kind === "line_quantity") {
    return (
      <OrderLineApplyFields
        field="quantity"
        lines={affectedClaimLines(claim, finding)}
        values={values}
        onChange={onChange}
      />
    );
  }

  if (kind === "line_unit_price") {
    return (
      <OrderLineApplyFields
        field="unit_price"
        lines={affectedClaimLines(claim, finding)}
        values={values}
        onChange={onChange}
      />
    );
  }

  if (kind === "customer_gender") {
    return (
      <div className="space-y-2">
        <Label htmlFor="advisory-gender">Gender</Label>
        <Select
          value={values.gender || undefined}
          onValueChange={(gender) => onChange({ ...values, gender })}
        >
          <SelectTrigger id="advisory-gender" data-testid="advisory-apply-gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (kind === "customer_dob") {
    return (
      <Field
        id="advisory-dob"
        label="Date of birth"
        type="date"
        value={values.dob ?? ""}
        onChange={(dob) => onChange({ ...values, dob })}
      />
    );
  }

  if (kind === "membership_join_date") {
    return (
      <Field
        id="advisory-date-joined"
        label="Date joined"
        type="date"
        value={values.date_joined ?? ""}
        onChange={(date_joined) => onChange({ ...values, date_joined })}
      />
    );
  }

  if (kind === "preauth") {
    return (
      <Field
        id="advisory-preauth"
        label="Pre-authorization number"
        value={values.pre_authorization_number ?? ""}
        onChange={(pre_authorization_number) =>
          onChange({ ...values, pre_authorization_number })
        }
      />
    );
  }

  if (kind === "referral") {
    return (
      <Field
        id="advisory-referral"
        label="Referral reference"
        value={values.referral_id ?? ""}
        onChange={(referral_id) => onChange({ ...values, referral_id })}
      />
    );
  }

  if (kind === "line_dental") {
    return (
      <Field
        id="advisory-teeth"
        label="Tooth numbers"
        value={values.tooth_numbers ?? ""}
        onChange={(tooth_numbers) => onChange({ ...values, tooth_numbers })}
      />
    );
  }

  return null;
}

function OrderLineApplyFields({
  field,
  lines,
  values,
  onChange,
}: {
  field: "quantity" | "unit_price";
  lines: ClaimLineItem[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  const label = field === "quantity" ? "Quantity" : "Unit price";
  if (lines.length === 0) {
    return (
      <Field
        id={`advisory-${field}`}
        label={label}
        value={values[field] ?? (field === "quantity" ? "1" : "")}
        onChange={(next) => onChange({ ...values, [field]: next })}
      />
    );
  }

  return (
    <div className="space-y-2" data-testid="advisory-apply-order-lines">
      <p className="text-xs text-brand-muted">
        Updates order, invoice, and claim totals.
      </p>
      <ul className="divide-y divide-brand-border overflow-hidden rounded-lg border border-brand-border">
        {lines.map((line) => {
          const key = `${field}__${line.uuid}`;
          return (
            <li key={line.uuid} className="px-3 py-2.5">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p className="text-sm font-medium text-brand-navy">
                  {line.description || line.tariff_code}
                </p>
                <span className="font-mono text-[11px] text-brand-muted">
                  {line.tariff_code}
                </span>
              </div>
              <CompactField
                id={`advisory-${field}-${line.uuid}`}
                label={label}
                value={values[key] ?? values[field] ?? line[field] ?? ""}
                onChange={(next) =>
                  onChange({
                    ...values,
                    [key]: next,
                    [field]: next,
                    line_ids: lines.map((item) => item.uuid).join(","),
                  })
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CollapsibleFindingMessage({
  message,
  active,
}: {
  message: string;
  active: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!active) {
      setExpanded(false);
    }
  }, [active, message]);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) {
      return;
    }
    const measure = () => {
      setIsTruncatable(el.scrollHeight > el.clientHeight + 2);
    };
    measure();
    requestAnimationFrame(measure);
  }, [message, expanded, active]);

  const showToggle =
    expanded || isTruncatable || message.trim().length > 280;

  return (
    <div data-testid="claim-advisory-fix-description">
      <p
        ref={textRef}
        className={cn(
          "text-sm leading-relaxed text-brand-muted",
          !expanded && "line-clamp-4",
        )}
      >
        {message}
      </p>
      {showToggle ? (
        <button
          type="button"
          className="mt-1.5 text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary/80"
          onClick={() => setExpanded((current) => !current)}
          data-testid="claim-advisory-fix-description-toggle"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

function CompactField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-brand-muted">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9"
        data-testid={id}
      />
    </div>
  );
}

function DiagnosisApplyField({
  selected,
  onSelect,
}: {
  selected: { code: string; description: string } | null;
  onSelect: (value: { code: string; description: string } | null) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<DiagnosisCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const trimmed = searchTerm.trim();

  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const response = await searchDiagnosisCatalog(trimmed);
          if (!cancelled) {
            setResults(response.results ?? []);
          }
        } catch {
          if (!cancelled) {
            setResults([]);
          }
        } finally {
          if (!cancelled) {
            setIsSearching(false);
          }
        }
      })();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed]);

  return (
    <div className="space-y-2">
      <Label htmlFor="advisory-diagnosis">Diagnosis</Label>
      <Input
        id="advisory-diagnosis"
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value);
          onSelect(null);
        }}
        placeholder="Search ICD-10"
        data-testid="advisory-apply-diagnosis-search"
      />
      {isSearching ? (
        <p className="text-xs text-brand-muted">Searching catalog…</p>
      ) : null}
      {results.length > 0 ? (
        <ul className="max-h-40 overflow-y-auto rounded-xl border border-brand-border">
          {results.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => {
                  onSelect({ code: item.code, description: item.description });
                  setSearchTerm(`${item.code} — ${item.description}`);
                  setResults([]);
                }}
              >
                <span className="font-mono text-xs text-brand-muted">{item.code}</span>
                <span className="mt-0.5 block text-brand-navy">{item.description}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {selected ? (
        <p className="text-xs text-brand-muted" data-testid="advisory-apply-diagnosis-selected">
          Selected {selected.code}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={id}
      />
    </div>
  );
}

function GuidanceTab({
  recommendedAction,
  evidenceDisplay,
}: {
  recommendedAction: string;
  evidenceDisplay: ReturnType<typeof getAdvisorFindingEvidenceDisplay>;
}) {
  return (
    <div className="space-y-5">
      {recommendedAction ? (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            How to resolve
          </h3>
          <div className="rounded-xl border border-brand-border bg-slate-50/80 px-4 py-3.5">
            <p className="text-sm leading-relaxed text-brand-navy">
              {recommendedAction}
            </p>
          </div>
        </section>
      ) : null}

      {evidenceDisplay?.contextLabel ? (
        <p className="text-sm text-brand-navy">{evidenceDisplay.contextLabel}</p>
      ) : null}

      {evidenceDisplay?.coverageCitation ? (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Coverage
          </h3>
          <p
            className="text-sm text-brand-navy"
            data-testid="claim-advisory-coverage-citation-dialog"
          >
            {evidenceDisplay.coverageCitation}
          </p>
        </section>
      ) : null}

      {evidenceDisplay && evidenceDisplay.lines.length > 0 ? (
        <section
          className="space-y-2.5"
          data-testid="claim-advisory-finding-evidence"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Affected lines
          </h3>
          <ul className="divide-y divide-brand-border overflow-hidden rounded-xl border border-brand-border bg-white">
            {evidenceDisplay.lines.map((line) => (
              <li key={line.key} className="px-4 py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-brand-navy">
                    {line.description}
                  </p>
                  {line.procedureCode ? (
                    <span className="font-mono text-xs text-brand-muted">
                      {line.procedureCode}
                    </span>
                  ) : null}
                </div>
                {line.detailParts.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {line.detailParts.map((part) => (
                      <li
                        key={part}
                        className="text-xs leading-relaxed text-brand-slate"
                      >
                        {part}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!recommendedAction &&
      !evidenceDisplay?.coverageCitation &&
      !(evidenceDisplay && evidenceDisplay.lines.length > 0) ? (
        <p className="text-sm leading-relaxed text-brand-muted">
          Review this finding and update the claim or patient details before
          submitting.
        </p>
      ) : null}
    </div>
  );
}

function buildApplyPayload(
  kind: AdvisoryFixKind,
  values: Record<string, string>,
  diagnosis: { code: string; description: string } | null,
): Record<string, unknown> {
  if (kind === "diagnosis") {
    return {
      code: diagnosis?.code ?? "",
      description: diagnosis?.description ?? "",
    };
  }
  if (kind === "line_quantity") {
    const lineIds = (values.line_ids || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const quantities: Record<string, string> = {};
    for (const id of lineIds) {
      quantities[id] = values[`quantity__${id}`] || values.quantity || "1";
    }
    return {
      quantity: values.quantity || Object.values(quantities)[0] || "1",
      line_ids: lineIds,
      quantities,
    };
  }
  if (kind === "line_unit_price") {
    const lineIds = (values.line_ids || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return {
      unit_price: values.unit_price,
      line_ids: lineIds,
    };
  }
  if (kind === "customer_gender") {
    return { gender: values.gender };
  }
  if (kind === "customer_dob") {
    return { date_of_birth: values.dob, dob: values.dob };
  }
  if (kind === "membership_join_date") {
    return { date_joined: values.date_joined };
  }
  if (kind === "preauth") {
    return { pre_authorization_number: values.pre_authorization_number };
  }
  if (kind === "referral") {
    return { referral_id: values.referral_id };
  }
  if (kind === "line_dental") {
    return {
      tooth_numbers: values.tooth_numbers
        .split(/[\s,]+/)
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item)),
    };
  }
  return {};
}
