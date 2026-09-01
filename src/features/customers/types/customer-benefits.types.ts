import type {
  VisitMemberBenefit,
  VisitMemberBenefitsSnapshot,
} from "@/features/visits/types/visit.types";

export type CustomerMemberBenefit = VisitMemberBenefit;
export type CustomerMemberBenefitsSnapshot = VisitMemberBenefitsSnapshot;

export type CustomerMemberBenefitsStatus = {
  snapshot: CustomerMemberBenefitsSnapshot | null;
  check_in_progress: boolean;
};
