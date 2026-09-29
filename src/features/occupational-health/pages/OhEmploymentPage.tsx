"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { OhAccessDenied } from "@/features/occupational-health/components/OhAccessDenied";
import { CustomerEmploymentEpisodesSection } from "@/features/occupational-health/components/CustomerEmploymentEpisodesSection";
import { OhHrFitnessSection } from "@/features/occupational-health/components/OhHrFitnessSection";
import { OhRecallsPanel } from "@/features/occupational-health/components/OhRecallsPanel";
import { useEmploymentEpisodes } from "@/features/occupational-health/hooks/use-occupational-health";
import { canAccessOccupationalHealth } from "@/features/occupational-health/utils/oh-access";
import { ROUTES } from "@/constants/routes";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import { useUser } from "@/providers/user-provider";

export function OhEmploymentPage() {
  const searchParams = useSearchParams();
  const customerUuid = searchParams.get("customer");
  const { userData, isLoading: isUserLoading } = useUser();
  const hasAccess = canAccessOccupationalHealth(userData);

  const customerQuery = useQuery({
    queryKey: ["customer", customerUuid],
    queryFn: () => fetchCustomer(customerUuid!),
    enabled: Boolean(customerUuid),
  });

  const episodesQuery = useEmploymentEpisodes(customerUuid ?? undefined);

  if (isUserLoading) {
    return (
      <ListPageLayout data-testid="oh-employment-page">
        <div className="p-8 text-sm text-brand-muted">Loading…</div>
      </ListPageLayout>
    );
  }

  if (!hasAccess) {
    return <OhAccessDenied data-testid="oh-employment-page" />;
  }

  if (!customerUuid) {
    return (
      <ListPageLayout data-testid="oh-employment-page">
        <div className="p-8 text-sm text-brand-muted">
          Provide a <code>customer</code> query parameter with the client UUID.
        </div>
      </ListPageLayout>
    );
  }

  if (customerQuery.isLoading || !customerQuery.data) {
    return (
      <ListPageLayout data-testid="oh-employment-page">
        <div className="p-8 text-sm text-brand-muted">Loading client…</div>
      </ListPageLayout>
    );
  }

  return (
    <ListPageLayout data-testid="oh-employment-page">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-border bg-white px-4 py-5 md:px-6">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">Employment</h1>
          <p className="text-sm text-brand-muted">
            {customerQuery.data.full_name}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.occupationalHealthRecalls(customerUuid)}>
            Open recalls page
          </Link>
        </Button>
      </div>
      <div className="space-y-8 p-4 md:p-6">
        <CustomerEmploymentEpisodesSection
          customer={customerQuery.data}
          isActive
        />
        <OhHrFitnessSection episodes={episodesQuery.data ?? []} />
        <OhRecallsPanel customer={customerQuery.data} />
      </div>
    </ListPageLayout>
  );
}
