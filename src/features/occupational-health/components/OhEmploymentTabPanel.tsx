"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  OhColumnMessage,
  OhFormFooter,
  OhPanelSection,
  submitOnModEnter,
} from "@/features/occupational-health/components/OhEncounterColumns";
import {
  createEmploymentEpisode,
  fetchOhEmployerDepartments,
  fetchOhEmployerSites,
  fetchOhEmployers,
  fetchOhHazardProfiles,
  fetchOhJobTitles,
} from "@/features/occupational-health/services/oh.service";
import { todayIsoDate } from "@/features/occupational-health/utils/oh-format";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

const EMPLOYMENT_TYPES = [
  { value: "employee", label: "Employee" },
  { value: "contractor", label: "Contractor" },
] as const;

type OhEmploymentFormProps = {
  customer: Customer | null;
};

export function OhEmploymentForm({ customer }: OhEmploymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pickedEmployerId, setPickedEmployerId] = useState("");
  const [pickedJobTitleId, setPickedJobTitleId] = useState("");
  const [pickedSiteId, setPickedSiteId] = useState("");
  const [pickedDepartmentId, setPickedDepartmentId] = useState("");
  const [hazardProfileId, setHazardProfileId] = useState("");
  const [employmentType, setEmploymentType] = useState("employee");
  const [startDate, setStartDate] = useState(todayIsoDate);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employersQuery = useQuery({
    queryKey: ["oh-employers"],
    queryFn: fetchOhEmployers,
    staleTime: 5 * 60_000,
    enabled: Boolean(customer),
  });
  const employers = employersQuery.data ?? [];
  const employerId = pickedEmployerId || (employers[0] ? String(employers[0].id) : "");

  const hazardsQuery = useQuery({
    queryKey: ["oh-hazard-profiles", employerId],
    queryFn: () => fetchOhHazardProfiles(Number(employerId)),
    staleTime: 5 * 60_000,
    enabled: Boolean(customer) && Boolean(employerId),
  });

  const jobsQuery = useQuery({
    queryKey: ["oh-job-titles", employerId],
    queryFn: () => fetchOhJobTitles(Number(employerId)),
    enabled: Boolean(customer) && Boolean(employerId),
  });
  const sitesQuery = useQuery({
    queryKey: ["oh-employer-sites", employerId],
    queryFn: () => fetchOhEmployerSites(Number(employerId)),
    enabled: Boolean(customer) && Boolean(employerId),
  });
  const departmentsQuery = useQuery({
    queryKey: ["oh-employer-departments", employerId],
    queryFn: () => fetchOhEmployerDepartments(Number(employerId)),
    enabled: Boolean(customer) && Boolean(employerId),
  });

  const jobTitles = jobsQuery.data ?? [];
  const sites = sitesQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const jobTitleId = pickedJobTitleId || (jobTitles[0] ? String(jobTitles[0].id) : "");
  const siteId = pickedSiteId || "none";
  const departmentId = pickedDepartmentId || "none";

  if (!customer) {
    return (
      <OhPanelSection>
        <OhColumnMessage>Client context is required to record employment.</OhColumnMessage>
      </OhPanelSection>
    );
  }

  function handleEmployerChange(value: string) {
    setPickedEmployerId(value);
    setPickedJobTitleId("");
    setPickedSiteId("");
    setPickedDepartmentId("");
    setHazardProfileId("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!customer || !employerId || !jobTitleId) {
      toast({ title: "Employer and job title are required", variant: "error" });
      return;
    }
    const selectedSite = sites.find((row) => String(row.id) === siteId);
    const selectedDepartment = departments.find(
      (row) => String(row.id) === departmentId,
    );
    setIsSubmitting(true);
    try {
      await createEmploymentEpisode({
        customer: customer.id,
        employer: Number(employerId),
        job_title: Number(jobTitleId),
        hazard_profile: hazardProfileId ? Number(hazardProfileId) : null,
        start_date: startDate,
        site: selectedSite?.name ?? "",
        department_name: selectedDepartment?.name ?? "",
        employee_number: employeeNumber,
        employment_type: employmentType,
      });
      setEmployeeNumber("");
      toast({ variant: "success", title: "Employment episode created" });
      void queryClient.invalidateQueries({
        queryKey: ["oh-employment-episodes", customer.uuid],
      });
    } catch (error) {
      toast({
        title: "Could not create employment episode",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OhPanelSection
      title="Employment episode"
      description="The job this worker is being assessed for."
      data-testid="oh-employment-form"
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onKeyDown={submitOnModEnter}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="oh-encounter-employer">
            Employer <RequiredFieldMarker />
          </Label>
          <Select value={employerId || undefined} onValueChange={handleEmployerChange}>
            <SelectTrigger id="oh-encounter-employer" className="w-full">
              <SelectValue placeholder="Select employer" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {employers.map((employer) => (
                <SelectItem key={employer.uuid} value={String(employer.id)}>
                  {employer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-encounter-job-title">
            Job title <RequiredFieldMarker />
          </Label>
          <Select value={jobTitleId || undefined} onValueChange={setPickedJobTitleId}>
            <SelectTrigger id="oh-encounter-job-title" className="w-full">
              <SelectValue placeholder="Select job title" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {jobTitles.map((job) => (
                <SelectItem key={job.uuid} value={String(job.id)}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-encounter-department">Department (optional)</Label>
          <Select value={departmentId} onValueChange={setPickedDepartmentId}>
            <SelectTrigger id="oh-encounter-department" className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              <SelectItem value="none">No department</SelectItem>
              {departments.map((row) => (
                <SelectItem key={row.uuid} value={String(row.id)}>
                  {row.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-encounter-site">Site (optional)</Label>
          <Select value={siteId} onValueChange={setPickedSiteId}>
            <SelectTrigger id="oh-encounter-site" className="w-full">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              <SelectItem value="none">No site</SelectItem>
              {sites.map((row) => (
                <SelectItem key={row.uuid} value={String(row.id)}>
                  {row.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-encounter-employment-type">Type</Label>
          <Select value={employmentType} onValueChange={setEmploymentType}>
            <SelectTrigger id="oh-encounter-employment-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {EMPLOYMENT_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-encounter-risk-profile">Risk profile</Label>
          <Select
            value={hazardProfileId || "none"}
            onValueChange={(value) => setHazardProfileId(value === "none" ? "" : value)}
          >
            <SelectTrigger id="oh-encounter-risk-profile" className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              <SelectItem value="none">None</SelectItem>
              {(hazardsQuery.data ?? []).map((profile) => (
                <SelectItem key={profile.uuid} value={String(profile.id)}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="oh-encounter-start-date">
              Start date <RequiredFieldMarker />
            </Label>
            <Input
              id="oh-encounter-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oh-encounter-employee-number">Employee no.</Label>
            <Input
              id="oh-encounter-employee-number"
              value={employeeNumber}
              onChange={(event) => setEmployeeNumber(event.target.value)}
            />
          </div>
        </div>
        <OhFormFooter>
          <PrimaryButton
            type="submit"
            className="w-full"
            disabled={isSubmitting || !jobTitleId}
          >
            {isSubmitting ? "Saving…" : "Add episode"}
          </PrimaryButton>
        </OhFormFooter>
      </form>
    </OhPanelSection>
  );
}
