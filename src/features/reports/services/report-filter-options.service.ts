import { fetchCareProviderRecords } from "@/features/care-providers/services/care-providers.service";
import { fetchCatalogProducts } from "@/features/catalog/services/catalog.service";
import { fetchClinicalClinics } from "@/features/clinical/services/clinical-catalog.service";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import { searchInventorySuppliers } from "@/features/inventory/services/batches.service";
import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";

export type ReportFilterOption = {
  value: string;
  label: string;
};

/**
 * Resource keys map a report filter field to the catalog it should be
 * populated from. Values submitted to the API are UUIDs (or supplier names
 * for the free-text supplier filter) so users never have to type identifiers.
 */
export type ReportFilterResource =
  | "customers"
  | "providers"
  | "clinics"
  | "products"
  | "locations"
  | "suppliers";

async function loadCustomerOptions(): Promise<ReportFilterOption[]> {
  const response = await fetchCustomers({ pageSize: 100, ordering: "full_name" });
  return response.results.map((customer) => ({
    value: customer.uuid,
    label: customer.full_name || customer.customer_identifier || customer.uuid,
  }));
}

async function loadProviderOptions(): Promise<ReportFilterOption[]> {
  const response = await fetchCareProviderRecords({ isActive: true });
  return response.results.map((provider) => ({
    value: provider.uuid,
    label: provider.display_name,
  }));
}

async function loadClinicOptions(): Promise<ReportFilterOption[]> {
  const clinics = await fetchClinicalClinics();
  return clinics.map((clinic) => ({
    value: clinic.uuid,
    label: clinic.name,
  }));
}

async function loadProductOptions(): Promise<ReportFilterOption[]> {
  const response = await fetchCatalogProducts({ pageSize: 100, active: true });
  return response.results.map((product) => ({
    value: product.uuid,
    label: product.default_code
      ? `${product.name} (${product.default_code})`
      : product.name,
  }));
}

async function loadLocationOptions(): Promise<ReportFilterOption[]> {
  const response = await fetchInventoryLocations();
  return response.results.map((location) => ({
    value: location.uuid,
    label: location.clinic_name
      ? `${location.name} — ${location.clinic_name}`
      : location.name,
  }));
}

async function loadSupplierOptions(): Promise<ReportFilterOption[]> {
  const suppliers = await searchInventorySuppliers("");
  return suppliers.map((supplier) => ({
    value: supplier,
    label: supplier,
  }));
}

const RESOURCE_LOADERS: Record<
  ReportFilterResource,
  () => Promise<ReportFilterOption[]>
> = {
  customers: loadCustomerOptions,
  providers: loadProviderOptions,
  clinics: loadClinicOptions,
  products: loadProductOptions,
  locations: loadLocationOptions,
  suppliers: loadSupplierOptions,
};

export async function fetchReportFilterOptions(
  resource: ReportFilterResource,
): Promise<ReportFilterOption[]> {
  const loader = RESOURCE_LOADERS[resource];
  return loader();
}
