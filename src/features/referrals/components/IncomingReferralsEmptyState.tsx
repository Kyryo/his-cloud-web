import { AppIcon } from "@/components/icons/app-icon";

export function IncomingReferralsEmptyState() {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="incoming-referrals-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <AppIcon name="transfer" size={28} strokeWidth={1.75} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">
        No pending referrals
      </h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Incoming lab referrals awaiting front-desk intake will appear here.
      </p>
    </div>
  );
}
