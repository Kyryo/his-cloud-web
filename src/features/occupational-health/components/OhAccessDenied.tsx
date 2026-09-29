"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  ListPageBlankState,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { ROUTES } from "@/constants/routes";

type OhAccessDeniedProps = {
  description?: string;
  "data-testid"?: string;
};

export function OhAccessDenied({
  description = "Occupational health is limited to users in the OccupationalHealth group. Ask an administrator to grant access for this workspace.",
  "data-testid": dataTestId = "oh-access-denied",
}: OhAccessDeniedProps) {
  return (
    <ListPageLayout data-testid={dataTestId}>
      <ListPageBlankState
        icon="shield"
        title="Access denied"
        description={description}
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.overview}>Back to overview</Link>
          </Button>
        }
        data-testid={`${dataTestId}-blank`}
      />
    </ListPageLayout>
  );
}
