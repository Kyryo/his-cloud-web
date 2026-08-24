"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { AddActionButton } from "@/components/ui/app-buttons";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { RemittancesTable } from "@/features/claims/components/RemittancesTable";
import { UploadRemittanceDialog } from "@/features/claims/components/UploadRemittanceDialog";
import { fetchRemittanceBatches } from "@/features/claims/services/remittances.service";
import type { RemittanceBatch } from "@/features/claims/types/remittances.types";

export function RemittancesListPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<RemittanceBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const response = await fetchRemittanceBatches({ page: 1, pageSize: 50 });
      setBatches(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load remittances.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const hasActive = batches.some(
      (batch) => batch.status === "queued" || batch.status === "processing",
    );
    if (!hasActive) {
      return;
    }
    const timer = window.setInterval(() => {
      void reload();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [batches, reload]);

  if (isLoading) {
    return <PageLoader message="Loading remittances…" />;
  }

  return (
    <ListPageLayout data-testid="remittances-list-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Remittances"
            description="Upload payer remittance advice, reconcile totals, and apply settlements."
          />
          <ListPageHeaderActions>
            <AddActionButton
              label="Upload remittance"
              showIcon={false}
              onClick={() => setUploadOpen(true)}
              data-testid="remittance-upload-open"
            />
          </ListPageHeaderActions>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageDataSectionsStack>
        {error ? (
          <p className="text-sm text-destructive" data-testid="remittances-error">
            {error}
          </p>
        ) : null}
        <ListPageTableSection>
          <RemittancesTable
            batches={batches}
            onRowClick={(batch) =>
              router.push(ROUTES.remittanceDetail(batch.id))
            }
          />
        </ListPageTableSection>
      </ListPageDataSectionsStack>

      <UploadRemittanceDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(batch) => {
          setUploadOpen(false);
          void reload();
          router.push(ROUTES.remittanceDetail(batch.id));
        }}
      />
    </ListPageLayout>
  );
}
