import {
  Bricolage_Grotesque,
  Fraunces,
  Patrick_Hand,
  Source_Serif_4,
} from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--review-bricolage",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--review-source-serif",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--review-fraunces",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--review-patrick",
});

const HEADLINE =
  "Sigma keeps your clinic running every day, not just on paper.";

const REGISTER_ROWS = [
  "Paracetamol 500mg — qty ???",
  "Claim #1042 — status unknown",
  "Invoice — paid?",
] as const;

const FONT_OPTIONS = [
  {
    id: "current",
    label: "Current — Bricolage Grotesque",
    note: "Rounded geometric grotesque. Friendly, but reads startup/playful at extrabold.",
    className: "font-[family-name:var(--review-bricolage)]",
  },
  {
    id: "source-serif",
    label: "Option A — Source Serif 4",
    note: "Pairs with Source Sans 3 body. Editorial warmth, clinic-report authority.",
    className: "font-[family-name:var(--review-source-serif)]",
  },
  {
    id: "fraunces",
    label: "Option B — Fraunces",
    note: "Soft old-style serif with optical sizing. Approachable, not corporate.",
    className: "font-[family-name:var(--review-fraunces)]",
  },
] as const;

export default function DesignReviewPage() {
  return (
    <div
      data-brand-page
      className={`${bricolage.variable} ${sourceSerif.variable} ${fraunces.variable} ${patrickHand.variable} min-h-screen bg-[color:var(--landing-clay)] py-16`}
    >
      <div className="mx-auto max-w-6xl space-y-16 px-6 sm:px-12">
        <header className="space-y-3">
          <p className="landing-body text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--landing-teal)]">
            Design review — not live
          </p>
          <h1 className="landing-text-ink text-2xl font-semibold">
            Landing polish proposals
          </h1>
          <p className="landing-body max-w-2xl text-sm text-[color:var(--landing-ledger-ink)]">
            Side-by-side previews for typeface, register panel, contrast, and
            palette decisions. Nothing here is applied to the homepage yet.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="landing-text-ink text-lg font-semibold">
            1. Hero headline typeface
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {FONT_OPTIONS.map((font) => (
              <article
                key={font.id}
                className="rounded-[14px] border border-brand-border bg-[color:var(--landing-warm)] p-6"
              >
                <p className="landing-body text-xs font-semibold uppercase tracking-wide text-[color:var(--landing-teal)]">
                  {font.label}
                </p>
                <p
                  className={`${font.className} landing-text-ink mt-4 text-[clamp(1.35rem,2.5vw,1.75rem)] font-extrabold leading-[1.08] tracking-[-0.03em]`}
                >
                  {HEADLINE}
                </p>
                <p className="landing-body mt-4 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  {font.note}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="landing-text-ink text-lg font-semibold">
            2. Register panel handwriting
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="overflow-hidden rounded-[14px] border border-brand-border bg-white shadow-[var(--landing-shadow)] lg:flex">
              <div className="landing-paper-panel flex flex-1 flex-col justify-center px-5 py-6">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[color:var(--landing-ledger-ink)]/70">
                  Before — monospace
                </p>
                <ul className="space-y-4">
                  {REGISTER_ROWS.map((row) => (
                    <li
                      key={row}
                      className="font-mono text-sm leading-snug text-[color:var(--landing-ledger-ink)]/90"
                    >
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
            <article className="overflow-hidden rounded-[14px] border border-brand-border bg-white shadow-[var(--landing-shadow)] lg:flex">
              <div className="landing-paper-panel flex flex-1 flex-col justify-center px-5 py-6">
                <p className="mb-4 font-[family-name:var(--review-patrick)] text-[11px] uppercase tracking-wide text-[color:var(--landing-ledger-ink)]">
                  After — Patrick Hand
                </p>
                <ul className="space-y-4">
                  {REGISTER_ROWS.map((row) => (
                    <li
                      key={row}
                      className="font-[family-name:var(--review-patrick)] text-[15px] leading-snug text-[color:var(--landing-ledger-ink)]"
                    >
                      {row}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="landing-text-ink text-lg font-semibold">
            5. Palette differentiation preview
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[14px] border border-brand-border bg-[color:var(--landing-warm)] p-6">
              <p className="landing-body text-xs font-semibold uppercase tracking-wide text-[color:var(--landing-teal)]">
                Current teal #0B6E6E
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-block size-10 rounded-full bg-[#0B6E6E]" />
                <span className="landing-btn-primary inline-flex rounded-full px-5 py-2 text-sm font-semibold">
                  Start for free
                </span>
              </div>
            </article>
            <article className="rounded-[14px] border border-brand-border bg-[color:var(--landing-warm)] p-6">
              <p className="landing-body text-xs font-semibold uppercase tracking-wide text-[#096B62]">
                Proposed — Deep clinic teal #096B62 + green stat accent
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-block size-10 rounded-full bg-[#096B62]" />
                <span
                  className="inline-flex rounded-full px-5 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#096B62" }}
                >
                  Start for free
                </span>
              </div>
              <p
                className="mt-4 font-[family-name:var(--review-bricolage)] text-2xl font-extrabold"
                style={{ color: "#2F5E46" }}
              >
                200+
              </p>
              <p className="landing-body text-sm text-[color:var(--landing-ledger-ink)]">
                Hero stat numbers in mature green (one distinctive accent use)
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
