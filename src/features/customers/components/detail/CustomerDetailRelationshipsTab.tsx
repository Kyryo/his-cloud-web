"use client";

import { Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { AddCustomerRelationshipDialog } from "@/features/customers/components/detail/AddCustomerRelationshipDialog";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerRelationshipsTable } from "@/features/customers/components/detail/CustomerRelationshipsTable";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import {
  archiveCustomerRelationship,
  fetchCustomerRelationships,
} from "@/features/customers/services/customer-relationships.service";
import type { CustomerRelationship } from "@/features/customers/types/customer-relationship.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

type CustomerDetailRelationshipsTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailRelationshipsTab({
  customer,
  isActive,
}: CustomerDetailRelationshipsTabProps) {
  const { toast } = useToast();
  const [relationships, setRelationships] = useState<CustomerRelationship[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [archivingUuid, setArchivingUuid] = useState<string | null>(null);

  const loadRelationships = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchCustomerRelationships(customer.uuid);
      setRelationships(response.results ?? []);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to load relationships.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customer.uuid]);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }
    void loadRelationships();
  }, [hasLoaded, isActive, loadRelationships]);

  async function handleArchive(relationship: CustomerRelationship) {
    setArchivingUuid(relationship.uuid);
    try {
      await archiveCustomerRelationship(customer.uuid, relationship.uuid);
      setRelationships((current) =>
        current.filter((item) => item.uuid !== relationship.uuid),
      );
      toast({
        variant: "success",
        title: "Relationship removed",
        description: "The family link was archived.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not remove relationship",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Try again in a moment.",
      });
    } finally {
      setArchivingUuid(null);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton />;
  }

  if (loadError && relationships.length === 0) {
    return (
      <div className="space-y-4" data-testid="customer-relationships-tab">
        <p className="text-sm text-red-700">{loadError}</p>
        <Button type="button" variant="outline" onClick={() => void loadRelationships()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="customer-relationships-tab">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">
            Relationships
          </h2>
          <p className="text-sm text-brand-muted">
            Family links to other clients in this organization.
          </p>
        </div>
        <TabAddActionButton
          type="button"
          onClick={() => setAddDialogOpen(true)}
          data-testid="add-customer-relationship-button"
        >
          Add relationship
        </TabAddActionButton>
      </div>

      {relationships.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Users}
          title="No relationships yet"
          description="Link a spouse, child, or other related client to this profile."
          action={
            <TabAddActionButton
              type="button"
              onClick={() => setAddDialogOpen(true)}
            >
              Add relationship
            </TabAddActionButton>
          }
          data-testid="customer-relationships-empty"
        />
      ) : (
        <CustomerRelationshipsTable
          relationships={relationships}
          archivingUuid={archivingUuid}
          onArchive={(row) => void handleArchive(row)}
        />
      )}

      <AddCustomerRelationshipDialog
        customer={customer}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={(created) => {
          setRelationships((current) => [created, ...current]);
        }}
      />
    </div>
  );
}
