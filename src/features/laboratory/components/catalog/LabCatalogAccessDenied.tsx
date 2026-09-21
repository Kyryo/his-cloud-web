"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
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
      <EmptyState
        icon={ShieldAlert}
        title="Access denied"
        description={message}
        action={
          <Button onClick={() => router.push(ROUTES.auth)}>Go to sign in</Button>
        }
      />
    </ListPageLayout>
  );
}
