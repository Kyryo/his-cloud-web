"use client";

import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useCreateEncounterAllergy,
  useEncounterAllergies,
  useUpdateEncounterAllergy,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { allergySchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";

const ALLERGY_TYPES = [
  "medication",
  "latex",
  "anesthetic",
  "metal",
  "food",
  "environmental",
  "other",
];
const SEVERITIES = ["mild", "moderate", "severe", "life_threatening"];

type OpdAllergiesTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdAllergiesTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdAllergiesTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const allergies = useEncounterAllergies(visitUuid, encounterUuid, isActive);
  const createAllergy = useCreateEncounterAllergy(visitUuid, encounterUuid);
  const updateAllergy = useUpdateEncounterAllergy(visitUuid, encounterUuid);
  const canWrite = capabilities.includes("record_allergy") && !isChartLocked;
  const form = useForm({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      allergy_name: "",
      allergy_type: "medication",
      severity: "moderate",
      reaction: "",
      notes: "",
      date_identified: "",
    },
  });

  if (!isActive) return null;
  if (allergies.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = (allergies.data ?? []).filter(
    (allergy) => allergy.is_active !== false,
  );

  return (
    <div className="space-y-6" data-testid="opd-allergies-tab-panel">
      {canWrite ? (
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            await createAllergy.mutateAsync(values);
            form.reset();
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" required>
              <Input {...form.register("allergy_name")} />
            </Field>
            <Field label="Type" required>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("allergy_type")}
              >
                {ALLERGY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Severity" required>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("severity")}
              >
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reaction">
              <Input {...form.register("reaction")} />
            </Field>
          </div>
          <Button type="submit" disabled={createAllergy.isPending}>
            {createAllergy.isPending ? "Saving..." : "Save allergy"}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        canWrite ? null : (
          <OpdEncounterTabEmptyState
            icon={ShieldAlert}
            title="No allergies on file"
            description="Clinical allergy writes do not start the consult."
          />
        )
      ) : (
        <OpdEncounterRecordList title="Allergies">
          {items.map((allergy) => (
            <OpdEncounterRecordListItem
              key={allergy.uuid}
              compact
              icon={ShieldAlert}
              title={allergy.allergy_name}
              description={`${allergy.allergy_type} · ${allergy.severity}${allergy.reaction ? ` · ${allergy.reaction}` : ""}`}
              dateTime={
                allergy.date_identified?.trim() || new Date(0).toISOString()
              }
              menuActions={
                canWrite
                  ? [
                      {
                        label: "Deactivate",
                        onClick: () => {
                          void updateAllergy.mutateAsync({
                            allergyUuid: allergy.uuid,
                            payload: { is_active: false },
                          });
                        },
                      },
                    ]
                  : undefined
              }
            />
          ))}
        </OpdEncounterRecordList>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <RequiredFieldMarker /> : null}
      </Label>
      {children}
    </div>
  );
}
