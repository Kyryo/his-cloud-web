"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { OhAccessDenied } from "@/features/occupational-health/components/OhAccessDenied";
import { OhRecallsPanel } from "@/features/occupational-health/components/OhRecallsPanel";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import { useUser } from "@/providers/user-provider";

export function OhRecallsPage() {
  const searchParams = useSearchParams();
  const customerUuid = searchParams.get("customer");
  const { userData, isLoading: isUserLoading } = useUser();
  const hasAccess = (userData?.groups ?? []).includes("OccupationalHealth");

  const customerQuery = useQuery({
    queryKey: ["customer", customerUuid],
    queryFn: () => fetchCustomer(customerUuid!),
    enabled: Boolean(customerUuid),
  });

  if (isUserLoading) {
    return (
      <ListPageLayout data-testid="oh-recalls-page">
        <div className="p-8 text-sm text-brand-muted">Loading…</div>
      </ListPageLayout>
    );
  }

  if (!hasAccess) {
    return <OhAccessDenied data-testid="oh-recalls-page" />;
  }

  if (!customerUuid) {
    return (
      <ListPageLayout data-testid="oh-recalls-page">
        <div className="p-8 text-sm text-brand-muted">
          Provide a <code>customer</code> query parameter with the client UUID.
        </div>
      </ListPageLayout>
    );
  }

  if (customerQuery.isLoading || !customerQuery.data) {
    return (
      <ListPageLayout data-testid="oh-recalls-page">
        <div className="p-8 text-sm text-brand-muted">Loading client…</div>
      </ListPageLayout>
    );
  }

  return (
    <ListPageLayout data-testid="oh-recalls-page">
      <div className="border-b border-brand-border bg-white px-4 py-5 md:px-6">
        <h1 className="text-xl font-semibold text-brand-navy">OH recalls</h1>
        <p className="text-sm text-brand-muted">{customerQuery.data.full_name}</p>
      </div>
      <div className="p-4 md:p-6">
        <OhRecallsPanel customer={customerQuery.data} />
      </div>
    </ListPageLayout>
  );
}
