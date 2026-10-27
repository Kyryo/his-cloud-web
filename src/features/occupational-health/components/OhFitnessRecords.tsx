"use client";

import { BadgeCheck } from "lucide-react";

import {
  OhPanelSection,
  OhRecordItem,
  OhRecordList,
  OhRecordsEmpty,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import type {
  FitnessAssessment,
  OhExamination,
} from "@/features/occupational-health/types";
import { formatOhDate, newestFirst } from "@/features/occupational-health/utils/oh-format";
import {
  formatExamTypeLabel,
  formatFitnessOutcome,
} from "@/features/occupational-health/utils/oh-labels";

type OhFitnessRecordsProps = {
  examinations: OhExamination[];
  assessments: FitnessAssessment[];
};

export function OhFitnessRecords({
  examinations,
  assessments,
}: OhFitnessRecordsProps) {
  if (assessments.length === 0) {
    return (
      <OhRecordsEmpty
        icon={BadgeCheck}
        title="No fitness decision yet"
        description={
          examinations.length === 0
            ? "Record an examination first, then decide fitness for the job."
            : "Record the outcome on the left."
        }
        data-testid="oh-fitness-records-empty"
      />
    );
  }

  const examLabels = new Map(
    examinations.map((exam) => [exam.id, formatExamTypeLabel(exam.exam_type)]),
  );

  return (
    <OhPanelSection title="Assessments" data-testid="oh-fitness-assessments">
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
    </OhPanelSection>
  );
}
