import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import type { MemberVisitAutomationRun } from "@/features/customers/types/member-visit-automation.types";
import { bffRequest } from "@/lib/bff-client";

export const MEMBER_VISIT_AUTOMATION_REFRESH = "hmis-member-visit-automation-refresh";

export function notifyMemberVisitAutomationRefresh() {
  window.dispatchEvent(new Event(MEMBER_VISIT_AUTOMATION_REFRESH));
}

export async function startMemberVisitAutomation(options: {
  payer: string;
  clinicId: number;
  entries: string;
  department: string;
  consultationService?: string;
}): Promise<MemberVisitAutomationRun> {
  return bffRequest<MemberVisitAutomationRun>(
    BFF_CLAIMS_ROUTES.clinicMemberVisitAutomation(options.payer, options.clinicId),
    {
      method: "POST",
      body: {
        entries: options.entries,
        department: options.department,
        consultation_service: options.consultationService || null,
      },
    },
  );
}

export async function fetchMemberVisitAutomations(): Promise<
  MemberVisitAutomationRun[]
> {
  const data = await bffRequest<{ results: MemberVisitAutomationRun[] }>(
    BFF_CLAIMS_ROUTES.memberVisitAutomation,
  );
  return data.results;
}
