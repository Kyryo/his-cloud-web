"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmploymentEpisode,
  fetchOhEmployerSites,
  fetchOhEmployers,
  fetchOhHazardProfiles,
  fetchOhJobTitles,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhEmployer,
  OhEmployerSite,
  OhHazardProfile,
  OhJobTitle,
} from "@/features/occupational-health/types";
import type { Customer } from "@/features/customers/types/customer.types";
import { useToast } from "@/providers/toast-provider";

type AddEmploymentEpisodeDialogProps = {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AddEmploymentEpisodeDialog({
  customer,
  open,
  onOpenChange,
  onCreated,
}: AddEmploymentEpisodeDialogProps) {
  const { toast } = useToast();
  const [employers, setEmployers] = useState<OhEmployer[]>([]);
  const [jobTitles, setJobTitles] = useState<OhJobTitle[]>([]);
  const [sites, setSites] = useState<OhEmployerSite[]>([]);
  const [hazardProfiles, setHazardProfiles] = useState<OhHazardProfile[]>([]);
  const [employerId, setEmployerId] = useState("");
  const [jobTitleId, setJobTitleId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [hazardProfileId, setHazardProfileId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    void Promise.all([fetchOhEmployers(), fetchOhHazardProfiles()]).then(
      ([employerRows, hazardRows]) => {
        setEmployers(employerRows);
        setHazardProfiles(hazardRows);
        if (employerRows[0]) {
          setEmployerId(String(employerRows[0].id));
        }
      },
    );
  }, [open]);

  useEffect(() => {
    if (!open || !employerId) {
      return;
    }
    const employerPk = Number(employerId);
    void Promise.all([
      fetchOhJobTitles(employerPk),
      fetchOhEmployerSites(employerPk),
    ]).then(([jobRows, siteRows]) => {
      setJobTitles(jobRows);
      setSites(siteRows);
      setJobTitleId(jobRows[0] ? String(jobRows[0].id) : "");
      setSiteId(siteRows[0] ? String(siteRows[0].id) : "");
    });
  }, [employerId, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!employerId || !jobTitleId) {
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedSite = sites.find((row) => String(row.id) === siteId);
      await createEmploymentEpisode({
        customer: customer.id,
        employer: Number(employerId),
        job_title: Number(jobTitleId),
        hazard_profile: hazardProfileId ? Number(hazardProfileId) : null,
        start_date: startDate,
        site: selectedSite?.name ?? "",
        employee_number: employeeNumber,
        employment_type: "employee",
      });
      toast({ variant: "success", title: "Employment episode created" });
      onOpenChange(false);
      onCreated();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add employment episode</DialogTitle>
        </DialogHeader>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oh-employer">Employer</Label>
            <Select value={employerId} onValueChange={setEmployerId}>
              <SelectTrigger id="oh-employer">
                <SelectValue placeholder="Select employer" />
              </SelectTrigger>
              <SelectContent>
                {employers.map((employer) => (
                  <SelectItem key={employer.uuid} value={String(employer.id)}>
                    {employer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oh-job-title">Job title</Label>
            <Select value={jobTitleId} onValueChange={setJobTitleId}>
              <SelectTrigger id="oh-job-title">
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                {jobTitles.map((job) => (
                  <SelectItem key={job.uuid} value={String(job.id)}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oh-site">Site</Label>
            <Select
              value={siteId || "none"}
              onValueChange={(value) => setSiteId(value === "none" ? "" : value)}
            >
              <SelectTrigger id="oh-site">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No site</SelectItem>
                {sites.map((row) => (
                  <SelectItem key={row.uuid} value={String(row.id)}>
                    {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oh-hazard-profile">Hazard profile (optional)</Label>
            <Select
              value={hazardProfileId || "none"}
              onValueChange={(value) =>
                setHazardProfileId(value === "none" ? "" : value)
              }
            >
              <SelectTrigger id="oh-hazard-profile">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {hazardProfiles.map((profile) => (
                  <SelectItem key={profile.uuid} value={String(profile.id)}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="oh-start-date">Start date</Label>
              <Input
                id="oh-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-employee-number">Employee number</Label>
              <Input
                id="oh-employee-number"
                value={employeeNumber}
                onChange={(event) => setEmployeeNumber(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !jobTitleId}>
              {isSubmitting ? "Saving…" : "Create episode"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
