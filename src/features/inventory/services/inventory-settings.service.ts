import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import type {
  ApprovalRecord,
  ApprovalRecordListResponse,
  ApprovalWorkflow,
  ApprovalWorkflowListResponse,
  ApprovalWorkflowStep,
  ApprovalWorkflowStepListResponse,
  InventoryClinicConfiguration,
  InventoryClinicConfigurationListResponse,
  InventoryListFilters,
  InventoryTenantConfiguration,
} from "@/features/inventory/types/inventory.types";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";

export type ClinicConfigurationPayload = {
  clinic: number;
  batch_tracking_enabled?: boolean;
  purchase_workflow_enabled?: boolean;
  internal_order_workflow_enabled?: boolean;
  stock_adjustment_workflow_enabled?: boolean;
  allow_negative_stock?: boolean;
  is_active?: boolean;
};

export type WorkflowPayload = {
  tenant: number;
  clinic: number;
  document_type: string;
  name: string;
  is_default?: boolean;
  is_active?: boolean;
};

export type WorkflowStepPayload = {
  workflow: number;
  order: number;
  name: string;
  group_name?: string | null;
  user_role?: string | null;
  required_approvals?: number;
  is_active?: boolean;
};

export async function fetchTenantConfiguration(): Promise<InventoryTenantConfiguration> {
  return bffRequest<InventoryTenantConfiguration>(
    BFF_INVENTORY_ROUTES.tenantConfiguration,
  );
}

export async function updateTenantConfiguration(
  allowSelfApproval: boolean,
): Promise<InventoryTenantConfiguration> {
  return bffRequest<InventoryTenantConfiguration>(
    BFF_INVENTORY_ROUTES.tenantConfiguration,
    {
      method: "PATCH",
      body: { allow_self_approval: allowSelfApproval },
    },
  );
}

export async function fetchClinicConfigurations(
  filters: InventoryListFilters = {},
): Promise<InventoryClinicConfigurationListResponse> {
  return bffRequest<InventoryClinicConfigurationListResponse>(
    `${BFF_INVENTORY_ROUTES.clinicConfigurations.list}${buildInventoryQuery(filters)}`,
  );
}

export async function createClinicConfiguration(
  payload: ClinicConfigurationPayload,
): Promise<InventoryClinicConfiguration> {
  return bffRequest<InventoryClinicConfiguration>(
    BFF_INVENTORY_ROUTES.clinicConfigurations.list,
    { method: "POST", body: payload },
  );
}

export async function updateClinicConfiguration(
  uuid: string,
  payload: Partial<ClinicConfigurationPayload>,
): Promise<InventoryClinicConfiguration> {
  return bffRequest<InventoryClinicConfiguration>(
    BFF_INVENTORY_ROUTES.clinicConfigurations.detail(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function fetchApprovalWorkflows(
  filters: InventoryListFilters = {},
): Promise<ApprovalWorkflowListResponse> {
  return bffRequest<ApprovalWorkflowListResponse>(
    `${BFF_INVENTORY_ROUTES.workflows.list}${buildInventoryQuery(filters)}`,
  );
}

export async function createApprovalWorkflow(
  payload: WorkflowPayload,
): Promise<ApprovalWorkflow> {
  return bffRequest<ApprovalWorkflow>(BFF_INVENTORY_ROUTES.workflows.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateApprovalWorkflow(
  uuid: string,
  payload: Partial<WorkflowPayload>,
): Promise<ApprovalWorkflow> {
  return bffRequest<ApprovalWorkflow>(
    BFF_INVENTORY_ROUTES.workflows.detail(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function deleteApprovalWorkflow(uuid: string): Promise<void> {
  await bffRequest<void>(BFF_INVENTORY_ROUTES.workflows.detail(uuid), {
    method: "DELETE",
  });
}

export async function fetchApprovalWorkflowSteps(
  filters: InventoryListFilters = {},
): Promise<ApprovalWorkflowStepListResponse> {
  return bffRequest<ApprovalWorkflowStepListResponse>(
    `${BFF_INVENTORY_ROUTES.workflowSteps.list}${buildInventoryQuery(filters)}`,
  );
}

export async function createApprovalWorkflowStep(
  payload: WorkflowStepPayload,
): Promise<ApprovalWorkflowStep> {
  return bffRequest<ApprovalWorkflowStep>(
    BFF_INVENTORY_ROUTES.workflowSteps.list,
    { method: "POST", body: payload },
  );
}

export async function updateApprovalWorkflowStep(
  uuid: string,
  payload: Partial<WorkflowStepPayload>,
): Promise<ApprovalWorkflowStep> {
  return bffRequest<ApprovalWorkflowStep>(
    BFF_INVENTORY_ROUTES.workflowSteps.detail(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function deleteApprovalWorkflowStep(uuid: string): Promise<void> {
  await bffRequest<void>(BFF_INVENTORY_ROUTES.workflowSteps.detail(uuid), {
    method: "DELETE",
  });
}

export async function fetchApprovalRecords(
  filters: InventoryListFilters = {},
): Promise<ApprovalRecordListResponse> {
  return bffRequest<ApprovalRecordListResponse>(
    `${BFF_INVENTORY_ROUTES.approvalRecords.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchApprovalRecord(uuid: string): Promise<ApprovalRecord> {
  return bffRequest<ApprovalRecord>(
    BFF_INVENTORY_ROUTES.approvalRecords.detail(uuid),
  );
}
