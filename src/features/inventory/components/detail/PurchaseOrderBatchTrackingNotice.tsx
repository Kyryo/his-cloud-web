"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  countLinesMissingBatchOrExpiry,
  type PurchaseOrderLineDraft,
} from "@/features/inventory/types/purchase-order-line-draft";

type PurchaseOrderBatchTrackingNoticeProps = {
  orderUuid: string;
  lines: PurchaseOrderLineDraft[];
  onReviewItems: () => void;
};

function getDismissKey(orderUuid: string, missingCount: number) {
  return `po-batch-notice-dismissed:${orderUuid}:${missingCount}`;
}

export function PurchaseOrderBatchTrackingNotice({
  orderUuid,
  lines,
  onReviewItems,
}: PurchaseOrderBatchTrackingNoticeProps) {
  const missingCount = countLinesMissingBatchOrExpiry(lines);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (missingCount === 0) {
      setIsDismissed(false);
      return;
    }

    const dismissed = sessionStorage.getItem(getDismissKey(orderUuid, missingCount));
    setIsDismissed(dismissed === "1");
  }, [missingCount, orderUuid]);

  if (missingCount === 0 || isDismissed) {
    return null;
  }

  function handleDismiss() {
    sessionStorage.setItem(getDismissKey(orderUuid, missingCount), "1");
    setIsDismissed(true);
  }

  return (
    <Alert
      variant="warning"
      className="mb-4"
      data-testid="purchase-order-batch-tracking-notice"
    >
      <AlertTriangle className="size-4" aria-hidden="true" />
      <AlertTitle>
        {missingCount === 1
          ? "1 line item is missing batch or expiry details"
          : `${missingCount} line items are missing batch or expiry details`}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Record batch number and expiry on each line before confirming this order.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <SecondaryButton type="button" size="sm" onClick={onReviewItems}>
            Review items
          </SecondaryButton>
          <SecondaryButton
            type="button"
            size="sm"
            aria-label="Dismiss warning"
            onClick={handleDismiss}
          >
            <X className="size-4" aria-hidden="true" />
          </SecondaryButton>
        </div>
      </AlertDescription>
    </Alert>
  );
}
