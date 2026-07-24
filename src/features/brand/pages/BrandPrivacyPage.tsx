"use client";

import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck,
  Server,
  UserCheck,
  Mail,
  Clock,
  ChevronRight,
  Database,
  Globe2,
} from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingFooter } from "@/features/brand/components/landing/LandingFooter";
import { Navigation } from "@/features/brand/components/Navigation";

const PRIVACY_SECTIONS = [
  { id: "information-collected", label: "Information We Collect" },
  { id: "how-we-use-information", label: "How We Use Information" },
  { id: "cookies-analytics", label: "Cookies and Analytics" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "international-transfers", label: "International Transfers" },
  { id: "user-rights", label: "User Rights" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes-to-policy", label: "Changes to This Policy" },
  { id: "contact-information", label: "Contact Information" },
] as const;

export function BrandPrivacyPage() {
  return (
    <div className="min-h-dvh bg-white text-[color:var(--landing-ledger-ink)]">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>
      <Navigation />

      <main id="main-content" className="pb-20 sm:pb-28">
        {/* Subtle Page Header */}
        <header className="border-b border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/60 pt-24 pb-12 sm:pt-28 sm:pb-16">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--landing-border)] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)] shadow-xs">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              <span>Legal & Privacy</span>
            </div>

            <h1 className="landing-display mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl lg:text-5xl">
              Privacy Policy
            </h1>

            <p className="landing-body mt-4 text-lg leading-relaxed text-[color:var(--landing-ledger-ink)]">
              Learn how Sigma Health collects, uses, protects, and handles your
              clinical and organizational data in accordance with global healthcare security standards.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[color:var(--landing-ledger-ink)]/80 border-t border-[color:var(--landing-border)]/60 pt-4">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                <span>Last updated: July 24, 2026</span>
              </div>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-1.5">
                <FileCheck className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                <span>8 min read</span>
              </div>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-1.5">
                <Mail className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                <span>privacy@sigmaconnect.org</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="mx-auto max-w-3xl px-6 pt-12 sm:px-8 sm:pt-16">
          {/* Quick Jump Index */}
          <nav
            aria-label="Table of contents"
            className="mb-12 rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/40 p-6 shadow-xs"
          >
            <h2 className="landing-text-ink text-sm font-semibold uppercase tracking-wider">
              On This Page
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
              {PRIVACY_SECTIONS.map((sec, idx) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="landing-focus inline-flex items-center gap-1.5 text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-teal)] hover:underline"
                  >
                    <span className="text-xs font-mono text-[color:var(--landing-teal)]">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <span>{sec.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Key Pledge Highlight Card */}
          <section className="mb-14 rounded-2xl border border-[color:var(--landing-teal)]/20 bg-[color:var(--landing-teal-tint)]/40 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[color:var(--landing-teal)] shadow-xs">
                <Lock className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="landing-text-ink text-lg font-bold">
                  Our Healthcare Data Protection Pledge
                </h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Sigma Health operates as a trusted software platform for healthcare clinics and institutions.
                  We <strong>never sell, license, or monetize</strong> your clinic or patient data. Your clinical records remain 100% your property and are isolated within encrypted, tenant-restricted environments.
                </p>
              </div>
            </div>
          </section>

          {/* Detailed Policy Sections */}
          <div className="space-y-14">
            {/* 1. Information We Collect */}
            <section id="information-collected" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                1. Information We Collect
              </h2>
              <p className="landing-body text-base leading-relaxed">
                To provide our cloud-based Hospital Management Information System (HMIS), Sigma Health collects information necessary to create user accounts, manage clinic subscriptions, and enable healthcare workflows.
              </p>

              <div className="space-y-4 pt-2">
                <div className="rounded-xl border border-[color:var(--landing-border)] bg-white p-5">
                  <h3 className="landing-text-ink text-base font-semibold flex items-center gap-2">
                    <UserCheck className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                    1.1 Account & Contact Information
                  </h3>
                  <p className="landing-body mt-2 text-sm leading-relaxed">
                    When clinic administrators register an organization or invite staff members, we collect names, professional email addresses, telephone numbers, clinical roles, and billing parameters.
                  </p>
                </div>

                <div className="rounded-xl border border-[color:var(--landing-border)] bg-white p-5">
                  <h3 className="landing-text-ink text-base font-semibold flex items-center gap-2">
                    <Database className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                    1.2 Clinical & Operational Data (Customer Data)
                  </h3>
                  <p className="landing-body mt-2 text-sm leading-relaxed">
                    Authorized clinic personnel input clinical data onto the platform, including patient demographics, encounter notes, diagnoses, prescriptions, billing records, inventory transactions, and insurance claims. This data is handled strictly on behalf of the customer organization.
                  </p>
                </div>

                <div className="rounded-xl border border-[color:var(--landing-border)] bg-white p-5">
                  <h3 className="landing-text-ink text-base font-semibold flex items-center gap-2">
                    <Server className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                    1.3 Telemetry & System Diagnostics
                  </h3>
                  <p className="landing-body mt-2 text-sm leading-relaxed">
                    We automatically log system interaction metrics, such as IP addresses, browser specifications, login activity timestamps, request error codes, and audit logs required for security monitoring.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. How We Use Information */}
            <section id="how-we-use-information" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                2. How We Use Information
              </h2>
              <p className="landing-body text-base leading-relaxed">
                We use collected information exclusively for the operation, maintenance, security, and improvement of the Sigma HMIS platform.
              </p>

              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3 text-sm leading-relaxed">
                  <ChevronRight className="mt-1 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <span><strong>Core Service Delivery:</strong> Processing patient visits, pharmacy dispensations, appointment scheduling, billing invoices, and e-claims workflows requested by clinic personnel.</span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed">
                  <ChevronRight className="mt-1 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <span><strong>Security & Compliance Auditing:</strong> Maintaining audit trails for medical data access, verifying user permissions, and detecting suspicious login activity.</span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed">
                  <ChevronRight className="mt-1 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <span><strong>Customer Communications:</strong> Sending operational notices, system maintenance alerts, password resets, and critical compliance updates.</span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed">
                  <ChevronRight className="mt-1 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <span><strong>System Optimization:</strong> Monitoring system latency and application bugs to maintain peak uptime across operating clinics.</span>
                </li>
              </ul>
            </section>

            {/* 3. Cookies and Analytics */}
            <section id="cookies-analytics" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                3. Cookies and Analytics
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Sigma Health uses cookies and similar storage technologies to secure session access and understand aggregate website usage.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/30 p-5">
                  <h3 className="landing-text-ink text-sm font-semibold">Essential Cookies</h3>
                  <p className="landing-body mt-2 text-xs leading-relaxed text-[color:var(--landing-ledger-ink)]">
                    Required for user authentication, multi-tenant workspace routing, CSRF protection, and session security. These cookies cannot be disabled.
                  </p>
                </div>
                <div className="rounded-xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/30 p-5">
                  <h3 className="landing-text-ink text-sm font-semibold">Analytics & Performance</h3>
                  <p className="landing-body mt-2 text-xs leading-relaxed text-[color:var(--landing-ledger-ink)]">
                    Aggregated, non-identifiable usage metrics used to evaluate public page engagement. We do not place third-party advertising tracking cookies.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Data Security */}
            <section id="data-security" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                4. Data Security
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Healthcare information requires high security standards. We enforce stringent technical and organizational controls to protect customer data against unauthorized access, disclosure, or alteration.
              </p>

              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div className="rounded-xl border border-[color:var(--landing-border)] p-4 text-center">
                  <Lock className="mx-auto size-6 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <h3 className="landing-text-ink mt-2 text-sm font-semibold">AES-256 Encryption</h3>
                  <p className="mt-1 text-xs text-[color:var(--landing-ledger-ink)]">All database backups and stored files encrypted at rest.</p>
                </div>
                <div className="rounded-xl border border-[color:var(--landing-border)] p-4 text-center">
                  <ShieldCheck className="mx-auto size-6 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <h3 className="landing-text-ink mt-2 text-sm font-semibold">TLS 1.3 Transport</h3>
                  <p className="mt-1 text-xs text-[color:var(--landing-ledger-ink)]">All web network requests protected via HTTPS TLS 1.3.</p>
                </div>
                <div className="rounded-xl border border-[color:var(--landing-border)] p-4 text-center">
                  <Eye className="mx-auto size-6 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <h3 className="landing-text-ink mt-2 text-sm font-semibold">Strict RBAC Controls</h3>
                  <p className="mt-1 text-xs text-[color:var(--landing-ledger-ink)]">Role-based access checks enforced on every backend request.</p>
                </div>
              </div>
            </section>

            {/* 5. Data Retention */}
            <section id="data-retention" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                5. Data Retention
              </h2>
              <p className="landing-body text-base leading-relaxed">
                We retain customer clinical data for the duration of an active subscription agreement. Upon account termination:
              </p>
              <ul className="space-y-2.5 pl-4 text-sm list-disc marker:text-[color:var(--landing-teal)]">
                <li><strong>Grace Period:</strong> Clinic administrators are provided a 30-day window to export full patient, clinical, and financial records in standard data formats.</li>
                <li><strong>Permanent Deletion:</strong> Following the 30-day grace period, active databases are purged of tenant data. Encrypted backup archives are overwritten according to our standard 90-day rolling rotation.</li>
              </ul>
            </section>

            {/* 6. Third-Party Services */}
            <section id="third-party-services" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                6. Third-Party Services
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Sigma Health relies on audited third-party sub-processors to fulfill infrastructure requirements (such as cloud hosting, transactional email delivery, and regional insurance claim submission gateways).
              </p>
              <p className="landing-body text-sm leading-relaxed">
                All sub-processors are bound by Data Processing Agreements (DPAs) that mandate security and confidentiality protections equivalent to our own standard.
              </p>
            </section>

            {/* 7. International Transfers */}
            <section id="international-transfers" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                7. International Data Transfers
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Sigma Health operates high-availability data centers across multiple regions. Where cross-border data transfers occur, we implement recognized legal transfer mechanisms, including Standard Contractual Clauses (SCCs) and regional health data protection compliance protocols.
              </p>
            </section>

            {/* 8. User Rights */}
            <section id="user-rights" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                8. User & Patient Rights
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Depending on your jurisdiction, organizations and individual users hold specific privacy rights regarding their data:
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-xs">
                    ✓
                  </div>
                  <p><strong>Right to Access & Export:</strong> Clinic admins can export complete clinical dataset logs at any time via the administrative reporting interface.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-xs">
                    ✓
                  </div>
                  <p><strong>Right to Rectification:</strong> Authorized clinical staff can correct or update patient demographic information directly in the master patient index.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--landing-warm)] text-[color:var(--landing-teal)] font-bold text-xs">
                    ✓
                  </div>
                  <p><strong>Patient Inquiries:</strong> Patients requesting medical record modifications should contact their healthcare provider directly, as Sigma acts as a data processor for operating clinics.</p>
                </div>
              </div>
            </section>

            {/* 9. Children's Privacy */}
            <section id="childrens-privacy" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                9. Children&apos;s Privacy
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Sigma Health HMIS software accounts are restricted to licensed healthcare organizations and adult medical personnel. Pediatric patient health data managed within the system by healthcare providers is subject to strict guardian consent requirements governed by the treating medical institution.
              </p>
            </section>

            {/* 10. Changes to This Policy */}
            <section id="changes-to-policy" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                10. Changes to This Policy
              </h2>
              <p className="landing-body text-base leading-relaxed">
                We may update this Privacy Policy periodically to reflect technological or regulatory modifications. When material updates are made, registered clinic administrators will receive notification via email or an in-app banner 30 days prior to the effective date.
              </p>
            </section>

            {/* 11. Contact Information */}
            <section id="contact-information" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                11. Contact Information
              </h2>
              <p className="landing-body text-base leading-relaxed">
                If you have questions, privacy inquiries, or data protection concerns regarding this policy, please reach out to our dedicated Data Protection Officer:
              </p>

              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/50 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-ledger-ink)]">Email Privacy Team</p>
                    <a
                      href="mailto:privacy@sigmaconnect.org"
                      className="landing-focus text-base font-bold text-[color:var(--landing-teal)] hover:underline"
                    >
                      privacy@sigmaconnect.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-[color:var(--landing-border)]">
                  <Globe2 className="size-5 text-[color:var(--landing-teal)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-ledger-ink)]">Organization</p>
                    <p className="text-sm font-medium text-[color:var(--landing-ink)]">Sigma Health Technologies Inc.</p>
                    <p className="text-xs text-[color:var(--landing-ledger-ink)] mt-0.5">Attn: Data Protection Office</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={ROUTES.contacts}
                    className="landing-focus landing-btn-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    <span>Visit Contact Center</span>
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
