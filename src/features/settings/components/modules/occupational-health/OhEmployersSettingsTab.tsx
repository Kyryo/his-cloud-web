"use client";

import { useEffect, useState } from "react";

import { ListPagePagination } from "@/features/app-shell/components/page-layout";
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
  OhCatalogListPanel,
  OhCatalogRow,
} from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import { OhEmployerWorkspaceSheet } from "@/features/settings/components/modules/occupational-health/OhEmployerWorkspaceSheet";
import {
  createOhEmployer,
  fetchOhEmployersPage,
} from "@/features/occupational-health/services/oh.service";
import type { OhEmployer } from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

const PAGE_SIZE = 10;

type OhEmployersSettingsTabProps = {
  isActive: boolean;
};

export function OhEmployersSettingsTab({ isActive }: OhEmployersSettingsTabProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<OhEmployer[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<OhEmployer | null>(
    null,
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchOhEmployersPage({
          page,
          pageSize: PAGE_SIZE,
        });
        if (active) {
          setRows(response.results);
          setTotalCount(response.pagination?.count ?? response.results.length);
          setHasNext(Boolean(response.pagination?.next));
          setHasPrevious(Boolean(response.pagination?.previous));
        }
      } catch (loadError) {
        if (active) {
          setRows([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load employers.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [isActive, page, reloadToken]);

  if (!isActive) {
    return null;
  }

  function openCreate() {
    setName("");
    setCode("");
    setRegistrationNumber("");
    setDialogOpen(true);
  }

  function openWorkspace(employer: OhEmployer) {
    setSelectedEmployer(employer);
    setWorkspaceOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createOhEmployer({
        name: name.trim(),
        code: code.trim(),
        registration_number: registrationNumber.trim(),
      });
      toast({ variant: "success", title: "Employer added" });
      setDialogOpen(false);
      setName("");
      setCode("");
      setRegistrationNumber("");
      setPage(1);
      setReloadToken((current) => current + 1);
      openWorkspace(created);
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not add employer",
        description:
          submitError instanceof BffError
            ? submitError.message
            : submitError instanceof Error
              ? submitError.message
              : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <OhCatalogListPanel
        title="Employers"
        description="Open an employer to manage risk profiles, departments, and job titles."
        addLabel="Add employer"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No employers yet"
        emptyDescription="Add an employer to configure their occupational health catalogs."
        isEmpty={rows.length === 0}
      >
        <div className="space-y-1">
          <ul className="-mx-1 space-y-0.5">
            {rows.map((row) => (
              <OhCatalogRow
                key={row.uuid}
                title={row.name}
                meta={
                  [row.code, row.registration_number]
                    .filter(Boolean)
                    .join(" · ") || "No code"
                }
                isActive={row.is_active !== false}
                onSelect={() => openWorkspace(row)}
              />
            ))}
          </ul>
          {totalCount > PAGE_SIZE ? (
            <ListPagePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </OhCatalogListPanel>

      <OhEmployerWorkspaceSheet
        employer={selectedEmployer}
        open={workspaceOpen}
        onOpenChange={(open) => {
          setWorkspaceOpen(open);
          if (!open) {
            setSelectedEmployer(null);
          }
        }}
        onEmployerUpdated={(updated) => {
          setSelectedEmployer(updated);
          setRows((current) =>
            current.map((row) => (row.uuid === updated.uuid ? updated : row)),
          );
        }}
        onEmployerArchived={(uuid) => {
          setSelectedEmployer(null);
          setReloadToken((current) => current + 1);
          setRows((current) => current.filter((row) => row.uuid !== uuid));
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add employer</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-name">Name</Label>
              <Input
                id="oh-employer-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-code">Code</Label>
              <Input
                id="oh-employer-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-reg">Registration number</Label>
              <Input
                id="oh-employer-reg"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? "Saving…" : "Save employer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
