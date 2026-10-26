"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";

import { DestructiveButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  OhColumnMessage,
  OhPanelSection,
  OhRecordItem,
  OhRecordList,
  OhRecordsEmpty,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import type {
  FitnessAssessment,
  FitnessCertificate,
  OhExamination,
} from "@/features/occupational-health/types";
import { withdrawFitnessCertificate } from "@/features/occupational-health/services/oh.service";
import {
  formatOhDate,
  formatOhDateRange,
  isCertificateInForce,
  newestFirst,
} from "@/features/occupational-health/utils/oh-format";
import {
  formatExamTypeLabel,
  formatFitnessOutcome,
} from "@/features/occupational-health/utils/oh-labels";
import { useToast } from "@/providers/toast-provider";

type OhFitnessRecordsProps = {
  examinations: OhExamination[];
  assessments: FitnessAssessment[];
  certificates: FitnessCertificate[];
  onChanged: () => void;
};

export function OhFitnessRecords({
  examinations,
  assessments,
  certificates,
  onChanged,
}: OhFitnessRecordsProps) {
  if (assessments.length === 0 && certificates.length === 0) {
    return (
      <OhRecordsEmpty
        icon={BadgeCheck}
        title="No fitness decision yet"
        description={
          examinations.length === 0
            ? "Record an examination first, then decide fitness for the job."
            : "Record the outcome on the left. You can issue a certificate once it is saved."
        }
        data-testid="oh-fitness-records-empty"
      />
    );
  }

  const examLabels = new Map(
    examinations.map((exam) => [exam.id, formatExamTypeLabel(exam.exam_type)]),
  );
  const outcomeByAssessmentId = new Map(
    assessments.map((item) => [item.id, item.outcome]),
  );

  return (
    <>
      <OhPanelSection title="Assessments" data-testid="oh-fitness-assessments">
        {assessments.length === 0 ? (
          <OhColumnMessage>No fitness assessments yet.</OhColumnMessage>
        ) : (
          <OhRecordList>
            {newestFirst(assessments, (item) => item.assessed_at).map((item) => (
              <OhRecordItem
                key={item.uuid}
                title={`${examLabels.get(item.examination) ?? "Examination"} assessment`}
                badges={
                  <OhStatusChip
                    value={item.outcome}
                    label={formatFitnessOutcome(item.outcome)}
                  />
                }
                meta={
                  item.review_date
                    ? `Assessed ${formatOhDate(item.assessed_at)} · review ${formatOhDate(item.review_date)}`
                    : `Assessed ${formatOhDate(item.assessed_at)}`
                }
              />
            ))}
          </OhRecordList>
        )}
      </OhPanelSection>

      <OhPanelSection title="Certificates" data-testid="oh-fitness-certificates">
        {certificates.length === 0 ? (
          <OhColumnMessage>No fitness certificates yet.</OhColumnMessage>
        ) : (
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
        )}
      </OhPanelSection>
    </>
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
