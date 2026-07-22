"use client";

import { useEffect, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchClinicalClinics } from "@/features/clinical/services/clinical-catalog.service";
import { fetchInsuranceSchemes } from "@/features/customers/services/insurance-schemes.service";
import type { InsightsFilters, InsightsPeriod } from "@/features/reports/types/insights.types";
import {
  paymentSourceFilterToFilters,
  paymentSourceFilterValue,
} from "@/features/reports/utils/insights-filters";

type OverviewPeriodFiltersProps = {
  filters: InsightsFilters;
  onChange: (filters: InsightsFilters) => void;
};

export function OverviewPeriodFilters({
  filters,
  onChange,
}: OverviewPeriodFiltersProps) {
  const [clinicOptions, setClinicOptions] = useState<
    Array<{ value: string; label: string }>
  >([{ value: "all", label: "All clinics" }]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [paymentSourceOptions, setPaymentSourceOptions] = useState<
    Array<{ value: string; label: string }>
  >([
    { value: "all", label: "All sources" },
    { value: "cash", label: "Cash" },
    { value: "insurance", label: "All insurance" },
  ]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const clinics = await fetchClinicalClinics();
        if (cancelled) {
          return;
        }
        setClinicOptions([
          { value: "all", label: "All clinics" },
          ...clinics.map((clinic) => ({
            value: clinic.uuid,
            label: clinic.name,
          })),
        ]);
      } catch {
        if (!cancelled) {
          setClinicOptions([{ value: "all", label: "All clinics" }]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingClinics(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const schemes = await fetchInsuranceSchemes();
        if (cancelled) {
          return;
        }
        setPaymentSourceOptions([
          { value: "all", label: "All sources" },
          { value: "cash", label: "Cash" },
          { value: "insurance", label: "All insurance" },
          ...schemes.map((scheme) => ({
            value: scheme.uuid,
            label: scheme.insurance_company_name
              ? `${scheme.name} · ${scheme.insurance_company_name}`
              : scheme.name,
          })),
        ]);
      } catch {
        if (!cancelled) {
          setPaymentSourceOptions([
            { value: "all", label: "All sources" },
            { value: "cash", label: "Cash" },
            { value: "insurance", label: "All insurance" },
          ]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSchemes(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="insights-date-from">From</Label>
        <Input
          id="insights-date-from"
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            onChange({ ...filters, dateFrom: event.target.value })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="insights-date-to">To</Label>
        <Input
          id="insights-date-to"
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            onChange({ ...filters, dateTo: event.target.value })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="insights-period">Period</Label>
        <Select
          value={filters.period ?? "day"}
          onValueChange={(value) =>
            onChange({ ...filters, period: value as InsightsPeriod })
          }
        >
          <SelectTrigger id="insights-period" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-52">
        <FilterSelectField
          id="insights-clinic"
          label="Clinic"
          value={filters.clinicUuid ?? "all"}
          disabled={isLoadingClinics}
          placeholder={isLoadingClinics ? "Loading clinics..." : "All clinics"}
          options={clinicOptions}
          onValueChange={(value) =>
            onChange({
              ...filters,
              clinicUuid: value === "all" ? undefined : value,
            })
          }
        />
      </div>
      <div className="w-64">
        <FilterSelectField
          id="insights-payment-source"
          label="Payment source"
          value={paymentSourceFilterValue(filters)}
          disabled={isLoadingSchemes}
          placeholder={isLoadingSchemes ? "Loading sources..." : "All sources"}
          options={paymentSourceOptions}
          onValueChange={(value) =>
            onChange(paymentSourceFilterToFilters(filters, value))
          }
        />
      </div>
    </div>
  );
}
