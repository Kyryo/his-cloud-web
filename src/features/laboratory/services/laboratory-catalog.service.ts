import { BFF_LABORATORY_ROUTES } from "@/constants/api";
import type {
  LabAnalyte,
  LabAnalyteWritePayload,
  LabCatalogListResponse,
  LabPanel,
  LabPanelWritePayload,
  LabReferenceRange,
  LabReferenceRangeWritePayload,
  LabSpecimenType,
  LabSpecimenTypeWritePayload,
  LabTenantSettings,
  LabTenantSettingsWritePayload,
  LabTestDefinition,
  LabTestWritePayload,
} from "@/features/laboratory/types/laboratory-catalog.types";
import { bffRequest } from "@/lib/bff-client";

function pageQuery(page?: number, pageSize?: number): string {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("page_size", String(pageSize));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchLabSpecimenTypes(options?: {
  page?: number;
  pageSize?: number;
}): Promise<LabCatalogListResponse<LabSpecimenType>> {
  return bffRequest(
    `${BFF_LABORATORY_ROUTES.specimenTypes}${pageQuery(options?.page, options?.pageSize)}`,
  );
}

export async function createLabSpecimenType(
  payload: LabSpecimenTypeWritePayload,
): Promise<LabSpecimenType> {
  return bffRequest(BFF_LABORATORY_ROUTES.specimenTypes, {
    method: "POST",
    body: payload,
  });
}

export async function updateLabSpecimenType(
  uuid: string,
  payload: LabSpecimenTypeWritePayload,
): Promise<LabSpecimenType> {
  return bffRequest(BFF_LABORATORY_ROUTES.specimenType(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function deactivateLabSpecimenType(uuid: string): Promise<void> {
  await bffRequest(BFF_LABORATORY_ROUTES.specimenType(uuid), {
    method: "DELETE",
  });
}

export async function fetchLabAnalytes(options?: {
  page?: number;
  pageSize?: number;
}): Promise<LabCatalogListResponse<LabAnalyte>> {
  return bffRequest(
    `${BFF_LABORATORY_ROUTES.analytes}${pageQuery(options?.page, options?.pageSize)}`,
  );
}

export async function createLabAnalyte(
  payload: LabAnalyteWritePayload,
): Promise<LabAnalyte> {
  return bffRequest(BFF_LABORATORY_ROUTES.analytes, {
    method: "POST",
    body: payload,
  });
}

export async function updateLabAnalyte(
  uuid: string,
  payload: LabAnalyteWritePayload,
): Promise<LabAnalyte> {
  return bffRequest(BFF_LABORATORY_ROUTES.analyte(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function deactivateLabAnalyte(uuid: string): Promise<void> {
  await bffRequest(BFF_LABORATORY_ROUTES.analyte(uuid), { method: "DELETE" });
}

export async function fetchLabTests(options?: {
  page?: number;
  pageSize?: number;
}): Promise<LabCatalogListResponse<LabTestDefinition>> {
  return bffRequest(
    `${BFF_LABORATORY_ROUTES.tests}${pageQuery(options?.page, options?.pageSize)}`,
  );
}

export async function createLabTest(
  payload: LabTestWritePayload,
): Promise<LabTestDefinition> {
  return bffRequest(BFF_LABORATORY_ROUTES.tests, {
    method: "POST",
    body: payload,
  });
}

export async function updateLabTest(
  uuid: string,
  payload: LabTestWritePayload,
): Promise<LabTestDefinition> {
  return bffRequest(BFF_LABORATORY_ROUTES.test(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function deactivateLabTest(uuid: string): Promise<void> {
  await bffRequest(BFF_LABORATORY_ROUTES.test(uuid), { method: "DELETE" });
}

export async function fetchLabPanels(options?: {
  page?: number;
  pageSize?: number;
}): Promise<LabCatalogListResponse<LabPanel>> {
  return bffRequest(
    `${BFF_LABORATORY_ROUTES.panels}${pageQuery(options?.page, options?.pageSize)}`,
  );
}

export async function createLabPanel(
  payload: LabPanelWritePayload,
): Promise<LabPanel> {
  return bffRequest(BFF_LABORATORY_ROUTES.panels, {
    method: "POST",
    body: payload,
  });
}

export async function updateLabPanel(
  uuid: string,
  payload: LabPanelWritePayload,
): Promise<LabPanel> {
  return bffRequest(BFF_LABORATORY_ROUTES.panel(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function deactivateLabPanel(uuid: string): Promise<void> {
  await bffRequest(BFF_LABORATORY_ROUTES.panel(uuid), { method: "DELETE" });
}

export async function fetchLabReferenceRanges(options?: {
  page?: number;
  pageSize?: number;
  analyteUuid?: string;
}): Promise<LabCatalogListResponse<LabReferenceRange>> {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.pageSize) params.set("page_size", String(options.pageSize));
  if (options?.analyteUuid) params.set("analyte_uuid", options.analyteUuid);
  const query = params.toString();
  return bffRequest(
    `${BFF_LABORATORY_ROUTES.referenceRanges}${query ? `?${query}` : ""}`,
  );
}

export async function createLabReferenceRange(
  payload: LabReferenceRangeWritePayload,
): Promise<LabReferenceRange> {
  return bffRequest(BFF_LABORATORY_ROUTES.referenceRanges, {
    method: "POST",
    body: payload,
  });
}

export async function updateLabReferenceRange(
  uuid: string,
  payload: LabReferenceRangeWritePayload,
): Promise<LabReferenceRange> {
  return bffRequest(BFF_LABORATORY_ROUTES.referenceRange(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function deactivateLabReferenceRange(uuid: string): Promise<void> {
  await bffRequest(BFF_LABORATORY_ROUTES.referenceRange(uuid), {
    method: "DELETE",
  });
}

export async function fetchLabSettings(): Promise<LabTenantSettings> {
  return bffRequest(BFF_LABORATORY_ROUTES.settings);
}

export async function updateLabSettings(
  payload: LabTenantSettingsWritePayload,
): Promise<LabTenantSettings> {
  return bffRequest(BFF_LABORATORY_ROUTES.settings, {
    method: "PUT",
    body: payload,
  });
}
