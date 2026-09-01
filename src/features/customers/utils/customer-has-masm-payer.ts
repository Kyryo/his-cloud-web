import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";

export function customerHasMasemPayer(insurance: CustomerInsurance[]): boolean {
  return insurance.some((item) => {
    if (!item.is_active) {
      return false;
    }

    const code = item.insurance_company_code?.trim().toUpperCase();
    const name = item.insurance_company_name?.trim().toUpperCase();
    return code === "MASM" || name === "MASM";
  });
}
