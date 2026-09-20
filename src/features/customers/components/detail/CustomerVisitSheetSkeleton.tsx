export function CustomerVisitSheetSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="flex gap-5">
        <div className="h-5 w-12 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-10 animate-pulse rounded-md bg-slate-100" />
      <div className="h-10 animate-pulse rounded-md bg-slate-100" />
      <div className="h-10 animate-pulse rounded-md bg-slate-100" />
    </div>
  );
}
