export default function Loading() {
  return (
    <div className="flex h-full flex-col" aria-busy="true" aria-label="Loading template">
      <div className="h-14 shrink-0 border-b border-dash-border bg-white" />
      <div className="grid min-h-0 flex-1 lg:grid-cols-[248px_minmax(0,1fr)_360px]">
        <div className="hidden border-r border-dash-border bg-white lg:block" />
        <div className="mx-auto w-full max-w-3xl space-y-4 px-8 pt-10">
          <div className="h-7 w-1/2 animate-pulse rounded-lg bg-slate-200/70" />
          <div className="h-40 animate-pulse rounded-2xl bg-white" />
          <div className="h-32 animate-pulse rounded-2xl bg-white" />
        </div>
        <div className="hidden border-l border-dash-border bg-white lg:block" />
      </div>
    </div>
  );
}
