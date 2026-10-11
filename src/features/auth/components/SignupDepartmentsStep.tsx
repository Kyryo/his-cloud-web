"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { StatusBanner } from "@/components/ui/status-banner";
import {
  moreSignupDepartments,
  primarySignupDepartments,
  type SignupDepartmentOption,
} from "@/features/auth/constants/signup-departments";
import { cn } from "@/lib/utils";

type SignupDepartmentsStepProps = {
  clinicName: string;
  selectedIds: readonly string[];
  onToggle: (departmentId: string) => void;
  onSubmit: () => void;
  error?: string | null;
};

export function SignupDepartmentsStep({
  clinicName,
  selectedIds,
  onToggle,
  onSubmit,
  error,
}: SignupDepartmentsStepProps) {
  const selected = new Set(selectedIds);
  const clinicLabel = clinicName.trim() || "your clinic";
  const moreDepartments = moreSignupDepartments();
  const [showMore, setShowMore] = useState(() =>
    moreDepartments.some((department) => selected.has(department.id)),
  );

  function handleToggle(departmentId: string) {
    if (departmentId === "opd" && !selected.has("opd")) {
      setShowMore(true);
    }
    onToggle(departmentId);
  }

  return (
    <form
      id="signup-departments-form"
      method="post"
      className="flex flex-1 flex-col"
      data-testid="signup-departments-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <fieldset className="min-w-0">
        <legend className="sr-only">
          Departments at {clinicLabel}
        </legend>
        <div className="flex max-h-[min(22rem,46vh)] flex-col gap-2 overflow-y-auto pr-1">
          {primarySignupDepartments().map((department) => (
            <DepartmentChoice
              key={department.id}
              department={department}
              isSelected={selected.has(department.id)}
              onToggle={handleToggle}
            />
          ))}
          {showMore
            ? moreDepartments.map((department) => (
                <DepartmentChoice
                  key={department.id}
                  department={department}
                  isSelected={selected.has(department.id)}
                  onToggle={handleToggle}
                />
              ))
            : null}
          {moreDepartments.length > 0 ? (
            <button
              type="button"
              className="self-start px-1 py-1.5 text-left text-sm font-medium text-brand-muted transition-colors hover:text-brand-navy"
              aria-expanded={showMore}
              data-testid="signup-departments-see-more"
              onClick={() => setShowMore((open) => !open)}
            >
              {showMore ? "Show less" : "See more"}
            </button>
          ) : null}
        </div>
      </fieldset>
      {error ? (
        <StatusBanner
          variant="error"
          message={error}
          showIcon={false}
          className="mt-3"
          data-testid="signup-departments-error"
        />
      ) : null}
    </form>
  );
}

function DepartmentChoice({
  department,
  isSelected,
  onToggle,
}: {
  department: SignupDepartmentOption;
  isSelected: boolean;
  onToggle: (departmentId: string) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      data-testid={`signup-department-${department.id}`}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
        isSelected
          ? "border-brand-primary bg-brand-tint"
          : "border-slate-200 bg-white hover:border-brand-primary/40",
      )}
      onClick={() => onToggle(department.id)}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          isSelected
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-slate-300 bg-white text-transparent",
        )}
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-brand-navy">
          {department.label}
        </span>
        <span className="mt-0.5 block text-[12px] leading-5 text-brand-muted">
          {department.description}
        </span>
      </span>
    </button>
  );
}
