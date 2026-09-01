"use client";

import { Button } from "@/components/ui/button";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ListPageLayout>
      <p className="text-sm text-destructive">{error.message}</p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </ListPageLayout>
  );
}
