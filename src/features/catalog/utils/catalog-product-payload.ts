import type { CreateInventoryProductPayload } from "@/features/inventory/services/inventory.service";

export function mapProductWritePayload(payload: CreateInventoryProductPayload) {
  const metadata: Record<string, unknown> = {};

  const metadataFlags = {
    is_drug: payload.is_drug,
    liquid_or_cream: payload.liquid_or_cream,
    is_procedure: payload.is_procedure,
    dental_only_procedure: payload.dental_only_procedure,
    opd_only_procedure: payload.opd_only_procedure,
    ipd_only_procedure: payload.ipd_only_procedure,
    physio_only_procedure: payload.physio_only_procedure,
    clinic_wide_procedure: payload.clinic_wide_procedure,
  };

  for (const [field, value] of Object.entries(metadataFlags)) {
    if (value !== undefined) {
      metadata[field] = value;
    }
  }

  if (payload.x_meta) {
    Object.assign(metadata, payload.x_meta);
  }

  const body: Record<string, unknown> = {};
  const scalarFields = [
    "name",
    "default_code",
    "barcode",
    "list_price",
    "standard_price",
    "product_type",
    "sale_ok",
    "purchase_ok",
    "active",
    "charge_occurrences",
  ] as const;

  for (const field of scalarFields) {
    if (payload[field] !== undefined) {
      body[field] = payload[field];
    }
  }

  if (Object.keys(metadata).length > 0) {
    body.metadata = metadata;
  }

  return body;
}
