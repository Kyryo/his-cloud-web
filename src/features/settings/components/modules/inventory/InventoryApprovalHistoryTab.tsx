"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { InventoryEmptyState } from "@/features/inventory/components/InventoryEmptyState";
import {
  fetchApprovalRecords,
} from "@/features/inventory/services/inventory-settings.service";
import type { ApprovalRecord } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatDocumentTypeLabel,
} from "@/features/inventory/utils/format-inventory";

type InventoryApprovalHistoryTabProps = {
  isActive: boolean;
};

export function InventoryApprovalHistoryTab({
  isActive,
}: InventoryApprovalHistoryTabProps) {
  const [records, setRecords] = useState<ApprovalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchApprovalRecords({
          pageSize: 50,
          ordering: "-created_at",
        });
        if (!cancelled) {
          setRecords(response.results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load approval history.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <PageLoader message="Loading approval history..." />;
  }

  if (error) {
    return (
      <OrganizationTabSection title="Approval history" description="Recent approval activity across inventory documents.">
        <p className="text-sm text-red-600">{error}</p>
      </OrganizationTabSection>
    );
  }

  if (records.length === 0) {
    return (
      <InventoryEmptyState
        title="No approval activity yet"
        description="Approval records appear here after workflows run on purchase orders, internal orders, or stock adjustments."
      />
    );
  }

  return (
    <OrganizationTabSection
      title="Approval history"
      description="Recent approval activity across inventory documents."
    >
      <div className="overflow-hidden rounded-xl border border-brand-border">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-brand-tint/40 text-left text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Acted at</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.uuid} className="border-b border-brand-border last:border-b-0">
                <td className="px-4 py-3 text-brand-navy">
                  {formatDocumentTypeLabel(record.document_type)}
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {record.reference_model} #{record.reference_id}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-normal">
                    {record.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {formatDisplayDateTime(record.acted_at ?? record.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OrganizationTabSection>
  );
}
