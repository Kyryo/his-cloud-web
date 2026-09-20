"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { ROUTES } from "@/constants/routes";

type LabCatalogAccessDeniedProps = {
  message?: string;
  "data-testid"?: string;
};

export function LabCatalogAccessDenied({
  message = "You are not authorized to manage the laboratory catalog. Sign in again or contact your administrator.",
  "data-testid": dataTestId = "lab-catalog-access-denied",
}: LabCatalogAccessDeniedProps) {
  const router = useRouter();

  return (
    <ListPageLayout data-testid={dataTestId}>
      <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-brand-navy">Access denied</h1>
        <p className="mt-2 text-sm text-brand-muted">{message}</p>
        <Button className="mt-6" onClick={() => router.push(ROUTES.auth)}>
          Go to sign in
        </Button>
      </div>
    </ListPageLayout>
  );
}
