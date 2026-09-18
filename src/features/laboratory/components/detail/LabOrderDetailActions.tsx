"use client";

import {
  CheckCircle2,
  FileDown,
  FlaskConical,
  Loader2,
  MoreVertical,
  ShieldCheck,
  TestTube2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccessionOrderDialog } from "@/features/laboratory/components/detail/AccessionOrderDialog";
import { CollectSpecimenDialog } from "@/features/laboratory/components/detail/CollectSpecimenDialog";
import { ConfirmLabActionDialog } from "@/features/laboratory/components/detail/ConfirmLabActionDialog";
import { EnterResultsDialog } from "@/features/laboratory/components/detail/EnterResultsDialog";
import {
  accessionLabOrder,
  cancelLabOrder,
  downloadLabOrderReportPdf,
  fetchLabOrder,
  releaseLabOrderItemResults,
  verifyLabOrderItemResults,
} from "@/features/laboratory/services/laboratory.service";
import type {
  LabOrder,
  LabOrderItem,
  LabSpecimen,
} from "@/features/laboratory/types/laboratory.types";
import {
  canAccessionOrder,
  canCancelLabOrder,
  canCollectSpecimen,
} from "@/features/laboratory/utils/format-lab-order";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type LabOrderDetailActionsProps = {
  order: LabOrder;
  specimens: LabSpecimen[];
  onOrderUpdated: (order: LabOrder) => void;
  onSpecimensUpdated: (specimens: LabSpecimen[]) => void;
  className?: string;
};

export function LabOrderDetailActions({
  order,
  specimens,
  onOrderUpdated,
  onSpecimensUpdated,
  className,
}: LabOrderDetailActionsProps) {
  const { toast } = useToast();
  const [collectOpen, setCollectOpen] = useState(false);
  const [accessionOpen, setAccessionOpen] = useState(false);
  const [enterResultsOpen, setEnterResultsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [verifyItem, setVerifyItem] = useState<LabOrderItem | null>(null);
  const [releaseItem, setReleaseItem] = useState<LabOrderItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isAccessioning, setIsAccessioning] = useState(false);

  const showCollect = canCollectSpecimen(order.status);
  const showAccession = canAccessionOrder(order.status);
  const showCancel = canCancelLabOrder(order.status);
  const verifiableItems = order.items.filter(
    (item) => item.result_status === "ENTERED",
  );
  const releasableItems = order.items.filter(
    (item) => item.result_status === "VERIFIED",
  );

  async function refreshOrder() {
    const updated = await fetchLabOrder(order.uuid);
    onOrderUpdated(updated);
    onSpecimensUpdated(updated.specimens ?? []);
    return updated;
  }

  async function handleAccession(specimenUuids?: string[]) {
    setIsAccessioning(true);
    try {
      await accessionLabOrder(order.uuid, {
        specimen_uuids: specimenUuids?.length ? specimenUuids : null,
      });
      await refreshOrder();
      toast({
        variant: "success",
        title: "Order accessioned",
        description: "Specimens were accessioned into the laboratory.",
      });
      setAccessionOpen(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Accession failed",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : getErrorMessage(error),
      });
    } finally {
      setIsAccessioning(false);
    }
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      const updated = await cancelLabOrder(order.uuid);
      onOrderUpdated(updated);
      toast({
        variant: "success",
        title: "Order cancelled",
        description: "The laboratory order was cancelled.",
      });
      setCancelOpen(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Cancel failed",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : getErrorMessage(error),
      });
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleVerify() {
    if (!verifyItem) {
      return;
    }
    setIsVerifying(true);
    try {
      await verifyLabOrderItemResults(verifyItem.uuid);
      await refreshOrder();
      toast({
        variant: "success",
        title: "Results verified",
        description: `${verifyItem.test_name} results were verified.`,
      });
      setVerifyItem(null);
    } catch (error) {
      toast({
        variant: "error",
        title: "Verify failed",
        description: getErrorMessage(error),
      });
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleRelease() {
    if (!releaseItem) {
      return;
    }
    setIsReleasing(true);
    try {
      await releaseLabOrderItemResults(releaseItem.uuid);
      await refreshOrder();
      toast({
        variant: "success",
        title: "Results released",
        description: `${releaseItem.test_name} results were released.`,
      });
      setReleaseItem(null);
    } catch (error) {
      toast({
        variant: "error",
        title: "Release failed",
        description: getErrorMessage(error),
      });
    } finally {
      setIsReleasing(false);
    }
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      await downloadLabOrderReportPdf(order.uuid);
      toast({
        variant: "success",
        title: "Report downloaded",
        description: "The laboratory report PDF was saved.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Download failed",
        description: getErrorMessage(error),
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {showCollect ? (
        <PrimaryButton
          type="button"
          onClick={() => setCollectOpen(true)}
          data-testid="lab-action-collect"
        >
          <TestTube2 className="size-4" aria-hidden="true" />
          Collect
        </PrimaryButton>
      ) : null}

      {showAccession ? (
        <SecondaryButton
          type="button"
          onClick={() => setAccessionOpen(true)}
          data-testid="lab-action-accession"
        >
          <FlaskConical className="size-4" aria-hidden="true" />
          Accession
        </SecondaryButton>
      ) : null}

      <SecondaryButton
        type="button"
        onClick={() => setEnterResultsOpen(true)}
        data-testid="lab-action-enter-results"
      >
        Enter results
      </SecondaryButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label="More laboratory actions"
            data-testid="lab-action-more"
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {verifiableItems[0] ? (
            <DropdownMenuItem onClick={() => setVerifyItem(verifiableItems[0])}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              Verify results
            </DropdownMenuItem>
          ) : null}
          {releasableItems[0] ? (
            <DropdownMenuItem onClick={() => setReleaseItem(releasableItems[0])}>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Release results
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            disabled={isDownloadingPdf}
            onClick={() => void handleDownloadPdf()}
          >
            {isDownloadingPdf ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileDown className="size-4" aria-hidden="true" />
            )}
            Download report PDF
          </DropdownMenuItem>
          {showCancel ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-700 focus:text-rose-700"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="size-4" aria-hidden="true" />
                Cancel order
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <CollectSpecimenDialog
        order={order}
        open={collectOpen}
        onOpenChange={setCollectOpen}
        onCollected={async (specimen) => {
          onSpecimensUpdated([
            specimen,
            ...specimens.filter((item) => item.uuid !== specimen.uuid),
          ]);
          await refreshOrder();
        }}
      />

      <AccessionOrderDialog
        order={order}
        specimens={specimens}
        open={accessionOpen}
        isSubmitting={isAccessioning}
        onOpenChange={setAccessionOpen}
        onConfirm={(specimenUuids) => {
          void handleAccession(specimenUuids);
        }}
      />

      <EnterResultsDialog
        order={order}
        open={enterResultsOpen}
        onOpenChange={setEnterResultsOpen}
        onSaved={async () => {
          await refreshOrder();
        }}
      />

      <ConfirmLabActionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel laboratory order?"
        description="Cancelling stops further collection, accession, and result entry."
        confirmLabel="Cancel order"
        tone="danger"
        isSubmitting={isCancelling}
        onConfirm={() => void handleCancel()}
      />

      <ConfirmLabActionDialog
        open={Boolean(verifyItem)}
        onOpenChange={(open) => {
          if (!open) {
            setVerifyItem(null);
          }
        }}
        title="Verify results?"
        description={
          verifyItem
            ? `Confirm verification for ${verifyItem.test_name}.`
            : "Confirm verification."
        }
        confirmLabel="Verify"
        isSubmitting={isVerifying}
        onConfirm={() => void handleVerify()}
      />

      <ConfirmLabActionDialog
        open={Boolean(releaseItem)}
        onOpenChange={(open) => {
          if (!open) {
            setReleaseItem(null);
          }
        }}
        title="Release results?"
        description={
          releaseItem
            ? `Release verified results for ${releaseItem.test_name}.`
            : "Release verified results."
        }
        confirmLabel="Release"
        isSubmitting={isReleasing}
        onConfirm={() => void handleRelease()}
      />
    </div>
  );
}
