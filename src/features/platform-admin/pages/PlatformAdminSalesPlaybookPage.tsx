import { Children, isValidElement, type ReactNode } from "react";
import Link from "next/link";
import { Source_Sans_3 } from "next/font/google";
import {
  ArrowLeft,
  Clock,
  Lock,
  Quote,
} from "lucide-react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ROUTES } from "@/constants/routes";
import {
  parseSalesPlaybookMarkdown,
  readSalesPlaybookMarkdown,
  slugifyHeading,
} from "@/features/platform-admin/services/sales-playbook";
import { cn } from "@/lib/utils";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-landing-body",
});

function nodeToPlainText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return nodeToPlainText(child.props.children);
      }
      return "";
    })
    .join("");
}

const markdownComponents: Components = {
  h1: () => null,
  h2: ({ children }) => {
    const label = nodeToPlainText(children);
    const id = slugifyHeading(label);

    return (
      <h2
        id={id}
        className="landing-display mt-14 scroll-mt-28 border-b border-[color:var(--landing-border)] pb-3 text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] first:mt-0"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="landing-text-ink mt-8 text-lg font-bold tracking-tight">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="landing-text-ink mt-6 text-base font-semibold tracking-tight">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="landing-body mt-4 text-base leading-relaxed text-[color:var(--landing-ledger-ink)]">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)] marker:text-[color:var(--landing-teal)]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)] marker:text-[color:var(--landing-teal)]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[color:var(--landing-ink)]">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-[color:var(--landing-ledger-ink)]">{children}</em>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="landing-focus font-medium text-[color:var(--landing-teal)] underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/50 p-5 sm:p-6">
      <div className="landing-body text-base leading-relaxed text-[color:var(--landing-ink)] [&>p]:mt-0 [&>p]:italic">
        {children}
      </div>
    </blockquote>
  ),
  hr: () => (
    <hr className="my-10 border-[color:var(--landing-border)]" />
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);

    if (isBlock) {
      return <code className={cn("font-mono text-xs", className)}>{children}</code>;
    }

    return (
      <code className="rounded-md bg-[color:var(--landing-warm)] px-1.5 py-0.5 font-mono text-[0.85em] text-[color:var(--landing-ink)]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/60 p-4 text-xs leading-relaxed text-[color:var(--landing-ledger-ink)]">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-[color:var(--landing-border)] shadow-xs">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[color:var(--landing-warm)]/80 text-[color:var(--landing-ink)]">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-[color:var(--landing-border)] px-4 py-3 text-xs font-semibold uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-[color:var(--landing-border)] px-4 py-3 align-top text-[color:var(--landing-ledger-ink)] last:border-b-0">
      {children}
    </td>
  ),
  tr: ({ children }) => <tr className="bg-white even:bg-[color:var(--landing-warm)]/25">{children}</tr>,
};

export async function PlatformAdminSalesPlaybookPage() {
  const markdown = await readSalesPlaybookMarkdown();
  const playbook = parseSalesPlaybookMarkdown(markdown);

  return (
    <div
      data-brand-page
      className={cn(
        sourceSans.variable,
        sourceSans.className,
        // Cancel AppShell content inset so the header band meets the sidebar.
        "-mx-4 bg-white text-[color:var(--landing-ledger-ink)]",
      )}
    >
      <header className="border-b border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/60 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href={ROUTES.platformAdminResourcesSales}
            className="landing-focus mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Sales
          </Link>


          <h1 className="landing-display mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl lg:text-5xl">
            {playbook.title}
          </h1>

          <p className="landing-body mt-4 text-lg leading-relaxed text-[color:var(--landing-ledger-ink)]">
            Internal guide for how Sigma diagnoses clinic problems and closes
            pilots.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[color:var(--landing-border)]/60 pt-4 text-xs text-[color:var(--landing-ledger-ink)]/80 sm:text-sm">
            {playbook.versionLabel ? (
              <div className="flex items-center gap-1.5 font-medium">
                <Clock
                  className="size-4 text-[color:var(--landing-teal)]"
                  aria-hidden="true"
                />
                <span>{playbook.versionLabel}</span>
              </div>
            ) : null}
            <span className="hidden sm:inline" aria-hidden="true">
              •
            </span>
            <div className="flex items-center gap-1.5">
              <Lock
                className="size-4 text-[color:var(--landing-teal)]"
                aria-hidden="true"
              />
              <span>Sales team only</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pt-12 md:px-8">
        {playbook.sections.length > 0 ? (
          <nav
            aria-label="Table of contents"
            className="mb-12 rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/40 p-6 shadow-xs"
          >
            <h2 className="landing-text-ink text-sm font-semibold uppercase tracking-wider">
              On This Page
            </h2>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {playbook.sections.map((sec, idx) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="landing-focus inline-flex items-center gap-1.5 text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)] hover:underline"
                  >
                    <span className="font-mono text-xs text-[color:var(--landing-teal)]">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <span>{sec.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {playbook.pullQuote ? (
          <section className="mb-14 rounded-2xl border border-[color:var(--landing-amber)]/30 bg-[color:var(--landing-amber-tint)]/60 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[color:var(--landing-amber)] shadow-xs">
                <Quote className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="landing-text-ink text-lg font-bold">
                  Guiding principle
                </h3>
                <p className="landing-body mt-2 text-base leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  &ldquo;{playbook.pullQuote}&rdquo;
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <article className="space-y-2 pb-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {playbook.bodyMarkdown}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
