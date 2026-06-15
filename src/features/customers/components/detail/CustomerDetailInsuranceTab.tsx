"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { AddCustomerInsuranceDialog } from "@/features/customers/components/detail/AddCustomerInsuranceDialog";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { UpdateCustomerInsuranceDialog } from "@/features/customers/components/detail/UpdateCustomerInsuranceDialog";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import type { Customer } from "@/features/customers/types/customer.types";

type CustomerDetailInsuranceTabProps = {
  customer: Customer;
  isActive: boolean;
};

function InsuranceStatusBadges({ insurance }: { insurance: CustomerInsurance }) {
  if (!insurance.is_active) {
    return <Badge variant="outline">Inactive</Badge>;
  }

  if (insurance.is_primary) {
    return <Badge variant="secondary">Primary</Badge>;
  }

  return <Badge variant="success">Active</Badge>;
}

export function CustomerDetailInsuranceTab({
  customer,
  isActive,
}: CustomerDetailInsuranceTabProps) {
  const [insurance, setInsurance] = useState<CustomerInsurance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] =
    useState<CustomerInsurance | null>(null);

  const loadInsurance = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const records = await fetchCustomerInsurance(customer.uuid);
      setInsurance(records);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load insurance.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customer.uuid]);

  const reloadInsurance = useCallback(() => {
    void loadInsurance();
  }, [loadInsurance]);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const records = await fetchCustomerInsurance(customer.uuid);

        if (cancelled) {
          return;
        }

        setInsurance(records);
        setHasLoaded(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Failed to load insurance.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customer.uuid, hasLoaded, isActive]);

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  const addButton = (
    <TabAddActionButton
      label="Add insurance"
      onClick={() => setAddDialogOpen(true)}
      data-testid="add-customer-insurance-button"
    />
  );

  if (insurance.length === 0) {
    return (
      <>
        <CustomerDetailTabEmptyState
          icon={Shield}
          title="No insurance on file"
          description="Insurance memberships linked to this client will appear here."
          action={addButton}
          data-testid="customer-insurance-empty-state"
        />
        <AddCustomerInsuranceDialog
          customer={customer}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onCreated={() => reloadInsurance()}
        />
      </>
    );
  }

  return (
    <>
      <CustomerDetailRecordList
        title="Insurance"
        description="Memberships linked to this client."
        action={addButton}
        data-testid="customer-detail-insurance-tab"
      >
        {insurance.map((record) => (
          <CustomerDetailRecordListItem
            key={record.uuid}
            title={record.insurance_company_name}
            badges={<InsuranceStatusBadges insurance={record} />}
            description={
              <>
                <p>
                  {record.scheme_name} · {record.membership_number}
                  {record.suffix ? `-${record.suffix}` : ""}
                </p>
                <p>
                  {record.is_principal_member ? "Principal member" : "Dependent"}
                  {record.relationship_to_principal_member
                    ? ` · ${record.relationship_to_principal_member}`
                    : ""}
                </p>
              </>
            }
            dateTime={record.created_at}
            onUpdate={() => setEditingInsurance(record)}
          />
        ))}
      </CustomerDetailRecordList>

      <AddCustomerInsuranceDialog
        customer={customer}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={() => reloadInsurance()}
      />
      {editingInsurance ? (
        <UpdateCustomerInsuranceDialog
          customer={customer}
          insurance={editingInsurance}
          open={Boolean(editingInsurance)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingInsurance(null);
            }
          }}
          onUpdated={() => reloadInsurance()}
        />
      ) : null}
    </>
  );
}
