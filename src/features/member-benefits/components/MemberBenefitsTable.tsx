import type { VisitMemberBenefit } from "@/features/visits/types/visit.types";
import {
  benefitLabel,
  formatBenefitBalance,
} from "@/features/member-benefits/utils/member-benefits-format";

type MemberBenefitsTableProps = {
  benefits: VisitMemberBenefit[];
};

export function MemberBenefitsTable({ benefits }: MemberBenefitsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-brand-border bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-slate-50/80 text-left text-xs text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Benefit</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 text-right font-medium">Estimated balance</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {benefits.map((benefit, index) => (
              <tr
                key={`${index}-${benefit.externalBenefitId ?? ""}-${benefit.benefitName ?? ""}-${benefit.benefitId ?? ""}`}
              >
                <td className="px-4 py-3 font-medium text-brand-navy">
                  {benefitLabel(benefit)}
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {benefit.membershipPlan || "—"}
                </td>
                <td className="px-4 py-3 text-right text-brand-navy">
                  {formatBenefitBalance(benefit.balance)}
                </td>
                <td className="px-4 py-3 text-brand-muted">
                  {benefit.status || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
