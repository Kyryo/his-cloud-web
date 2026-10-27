"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";

import { DestructiveButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  OhPanelSection,
  OhRecordItem,
  OhRecordList,
  OhRecordsEmpty,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import { withdrawFitnessCertificate } from "@/features/occupational-health/services/oh.service";
import type {
  FitnessAssessment,
  FitnessCertificate,
} from "@/features/occupational-health/types";
import {
  formatOhDateRange,
  isCertificateInForce,
  newestFirst,
} from "@/features/occupational-health/utils/oh-format";
import { formatFitnessOutcome } from "@/features/occupational-health/utils/oh-labels";
import { useToast } from "@/providers/toast-provider";

type OhCertificateRecordsProps = {
  assessments: FitnessAssessment[];
  certificates: FitnessCertificate[];
  onChanged: () => void;
};

export function OhCertificateRecords({
  assessments,
  certificates,
  onChanged,
}: OhCertificateRecordsProps) {
  if (certificates.length === 0) {
    return (
      <OhRecordsEmpty
        icon={BadgeCheck}
        title="No certificate yet"
        description={
          assessments.length === 0
            ? "Record a fitness assessment first, then issue a certificate."
            : "Issue the certificate on the left. HR sees the dates, not the clinical notes."
        }
        data-testid="oh-certificate-records-empty"
      />
    );
  }

  const outcomeByAssessmentId = new Map(
    assessments.map((item) => [item.id, item.outcome]),
  );

  return (
    <OhPanelSection title="Certificates" data-testid="oh-fitness-certificates">
      <OhRecordList>
        {newestFirst(certificates, (item) => item.signed_at ?? item.created_at).map(
          (item) => {
            const outcome = outcomeByAssessmentId.get(item.assessment);
            return (
              <OhRecordItem
                key={item.uuid}
                title={
                  outcome
                    ? `${formatFitnessOutcome(outcome)} · v${item.version}`
                    : `Certificate v${item.version}`
                }
                badges={<OhStatusChip value={item.status} />}
                meta={formatOhDateRange(item.valid_from, item.valid_to)}
                action={
                  isCertificateInForce(item) ? (
                    <WithdrawCertificateAction
                      certificateUuid={item.uuid}
                      onWithdrawn={onChanged}
                    />
                  ) : null
                }
              />
            );
          },
        )}
      </OhRecordList>
    </OhPanelSection>
  );
}

type WithdrawCertificateActionProps = {
  certificateUuid: string;
  onWithdrawn: () => void;
};

/** Two-step inline confirm: withdrawing removes the certificate from the HR view. */
function WithdrawCertificateAction({
  certificateUuid,
  onWithdrawn,
}: WithdrawCertificateActionProps) {
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  async function handleWithdraw() {
    setIsWithdrawing(true);
    try {
      await withdrawFitnessCertificate(certificateUuid);
      toast({ variant: "success", title: "Certificate withdrawn" });
      onWithdrawn();
    } catch (error) {
      toast({
        title: "Could not withdraw certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setIsWithdrawing(false);
      setIsConfirming(false);
    }
  }

  if (!isConfirming) {
    return (
      <SecondaryButton
        type="button"
        size="sm"
        className="h-7 px-2.5 text-xs"
        onClick={() => setIsConfirming(true)}
      >
        Withdraw
      </SecondaryButton>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <SecondaryButton
        type="button"
        size="sm"
        className="h-7 px-2.5 text-xs"
        disabled={isWithdrawing}
        onClick={() => setIsConfirming(false)}
      >
        Keep
      </SecondaryButton>
      <DestructiveButton
        type="button"
        size="sm"
        className="h-7 px-2.5 text-xs"
        disabled={isWithdrawing}
        onClick={() => void handleWithdraw()}
      >
        {isWithdrawing ? "Withdrawing…" : "Confirm withdraw"}
      </DestructiveButton>
    </div>
  );
}
