"use client";

import { useMemo } from "react";
import ReactFlagsSelect from "react-flags-select";

import {
  getCountryCodeFromName,
  getCountryNameFromCode,
  getPrioritizedCountryCodes,
} from "@/features/auth/constants/countries";
import { cn } from "@/lib/utils";

type CountrySelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  tenantCountryName?: string | null;
  placeholder?: string;
  id?: string;
  "data-testid"?: string;
};

export function CountrySelectField({
  value,
  onChange,
  disabled = false,
  hasError = false,
  tenantCountryName,
  placeholder = "Select a country",
  id,
  "data-testid": dataTestId,
}: CountrySelectFieldProps) {
  const countries = useMemo(
    () => getPrioritizedCountryCodes(tenantCountryName),
    [tenantCountryName],
  );

  const selectedCode = useMemo(() => getCountryCodeFromName(value) ?? "", [value]);

  return (
    <div
      id={id}
      data-testid={dataTestId}
      className={cn("country-select-field", hasError && "has-error")}
    >
      <ReactFlagsSelect
        selected={selectedCode}
        onSelect={(code) => onChange(getCountryNameFromCode(code))}
        placeholder={placeholder}
        searchable
        searchPlaceholder="Search countries"
        countries={countries}
        disabled={disabled}
        fullWidth
        showSelectedLabel
        showOptionLabel
        selectButtonClassName="country-select-field-button"
      />
    </div>
  );
}
