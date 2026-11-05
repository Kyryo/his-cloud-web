export function BlogListingSkeleton() {
  return (
    <div className="space-y-10" aria-hidden data-testid="blog-listing-skeleton">
      <div className="grid overflow-hidden rounded-2xl border border-[color:var(--landing-border)] lg:grid-cols-2">
        <div className="min-h-[18rem] bg-[color:var(--landing-warm)] p-8 lg:min-h-[22rem]">
          <div className="h-3 w-40 rounded bg-[color:var(--landing-border)]" />
          <div className="mt-6 h-10 w-[80%] max-w-md rounded bg-[color:var(--landing-border)]" />
          <div className="mt-3 h-10 w-[60%] max-w-sm rounded bg-[color:var(--landing-border)]" />
        </div>
        <div className="min-h-[16rem] bg-[color:var(--landing-warm)] lg:min-h-full" />
      </div>
      <div className="h-12 border-b border-[color:var(--landing-border)]" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[16/10] rounded-xl bg-[color:var(--landing-warm)]" />
            <div className="h-3 w-28 rounded bg-[color:var(--landing-border)]" />
            <div className="h-5 w-[80%] rounded bg-[color:var(--landing-border)]" />
            <div className="h-4 w-full rounded bg-[color:var(--landing-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
