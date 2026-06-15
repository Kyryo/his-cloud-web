"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddCustomerAddressDialog } from "@/features/customers/components/detail/AddCustomerAddressDialog";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { UpdateCustomerAddressDialog } from "@/features/customers/components/detail/UpdateCustomerAddressDialog";
import { fetchCustomerAddresses } from "@/features/customers/services/customer-addresses.service";
import {
  CUSTOMER_ADDRESS_TYPE_OPTIONS,
  type CustomerAddress,
} from "@/features/customers/types/customer-address.types";
import type { Customer } from "@/features/customers/types/customer.types";

const ADDRESSES_PAGE_SIZE = 10;

type CustomerDetailAddressesTabProps = {
  customer: Customer;
  isActive: boolean;
};

function formatAddressType(value: CustomerAddress["address_type"]): string {
  return (
    CUSTOMER_ADDRESS_TYPE_OPTIONS.find((option) => option.value === value)
      ?.label ?? value
  );
}

function formatAddressLines(address: CustomerAddress): string {
  return [
    address.line1,
    address.line2,
    [address.city, address.state_province].filter(Boolean).join(", "),
    address.postal_code,
    address.country,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function CustomerDetailAddressesTab({
  customer,
  isActive,
}: CustomerDetailAddressesTabProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );

  const loadAddresses = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const response = await fetchCustomerAddresses({
          customerId: customer.id,
          page: pageToLoad,
          pageSize: ADDRESSES_PAGE_SIZE,
        });

        setAddresses((current) =>
          append ? [...current, ...response.results] : response.results,
        );
        setPage(pageToLoad);
        setHasMore(Boolean(response.pagination?.next));
        setHasLoaded(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load addresses.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [customer.id],
  );

  const reloadAddresses = useCallback(() => {
    void loadAddresses(1, false);
  }, [loadAddresses]);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetchCustomerAddresses({
          customerId: customer.id,
          page: 1,
          pageSize: ADDRESSES_PAGE_SIZE,
        });

        if (cancelled) {
          return;
        }

        setAddresses(response.results);
        setPage(1);
        setHasMore(Boolean(response.pagination?.next));
        setHasLoaded(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Failed to load addresses.",
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
  }, [customer.id, hasLoaded, isActive]);

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton rows={4} />;
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
      label="Add address"
      onClick={() => setAddDialogOpen(true)}
      data-testid="add-customer-address-button"
    />
  );

  if (addresses.length === 0) {
    return (
      <>
        <CustomerDetailTabEmptyState
          icon={MapPin}
          title="No addresses saved"
          description="Home, work, billing, and other addresses for this client will appear here."
          action={addButton}
          data-testid="customer-addresses-empty-state"
        />
        <AddCustomerAddressDialog
          customer={customer}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onCreated={() => reloadAddresses()}
        />
      </>
    );
  }

  return (
    <>
      <CustomerDetailRecordList
        title="Addresses"
        description="Saved addresses for this client."
        action={addButton}
        data-testid="customer-detail-addresses-tab"
        footer={
          hasMore ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoadingMore}
              onClick={() => void loadAddresses(page + 1, true)}
              data-testid="customer-addresses-load-more"
            >
              {isLoadingMore ? "Loading..." : "Load more addresses"}
            </Button>
          ) : null
        }
      >
        {addresses.map((address) => (
          <CustomerDetailRecordListItem
            key={address.uuid}
            title={formatAddressType(address.address_type)}
            badges={
              <>
                {address.is_primary ? (
                  <Badge variant="secondary">Primary</Badge>
                ) : null}
                {!address.is_active ? (
                  <Badge variant="destructive">Inactive</Badge>
                ) : null}
              </>
            }
            description={
              <>
                <p>{formatAddressLines(address)}</p>
                {address.notes ? (
                  <p className="mt-1 text-brand-muted">{address.notes}</p>
                ) : null}
              </>
            }
            dateTime={address.created_at}
            createdByName={address.created_by_name}
            onUpdate={() => setEditingAddress(address)}
          />
        ))}
      </CustomerDetailRecordList>

      {loadError && hasLoaded ? (
        <p className="mt-2 text-xs text-red-600">{loadError}</p>
      ) : null}

      <AddCustomerAddressDialog
        customer={customer}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={() => reloadAddresses()}
      />
      {editingAddress ? (
        <UpdateCustomerAddressDialog
          address={editingAddress}
          open={Boolean(editingAddress)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingAddress(null);
            }
          }}
          onUpdated={() => reloadAddresses()}
        />
      ) : null}
    </>
  );
}
