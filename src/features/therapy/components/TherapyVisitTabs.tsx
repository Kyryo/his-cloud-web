"use client";

import {
  CalendarClock,
  ClipboardList,
  Dumbbell,
  FileText,
  NotepadText,
  Workflow,
} from "lucide-react";

import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { TreatmentGoalsPanel } from "@/features/therapy/components/TreatmentGoalsPanel";
import { TreatmentPlanTab } from "@/features/therapy/components/TreatmentPlanTab";
import { VisitDetailsTab } from "@/features/therapy/components/VisitDetailsTab";
import { FutureAppointmentsTab } from "@/features/therapy/components/FutureAppointmentsTab";
import { SessionsTab } from "@/features/therapy/components/SessionsTab";
import { SessionActivityTab } from "@/features/therapy/components/SessionActivityTab";
import { AssessmentSessionTab } from "@/features/therapy/components/AssessmentSessionTab";
import type {
  TherapyAssessment,
  TherapyDiscipline,
  TherapyVisit,
  TherapyVisitTreatmentGoals,
} from "@/features/therapy/types/therapy.types";

const TABS = [
  { id: "sessions", label: "Sessions", icon: Workflow },
  { id: "session-activity", label: "Session Activity", icon: Dumbbell },
  { id: "treatment-plan", label: "Treatment plan", icon: ClipboardList },
  { id: "visit-details", label: "Visit Details", icon: FileText },
  {
    id: "future-appointments",
    label: "Future Appointments",
    icon: CalendarClock,
  },
] as const;

const ASSESSMENT_TAB = {
  id: "assessment",
  label: "Assessment Session",
  icon: NotepadText,
} as const;

export type TherapyVisitTabId =
  | (typeof TABS)[number]["id"]
  | typeof ASSESSMENT_TAB.id;

type TherapyVisitTabsProps = {
  discipline: TherapyDiscipline;
  visitUuid: string;
  assessment: TherapyAssessment | null;
  treatmentGoals: TherapyVisitTreatmentGoals;
  visit: TherapyVisit;
  onTreatmentGoalsChanged: () => Promise<void>;
  onSessionCountChanged: (count: number) => void;
  onActivityCountChanged: (count: number) => void;
  onAssessmentChanged: (assessment: TherapyAssessment) => void;
  sessionCount: number;
  activeTab: TherapyVisitTabId;
  onActiveTabChange: (tab: TherapyVisitTabId) => void;
};

export function TherapyVisitTabs({
  discipline,
  visitUuid,
  assessment,
  treatmentGoals,
  visit,
  onTreatmentGoalsChanged,
  onSessionCountChanged,
  onActivityCountChanged,
  onAssessmentChanged,
  sessionCount,
  activeTab,
  onActiveTabChange,
}: TherapyVisitTabsProps) {
  const isReadOnly =
    visit.status === "completed" ||
    treatmentGoals.treatment_plan?.status === "completed" ||
    treatmentGoals.treatment_plan?.status === "discontinued";
  const visibleTabs = assessment ? [ASSESSMENT_TAB, ...TABS] : TABS;
  const activeTabConfig =
    visibleTabs.find((tab) => tab.id === activeTab) ?? visibleTabs[0];
  const ActiveTabIcon = activeTabConfig.icon;

  return (
    <DetailPageTabsSection className="bg-white">
      <DetailPageTabsNavSection aria-label="Therapy visit sections">
        {visibleTabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => onActiveTabChange(tab.id)}
          >
            <span className="flex items-center gap-2">
              <tab.icon className="size-4" aria-hidden="true" />
              {tab.label}
            </span>
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid className="min-h-[calc(100vh-15rem)] xl:grid-cols-[minmax(0,1fr)_19rem]">
        <DetailPageMainSection className="bg-white">
          {activeTab === "assessment" && assessment ? (
            <AssessmentSessionTab
              assessment={assessment}
              discipline={discipline}
              visitUuid={visitUuid}
              onAssessmentChanged={onAssessmentChanged}
              isReadOnly={isReadOnly}
            />
          ) : activeTab === "treatment-plan" ? (
            <TreatmentPlanTab
              discipline={discipline}
              visitUuid={visitUuid}
              data={treatmentGoals}
              onChanged={onTreatmentGoalsChanged}
              isReadOnly={isReadOnly}
            />
          ) : activeTab === "sessions" ? (
            <SessionsTab
              discipline={discipline}
              visitUuid={visitUuid}
              hasTreatmentPlan={Boolean(treatmentGoals.treatment_plan)}
              isReadOnly={isReadOnly}
              onSessionCountChanged={onSessionCountChanged}
            />
          ) : activeTab === "session-activity" ? (
            <SessionActivityTab
              discipline={discipline}
              visitUuid={visitUuid}
              hasSession={sessionCount > 0}
              isReadOnly={isReadOnly}
              onActivityCountChanged={onActivityCountChanged}
            />
          ) : activeTab === "visit-details" ? (
            <VisitDetailsTab visit={visit} />
          ) : activeTab === "future-appointments" ? (
            <FutureAppointmentsTab
              discipline={discipline}
              visitUuid={visitUuid}
            />
          ) : (
            <div className="px-2 py-10 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand-primary">
                <ActiveTabIcon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-brand-navy">
                {activeTabConfig.label}
              </h2>
              <p className="mt-2 text-sm text-brand-muted">
                This section will appear here when its clinical workflow is
                added.
              </p>
            </div>
          )}
        </DetailPageMainSection>

        <TreatmentGoalsPanel
          discipline={discipline}
          visitUuid={visitUuid}
          data={treatmentGoals}
          onChanged={onTreatmentGoalsChanged}
          onRequestTreatmentPlan={() => onActiveTabChange("treatment-plan")}
          isReadOnly={isReadOnly}
        />
      </DetailPageMainAsideGrid>
    </DetailPageTabsSection>
  );
}
