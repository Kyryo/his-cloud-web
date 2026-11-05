export default function Loading() {
  return (
    <div className="bg-white pb-20 pt-28 sm:pb-28 sm:pt-36" aria-hidden>
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        <div className="h-3 w-40 rounded bg-[color:var(--landing-border)]" />
        <div className="mt-8 max-w-3xl space-y-4">
          <div className="h-3 w-48 rounded bg-[color:var(--landing-border)]" />
          <div className="h-12 w-[80%] rounded bg-[color:var(--landing-border)]" />
          <div className="h-5 w-full rounded bg-[color:var(--landing-border)]" />
          <div className="h-5 w-[75%] rounded bg-[color:var(--landing-border)]" />
        </div>
        <div className="mt-10 aspect-[16/9] rounded-2xl bg-[color:var(--landing-warm)]" />
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          <div className="h-4 w-full rounded bg-[color:var(--landing-border)]" />
          <div className="h-4 w-full rounded bg-[color:var(--landing-border)]" />
          <div className="h-4 w-5/6 rounded bg-[color:var(--landing-border)]" />
        </div>
      </div>
    </div>
  );
}
