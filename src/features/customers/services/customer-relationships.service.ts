import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type {
  CreateCustomerRelationshipPayload,
  CustomerRelationship,
  CustomerRelationshipListResponse,
  UpdateCustomerRelationshipPayload,
} from "@/features/customers/types/customer-relationship.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchCustomerRelationships(
  customerUuid: string,
): Promise<CustomerRelationshipListResponse> {
  return bffRequest<CustomerRelationshipListResponse>(
    BFF_CUSTOMERS_ROUTES.relationships(customerUuid),
  );
}

export async function createCustomerRelationship(
  customerUuid: string,
  payload: CreateCustomerRelationshipPayload,
): Promise<CustomerRelationship> {
  return bffRequest<CustomerRelationship>(
    BFF_CUSTOMERS_ROUTES.relationships(customerUuid),
    { method: "POST", body: payload },
  );
}

export async function updateCustomerRelationship(
  customerUuid: string,
  relationshipUuid: string,
  payload: UpdateCustomerRelationshipPayload,
): Promise<CustomerRelationship> {
  return bffRequest<CustomerRelationship>(
    BFF_CUSTOMERS_ROUTES.relationshipDetail(customerUuid, relationshipUuid),
    { method: "PATCH", body: payload },
  );
}

export async function archiveCustomerRelationship(
  customerUuid: string,
  relationshipUuid: string,
): Promise<void> {
  await bffRequest(
    BFF_CUSTOMERS_ROUTES.relationshipDetail(customerUuid, relationshipUuid),
    { method: "DELETE" },
  );
}
