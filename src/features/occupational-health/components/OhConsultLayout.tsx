"use client";

import type { ReactNode } from "react";

import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import {
  OhClinicalHistoryPanel,
  type OhHistorySectionId,
} from "@/features/occupational-health/components/OhClinicalHistoryPanel";

export {
  OpdConsultContentPanel as OhConsultContentPanel,
  OpdConsultFormLocked as OhConsultFormLocked,
  OpdConsultFormPanel as OhConsultFormPanel,
};

type OhConsultLayoutProps = {
  visitUuid: string;
  encounterUuid: string;
  form: ReactNode;
  content: ReactNode;
  historySection: OhHistorySectionId;
  wideForm?: boolean;
  "data-testid"?: string;
};

/**
 * OH consult shape: record on the left, this visit in the middle, previous OH
 * visits on the right — same grid as OPD.
 */
export function OhConsultLayout({
  visitUuid,
  encounterUuid,
  form,
  content,
  historySection,
  wideForm = false,
  "data-testid": dataTestId = "oh-consult-layout",
}: OhConsultLayoutProps) {
  return (
    <OpdConsultLayout
      form={form}
      content={content}
      wideForm={wideForm}
      data-testid={dataTestId}
      history={
        <OhClinicalHistoryPanel
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          section={historySection}
          embedded
        />
      }
    />
  );
}
