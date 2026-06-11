"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { ROUTES } from "@/constants/routes";

type InventoryListAccessDeniedProps = {
  message?: string;
};

export function InventoryListAccessDenied({
  message = "You are not authorized to view this section. Sign in again or contact your administrator.",
}: InventoryListAccessDeniedProps) {
  const router = useRouter();

  return (
    <ListPageLayout>
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
