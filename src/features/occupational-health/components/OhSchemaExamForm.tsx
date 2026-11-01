"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OhPanelSection } from "@/features/occupational-health/components/OhEncounterColumns";
import {
  evaluateBool,
  evaluateComputed,
  type OhsRuleExpr,
} from "@/features/occupational-health/lib/ohs-rules/evaluate";
import {
  createOhExamination,
  fetchOhPublishedFormConfig,
  patchOhExaminationResponses,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhExamination,
  OhFormField,
  OhFormSchema,
  OhPublishedFormConfig,
} from "@/features/occupational-health/types";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type OhSchemaExamFormProps = {
  encounterId: number;
  examination: OhExamination | null;
  onSaved?: (examination: OhExamination) => void;
  onCreated?: () => void;
};

function localized(label: OhFormField["label"] | undefined, fallback: string) {
  return label?.en || fallback;
}

function isVisible(field: OhFormField, values: Record<string, unknown>) {
  try {
    return evaluateBool(field.visible_when as OhsRuleExpr | undefined, values);
  } catch {
    return true;
  }
}

function defaultExamType(form: OhFormSchema | null | undefined) {
  const examTypeField = form?.sections
    ?.flatMap((section) => section.fields ?? [])
    .find((field) => field.key === "exam_type");
  const firstOption = examTypeField?.options?.[0]?.value;
  return typeof firstOption === "string" && firstOption ? firstOption : "periodic";
}

export function OhSchemaExamForm({
  encounterId,
  examination,
  onSaved,
  onCreated,
}: OhSchemaExamFormProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<OhPublishedFormConfig | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [rowVersion, setRowVersion] = useState(1);
  const [examUuid, setExamUuid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosave = useRef(true);
  const createStarted = useRef(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const published = await fetchOhPublishedFormConfig();
        if (!active) {
          return;
        }
        setConfig(published);
        if (examination) {
          setExamUuid(examination.uuid);
          setRowVersion(examination.row_version ?? 1);
          setValues({ ...(examination.responses_json ?? {}) });
        } else {
          setExamUuid(null);
          setRowVersion(1);
          setValues({});
        }
        skipNextAutosave.current = true;
      } catch (error) {
        if (active) {
          toast({
            variant: "error",
            title: "Could not load exam form",
            description: error instanceof Error ? error.message : undefined,
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [examination?.uuid, toast]);

  const form: OhFormSchema | null =
    examination?.form_schema ?? config?.form ?? null;

  const hasPublishedForm = Boolean(
    config?.programme_code && (form?.sections?.length ?? 0) > 0,
  );

  useEffect(() => {
    if (
      isLoading ||
      examination ||
      examUuid ||
      !hasPublishedForm ||
      createStarted.current
    ) {
      return;
    }
    createStarted.current = true;
    setIsCreatingExam(true);
    void (async () => {
      try {
        const created = await createOhExamination({
          encounter: encounterId,
          exam_type: defaultExamType(form),
          occupational_attendance: true,
          notes: "",
        });
        setExamUuid(created.uuid);
        setRowVersion(created.row_version ?? 1);
        setValues({ ...(created.responses_json ?? {}) });
        skipNextAutosave.current = true;
        onCreated?.();
      } catch (error) {
        createStarted.current = false;
        toast({
          variant: "error",
          title: "Could not start examination",
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        setIsCreatingExam(false);
      }
    })();
  }, [
    encounterId,
    examUuid,
    examination,
    form,
    hasPublishedForm,
    isLoading,
    onCreated,
    toast,
  ]);

  const computedValues = useMemo(
    () =>
      evaluateComputed(
        (form?.computed ?? []) as OhsRuleExpr[],
        values,
      ),
    [form?.computed, values],
  );

  const displayValues = useMemo(
    () => ({ ...values, ...computedValues }),
    [values, computedValues],
  );

  useEffect(() => {
    if (!examUuid || !hasPublishedForm) {
      return;
    }
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void (async () => {
        setSaveState("saving");
        try {
          const updated = await patchOhExaminationResponses(examUuid, {
            responses_json: values,
            row_version: rowVersion,
          });
          setRowVersion(updated.row_version ?? rowVersion + 1);
          setValues({ ...(updated.responses_json ?? values) });
          skipNextAutosave.current = true;
          setSaveState("saved");
          onSaved?.(updated);
        } catch (error) {
          setSaveState("error");
          toast({
            variant: "error",
            title: "Could not autosave exam responses",
            description: error instanceof Error ? error.message : undefined,
          });
        }
      })();
    }, 800);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [values, examUuid, hasPublishedForm, rowVersion, onSaved, toast]);

  if (isLoading || isCreatingExam) {
    return (
      <OhPanelSection description="Loading examination form…">
        <p className="text-sm text-brand-muted">Loading…</p>
      </OhPanelSection>
    );
  }

  if (!hasPublishedForm) {
    return null;
  }

  if (!examUuid) {
    return (
      <OhPanelSection description="Examination">
        <p className="text-sm text-brand-muted" data-testid="oh-schema-exam-waiting">
          Starting examination…
        </p>
      </OhPanelSection>
    );
  }

  const sections = form?.sections ?? [];

  return (
    <OhPanelSection description="Published occupational health examination form.">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-brand-muted">
        <span>
          Programme {config?.programme_code} v{config?.programme_version_number}
        </span>
        <span data-testid="oh-schema-save-state">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : saveState === "error"
                ? "Save failed"
                : "Autosave on"}
        </span>
      </div>
      <div className="space-y-4" data-testid="oh-schema-exam-form">
        {sections.map((section) => (
          <div key={section.key} className="space-y-3">
            <h4 className="text-sm font-medium text-brand-navy">
              {localized(section.title, section.key)}
            </h4>
            {(section.fields ?? [])
              .filter((field) => isVisible(field, displayValues))
              .map((field) => (
                <SchemaField
                  key={field.key}
                  field={field}
                  value={displayValues[field.key]}
                  readOnly={Boolean(
                    form?.computed?.some((item) => item.key === field.key),
                  )}
                  onChange={(next) =>
                    setValues((current) => ({ ...current, [field.key]: next }))
                  }
                />
              ))}
            {(form?.computed ?? [])
              .filter((item) => item.key === "bmi")
              .map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <Label>BMI (computed)</Label>
                  <Input
                    value={
                      displayValues.bmi === undefined || displayValues.bmi === null
                        ? ""
                        : String(displayValues.bmi)
                    }
                    readOnly
                    disabled
                  />
                </div>
              ))}
          </div>
        ))}
      </div>
    </OhPanelSection>
  );
}

function SchemaField({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: OhFormField;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}) {
  const label = localized(field.label, field.key);
  const id = `oh-schema-${field.key}`;

  if (field.type === "choice") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
          disabled={readOnly}
        >
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className={appFont.className}>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {localized(option.label, option.value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          className="size-4"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.checked)}
        />
        <Label htmlFor={id}>{label}</Label>
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Textarea
          id={id}
          rows={3}
          value={typeof value === "string" ? value : ""}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="number"
          value={value === undefined || value === null ? "" : String(value)}
          disabled={readOnly}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? "" : Number(event.target.value),
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={field.type === "datetime" ? "datetime-local" : "text"}
        value={typeof value === "string" ? value : ""}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
