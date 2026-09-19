"use client";

import { ClipboardList } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useCreateProblemListItem,
  useProblemList,
  useUpdateProblemListItem,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { problemListSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";

type OpdProblemsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdProblemsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdProblemsTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const problems = useProblemList(visitUuid, encounterUuid, isActive);
  const createProblem = useCreateProblemListItem(visitUuid, encounterUuid);
  const updateProblem = useUpdateProblemListItem(visitUuid, encounterUuid);
  const canWrite = capabilities.includes("manage_problem_list") && !isChartLocked;
  const form = useForm({
    resolver: zodResolver(problemListSchema),
    defaultValues: { description: "", code: "", standard: "ICD10", notes: "" },
  });

  if (!isActive) return null;
  if (problems.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = problems.data ?? [];

  return (
    <div className="space-y-6" data-testid="opd-problems-tab-panel">
      {canWrite ? (
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            await createProblem.mutateAsync(values);
            form.reset();
          })}
        >
          <div className="space-y-1.5">
            <Label>
              Description <RequiredFieldMarker />
            </Label>
            <Input {...form.register("description")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input {...form.register("code")} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} {...form.register("notes")} />
            </div>
          </div>
          <Button type="submit" disabled={createProblem.isPending}>
            {createProblem.isPending ? "Saving..." : "Add problem"}
          </Button>
        </form>
      ) : null}

      {items.length === 0 ? (
        canWrite ? null : (
          <OpdEncounterTabEmptyState
            icon={ClipboardList}
            title="No problems on the list"
            description="Problem list belongs to the client and persists across visits."
          />
        )
      ) : (
        <OpdEncounterRecordList title="Problem list">
          {items.map((problem) => (
            <OpdEncounterRecordListItem
              key={problem.uuid}
              compact
              icon={ClipboardList}
              title={problem.description}
              description={[problem.code, problem.status, problem.notes]
                .filter(Boolean)
                .join(" · ")}
              dateTime={problem.recorded_at}
              createdByName={problem.recorded_by_name}
              menuActions={
                canWrite && problem.status === "active"
                  ? [
                      {
                        label: "Resolve",
                        onClick: () => {
                          void updateProblem.mutateAsync({
                            problemUuid: problem.uuid,
                            payload: { status: "resolved" },
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
