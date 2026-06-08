"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddLocationDialog } from "@/features/settings/components/AddLocationDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateLocationDialog } from "@/features/settings/components/UpdateLocationDialog";
import { fetchOrganizationLocations } from "@/features/settings/services/settings.service";
import type { OrganizationLocation } from "@/features/settings/types/settings.types";

type OrganizationLocationsTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Location" },
  { key: "code", label: "Code" },
  { key: "clinic", label: "Clinic" },
  { key: "hours", label: "Hours" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

function formatStatus(status: string, isActive: boolean) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant={isActive ? "default" : "outline"} className="capitalize">
      {label.toLowerCase()}
    </Badge>
  );
}

export function OrganizationLocationsTab({ isActive }: OrganizationLocationsTabProps) {
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OrganizationLocation | null>(
    null,
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadLocations() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationLocations();
        if (active) {
          setLocations(response.results);
        }
      } catch (loadError) {
        if (active) {
          setLocations([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load locations.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadLocations();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  if (!isActive) {
    return null;
  }

  function handleCreated(_location: OrganizationLocation) {
    setReloadToken((current) => current + 1);
  }

  function handleUpdated(updatedLocation: OrganizationLocation) {
    setLocations((current) =>
      current.map((location) =>
        location.uuid === updatedLocation.uuid ? updatedLocation : location,
      ),
    );
  }

  const isEmpty = !isLoading && !error && locations.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Locations"
        description="Locations are places where care is delivered or inventory is managed, such as a Pharmacy."
        showHeader={!isEmpty}
        actions={
          locations.length > 0 ? (
            <Button onClick={() => setAddDialogOpen(true)}>Add location</Button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : locations.length === 0 ? (
          <OrganizationEmptyState
            message="No locations have been set up for this organization yet."
            actionLabel="Add location"
            onAction={() => setAddDialogOpen(true)}
          />
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-brand-border bg-slate-50/60">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-brand-muted"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {locations.map((location) => (
                  <tr key={location.uuid}>
                    <td className="px-6 py-3.5 text-sm font-medium text-brand-navy">
                      {location.name}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">
                      {location.code}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="text-sm text-brand-navy">{location.clinic_name}</div>
                      <div className="text-xs text-brand-muted">{location.clinic_code}</div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-muted">
                      {location.operating_hours_display || "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      {formatStatus(location.status, location.is_active)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingLocation(location)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OrganizationTabSection>

      <AddLocationDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />

      {editingLocation ? (
        <UpdateLocationDialog
          location={editingLocation}
          open={Boolean(editingLocation)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingLocation(null);
            }
          }}
          onUpdated={handleUpdated}
        />
      ) : null}
    </>
  );
}
