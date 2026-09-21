import {
  BFF_ENCOUNTER_ATTACHMENTS_ROUTES,
  BFF_INVOICES_ROUTES,
  BFF_SALES_ORDERS_ROUTES,
} from "@/constants/api";
import type {
  VisitEncounterAttachment,
  VisitEncounterAttachmentListResponse,
} from "@/features/visits/types/visit-attachment.types";
import { bffRequest } from "@/lib/bff-client";

export async function uploadEncounterAttachment(
  encounterUuid: string,
  file: File,
): Promise<VisitEncounterAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  return bffRequest<VisitEncounterAttachment>(
    BFF_ENCOUNTER_ATTACHMENTS_ROUTES.list(encounterUuid),
    { method: "POST", body: formData },
  );
}

export async function fetchEncounterAttachments(
  encounterUuid: string,
): Promise<VisitEncounterAttachmentListResponse> {
  return bffRequest<VisitEncounterAttachmentListResponse>(
    BFF_ENCOUNTER_ATTACHMENTS_ROUTES.list(encounterUuid),
  );
}

export async function fetchSalesOrderAttachments(
  orderId: number | string,
): Promise<VisitEncounterAttachmentListResponse> {
  return bffRequest<VisitEncounterAttachmentListResponse>(
    BFF_SALES_ORDERS_ROUTES.attachments(orderId),
  );
}

export async function fetchInvoiceAttachments(
  invoiceId: number | string,
): Promise<VisitEncounterAttachmentListResponse> {
  return bffRequest<VisitEncounterAttachmentListResponse>(
    BFF_INVOICES_ROUTES.attachments(invoiceId),
  );
}

export async function downloadEncounterAttachmentBytes(
  encounterUuid: string,
  attachmentUuid: string,
): Promise<ArrayBuffer> {
  const response = await fetch(
    BFF_ENCOUNTER_ATTACHMENTS_ROUTES.download(encounterUuid, attachmentUuid),
    { method: "GET", credentials: "include" },
  );
  if (!response.ok) {
    throw new Error("Could not download attachment.");
  }
  return response.arrayBuffer();
}

export function encounterAttachmentDownloadUrl(
  encounterUuid: string,
  attachmentUuid: string,
): string {
  return BFF_ENCOUNTER_ATTACHMENTS_ROUTES.download(
    encounterUuid,
    attachmentUuid,
  );
}
