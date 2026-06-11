"use client";

import { useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { InventoryEmptyState } from "@/features/inventory/components/InventoryEmptyState";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import {
  createApprovalWorkflow,
  createApprovalWorkflowStep,
  deleteApprovalWorkflow,
  deleteApprovalWorkflowStep,
  fetchApprovalWorkflowSteps,
  fetchApprovalWorkflows,
} from "@/features/inventory/services/inventory-settings.service";
import type {
  ApprovalWorkflow,
  ApprovalWorkflowStep,
} from "@/features/inventory/types/inventory.types";
import { formatDocumentTypeLabel } from "@/features/inventory/utils/format-inventory";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type InventoryWorkflowsTabProps = {
  isActive: boolean;
};

const DOCUMENT_TYPES = [
  "PURCHASE_ORDER",
  "INTERNAL_ORDER",
  "STOCK_ADJUSTMENT",
] as const;

export function InventoryWorkflowsTab({ isActive }: InventoryWorkflowsTabProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [steps, setSteps] = useState<ApprovalWorkflowStep[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowClinic, setNewWorkflowClinic] = useState<string>("");
  const [newWorkflowDocumentType, setNewWorkflowDocumentType] =
    useState<string>("PURCHASE_ORDER");
  const [newStepName, setNewStepName] = useState("");
  const [newStepRole, setNewStepRole] = useState("");

  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? null,
    [selectedWorkflowId, workflows],
  );

  const workflowSteps = useMemo(
    () =>
      steps
        .filter((step) => step.workflow === selectedWorkflowId)
        .sort((a, b) => a.order - b.order),
    [selectedWorkflowId, steps],
  );

  async function reloadWorkflows() {
    const [clinicsResponse, workflowsResponse, stepsResponse] = await Promise.all([
      fetchOrganizationClinics(),
      fetchApprovalWorkflows({ pageSize: 200 }),
      fetchApprovalWorkflowSteps({ pageSize: 200 }),
    ]);
    setClinics(clinicsResponse.results);
    setWorkflows(workflowsResponse.results);
    setSteps(stepsResponse.results);
    if (!selectedWorkflowId && workflowsResponse.results[0]) {
      setSelectedWorkflowId(workflowsResponse.results[0].id);
    }
  }

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        await reloadWorkflows();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load workflows.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive]);

  async function handleCreateWorkflow() {
    const tenantId = userData?.tenant?.id;
    const clinicId = Number(newWorkflowClinic);

    if (!tenantId || !newWorkflowName.trim() || !clinicId) {
      toast({
        description: "Workflow name and clinic are required.",
        variant: "error",
      });
      return;
    }

    try {
      const workflow = await createApprovalWorkflow({
        tenant: tenantId,
        clinic: clinicId,
        document_type: newWorkflowDocumentType,
        name: newWorkflowName.trim(),
        is_default: workflows.length === 0,
      });
      setNewWorkflowName("");
      await reloadWorkflows();
      setSelectedWorkflowId(workflow.id);
      toast({ description: "Workflow created.", variant: "success" });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Unable to create workflow.",
        variant: "error",
      });
    }
  }

  async function handleCreateStep() {
    if (!selectedWorkflow || !newStepName.trim()) {
      toast({ description: "Select a workflow and enter a step name.", variant: "error" });
      return;
    }

    try {
      await createApprovalWorkflowStep({
        workflow: selectedWorkflow.id,
        order: workflowSteps.length + 1,
        name: newStepName.trim(),
        user_role: newStepRole.trim() || null,
        required_approvals: 1,
      });
      setNewStepName("");
      setNewStepRole("");
      await reloadWorkflows();
      toast({ description: "Approval step added.", variant: "success" });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Unable to add step.",
        variant: "error",
      });
    }
  }

  async function handleDeleteWorkflow(workflow: ApprovalWorkflow) {
    try {
      await deleteApprovalWorkflow(workflow.uuid);
      await reloadWorkflows();
      toast({ description: "Workflow deleted.", variant: "success" });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Unable to delete workflow.",
        variant: "error",
      });
    }
  }

  async function handleDeleteStep(step: ApprovalWorkflowStep) {
    try {
      await deleteApprovalWorkflowStep(step.uuid);
      await reloadWorkflows();
      toast({ description: "Step deleted.", variant: "success" });
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Unable to delete step.",
        variant: "error",
      });
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <PageLoader message="Loading approval workflows..." />;
  }

  if (error) {
    return (
      <OrganizationTabSection title="Approval workflows" description="Configure approval chains for inventory documents.">
        <p className="text-sm text-red-600">{error}</p>
      </OrganizationTabSection>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizationTabSection
        title="Approval workflows"
        description="Define who must approve purchase orders, internal orders, and stock adjustments."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow name</Label>
            <Input
              id="workflow-name"
              value={newWorkflowName}
              onChange={(event) => setNewWorkflowName(event.target.value)}
              placeholder="Pharmacy purchase approvals"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-clinic">Clinic</Label>
            <Select value={newWorkflowClinic} onValueChange={setNewWorkflowClinic}>
              <SelectTrigger id="workflow-clinic">
                <SelectValue placeholder="Select clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={String(clinic.id)}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-document-type">Document type</Label>
            <Select
              value={newWorkflowDocumentType}
              onValueChange={setNewWorkflowDocumentType}
            >
              <SelectTrigger id="workflow-document-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((documentType) => (
                  <SelectItem key={documentType} value={documentType}>
                    {formatDocumentTypeLabel(documentType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => void handleCreateWorkflow()}>
              Add workflow
            </Button>
          </div>
        </div>

        {workflows.length === 0 ? (
          <div className="mt-6">
            <InventoryEmptyState
              title="No workflows yet"
              description="Create a workflow to require approvals before inventory documents post stock."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.uuid}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border p-4"
              >
                <button
                  type="button"
                  className="text-left"
                  onClick={() => setSelectedWorkflowId(workflow.id)}
                >
                  <p className="font-semibold text-brand-navy">{workflow.name}</p>
                  <p className="text-sm text-brand-muted">
                    {formatDocumentTypeLabel(workflow.document_type)}
                    {workflow.is_default ? " · Default" : ""}
                  </p>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDeleteWorkflow(workflow)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </OrganizationTabSection>

      {selectedWorkflow ? (
        <OrganizationTabSection
          title={`Steps for ${selectedWorkflow.name}`}
          description="Steps run in order until all required approvals are collected."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="step-name">Step name</Label>
              <Input
                id="step-name"
                value={newStepName}
                onChange={(event) => setNewStepName(event.target.value)}
                placeholder="Pharmacy manager approval"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-role">User role (optional)</Label>
              <Input
                id="step-role"
                value={newStepRole}
                onChange={(event) => setNewStepRole(event.target.value)}
                placeholder="Inventory"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={() => void handleCreateStep()}>
                Add step
              </Button>
            </div>
          </div>

          {workflowSteps.length === 0 ? (
            <p className="mt-4 text-sm text-brand-muted">
              No steps yet. Add at least one step to activate this workflow.
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {workflowSteps.map((step) => (
                <li
                  key={step.uuid}
                  className="flex items-center justify-between gap-3 rounded-xl border border-brand-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-brand-navy">
                      {step.order}. {step.name}
                    </p>
                    <p className="text-sm text-brand-muted">
                      {step.user_role ? `Role: ${step.user_role}` : "Any approver"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleDeleteStep(step)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ol>
          )}
        </OrganizationTabSection>
      ) : null}
    </div>
  );
}
