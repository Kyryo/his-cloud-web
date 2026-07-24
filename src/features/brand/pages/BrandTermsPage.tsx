"use client";

import {
  FileText,
  CheckCircle2,
  CreditCard,
  Building2,
  Clock,
  Mail,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Scale,
} from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { LandingFooter } from "@/features/brand/components/landing/LandingFooter";
import { Navigation } from "@/features/brand/components/Navigation";

const TERMS_SECTIONS = [
  { id: "acceptance-of-terms", label: "Acceptance of Terms" },
  { id: "description-of-service", label: "Description of the Service" },
  { id: "user-accounts", label: "User Accounts" },
  { id: "acceptable-use", label: "Acceptable Use & Medical Disclaimer" },
  { id: "subscription-billing", label: "Subscription and Billing" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "availability-support", label: "Availability and Support" },
  { id: "data-ownership", label: "Data Ownership" },
  { id: "privacy-incorporation", label: "Privacy" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "termination-terms", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact-information", label: "Contact Information" },
] as const;

export function BrandTermsPage() {
  return (
    <div className="min-h-dvh bg-white text-[color:var(--landing-ledger-ink)]">
      <a href="#main-content" className="landing-skip-link">
        Skip to main content
      </a>
      <Navigation />

      <main id="main-content" className="pb-20 sm:pb-28">
        {/* Page Header */}
        <header className="border-b border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/60 pt-24 pb-12 sm:pt-28 sm:pb-16">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--landing-border)] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-teal)] shadow-xs">
              <FileText className="size-3.5" aria-hidden="true" />
              <span>Terms & Conditions</span>
            </div>

            <h1 className="landing-display mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--landing-ink)] sm:text-4xl lg:text-5xl">
              Terms of Service
            </h1>

            <p className="landing-body mt-4 text-lg leading-relaxed text-[color:var(--landing-ledger-ink)]">
              Please read these terms carefully before accessing or using the Sigma Health Hospital Management Information System.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[color:var(--landing-ledger-ink)]/80 border-t border-[color:var(--landing-border)]/60 pt-4">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                <span>Last updated: July 24, 2026</span>
              </div>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-1.5">
                <Scale className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                <span>Binding SaaS Agreement</span>
              </div>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-1.5">
                <Mail className="size-4 text-[color:var(--landing-teal)]" aria-hidden="true" />
                <span>legal@sigmaconnect.org</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="mx-auto max-w-3xl px-6 pt-12 sm:px-8 sm:pt-16">
          {/* Quick Index */}
          <nav
            aria-label="Table of contents"
            className="mb-12 rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/40 p-6 shadow-xs"
          >
            <h2 className="landing-text-ink text-sm font-semibold uppercase tracking-wider">
              On This Page
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
              {TERMS_SECTIONS.map((sec, idx) => (
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

          {/* Essential Disclaimer Callout */}
          <section className="mb-14 rounded-2xl border border-[color:var(--landing-amber)]/30 bg-[color:var(--landing-amber-tint)]/60 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[color:var(--landing-amber)] shadow-xs">
                <ShieldAlert className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="landing-text-ink text-lg font-bold">
                  Important Notice & Medical Practice Disclaimer
                </h3>
                <p className="landing-body mt-2 text-sm leading-relaxed text-[color:var(--landing-ledger-ink)]">
                  Sigma Health HMIS is an administrative, clinical documentation, and operational software platform. <strong>Sigma Health does not provide medical services, professional diagnosis, or treatment decisions.</strong> Licensed clinical professionals using the platform retain full legal and clinical responsibility for patient care.
                </p>
              </div>
            </div>
          </section>

          {/* Detailed Sections */}
          <div className="space-y-14">
            {/* 1. Acceptance of Terms */}
            <section id="acceptance-of-terms" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                1. Acceptance of Terms
              </h2>
              <p className="landing-body text-base leading-relaxed">
                By registering an account, accessing, or using the Sigma Health software platform (the &quot;Service&quot;), you agree to be legally bound by these Terms of Service (&quot;Terms&quot;).
              </p>
              <p className="landing-body text-sm leading-relaxed">
                If you are registering an account on behalf of a healthcare institution, clinic, hospital, or company, you represent and warrant that you have full legal authority to bind that entity to these Terms. If you do not agree with these Terms, you may not access or use the Service.
              </p>
            </section>

            {/* 2. Description of the Service */}
            <section id="description-of-service" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                2. Description of the Service
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Sigma Health provides a cloud-native Hospital Management Information System (HMIS) incorporating modules for patient registration, electronic clinical encounter logging, appointment scheduling, inventory management, pharmacy dispensation, invoicing, payments, insurance claims, and operational analytics.
              </p>
              <p className="landing-body text-sm leading-relaxed">
                We continuously enhance and update the Service to improve quality, performance, and security. We reserve the right to modify or introduce new features, subject to standard deployment notifications.
              </p>
            </section>

            {/* 3. User Accounts */}
            <section id="user-accounts" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                3. User Accounts
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Access to the Service is granted via authenticated user accounts configured under an authorized tenant organization.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <span><strong>Credential Security:</strong> You are responsible for safeguarding your login credentials and multi-factor authentication devices. Account sharing is strictly prohibited.</span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <span><strong>Authorized Personnel:</strong> Organizations must assign user roles (e.g., Doctor, Pharmacist, Cashier, Admin) accurately according to staff qualifications.</span>
                </li>
                <li className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <span><strong>Breach Notification:</strong> You must immediately notify Sigma Health if you suspect any unauthorized access or compromise of user credentials.</span>
                </li>
              </ul>
            </section>

            {/* 4. Acceptable Use */}
            <section id="acceptable-use" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                4. Acceptable Use & Conduct Rules
              </h2>
              <p className="landing-body text-base leading-relaxed">
                You agree to use the Service strictly in compliance with applicable local and international healthcare laws and regulations.
              </p>
              
              <div className="rounded-xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/30 p-5 space-y-2 text-sm">
                <p className="font-semibold text-[color:var(--landing-ink)]">Prohibited Activities Include:</p>
                <ul className="space-y-2 pl-4 list-disc marker:text-[color:var(--landing-teal)]">
                  <li>Decompiling, reverse engineering, or attempting to extract the underlying source code of the platform.</li>
                  <li>Using automated scraping, bots, or unapproved vulnerability scanners against the production infrastructure.</li>
                  <li>Submitting fraudulent billing entries, false claims, or intentionally misleading medical documentation.</li>
                  <li>Transmitting malicious code, viruses, or attempting denial-of-service attacks against the infrastructure.</li>
                </ul>
              </div>
            </section>

            {/* 5. Subscription and Billing */}
            <section id="subscription-billing" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                5. Subscription and Billing
              </h2>
              <p className="landing-body text-base leading-relaxed">
                The Service is provided under subscription pricing plans (e.g., Essential, Professional, Enterprise) billed on a monthly or annual cycle.
              </p>

              <div className="space-y-3 text-sm pt-2">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <p><strong>Payment Terms:</strong> Fees are due in advance at the start of each billing period. Failed payments may result in account suspension after a 7-day grace period.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <p><strong>Plan Changes:</strong> Upgrades take effect immediately with prorated billing. Plan downgrades apply at the end of the current billing cycle.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <p><strong>Taxes:</strong> All subscription fees are exclusive of applicable national or local taxes, which will be itemized on invoices where required.</p>
                </div>
              </div>
            </section>

            {/* 6. Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                6. Intellectual Property
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Sigma Health and its licensors retain all right, title, and interest in and to the platform, including software code, database architecture, design systems, algorithms, trademarks, and documentation.
              </p>
              <p className="landing-body text-sm leading-relaxed">
                Your subscription grants a non-exclusive, non-transferable, limited license to access and use the platform solely for your internal healthcare and clinic operational purposes.
              </p>
            </section>

            {/* 7. Availability and Support */}
            <section id="availability-support" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                7. Availability and Support
              </h2>
              <p className="landing-body text-base leading-relaxed">
                We strive to maintain a 99.9% uptime target for our production infrastructure.
              </p>
              <p className="landing-body text-sm leading-relaxed">
                Scheduled maintenance windows occur during low-volume hours and are communicated in advance. Technical support is provided via email, ticketing, and dedicated account managers based on your selected plan tier.
              </p>
            </section>

            {/* 8. Data Ownership */}
            <section id="data-ownership" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                8. Data Ownership
              </h2>
              <div className="rounded-xl border border-[color:var(--landing-teal)]/30 bg-[color:var(--landing-teal-tint)]/30 p-5 space-y-2">
                <p className="font-bold text-[color:var(--landing-ink)]">Customer Data Sovereignty Guarantee</p>
                <p className="landing-body text-sm leading-relaxed">
                  You retain exclusive ownership of all health records, patient demographics, clinical documentation, and operational data uploaded to your tenant workspace. Sigma Health claims zero ownership rights over Customer Data.
                </p>
              </div>
            </section>

            {/* 9. Privacy */}
            <section id="privacy-incorporation" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                9. Privacy & Business Associate Terms
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Our handling of personal and healthcare data is governed by our{" "}
                <Link
                  href={ROUTES.privacy}
                  className="landing-focus font-semibold text-[color:var(--landing-teal)] underline underline-offset-4 hover:text-[color:var(--landing-teal-hover)]"
                >
                  Privacy Policy
                </Link>
                , which is explicitly incorporated into these Terms by reference.
              </p>
              <p className="landing-body text-sm leading-relaxed">
                For regulated entities requiring specialized Data Processing Agreements (DPAs) or Business Associate Agreements (BAAs), custom terms can be executed upon request.
              </p>
            </section>

            {/* 10. Limitation of Liability */}
            <section id="limitation-of-liability" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                10. Limitation of Liability
              </h2>
              <p className="landing-body text-base leading-relaxed">
                To the maximum extent permitted by applicable law:
              </p>
              <ul className="space-y-2.5 pl-4 text-sm list-disc marker:text-[color:var(--landing-teal)]">
                <li><strong>No Consequential Damages:</strong> Sigma Health shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, or business opportunity.</li>
                <li><strong>Liability Cap:</strong> Sigma Health&apos;s aggregate liability arising out of or related to these Terms shall not exceed the total fees paid by customer to Sigma Health in the 12 months preceding the event giving rise to liability.</li>
              </ul>
            </section>

            {/* 11. Termination */}
            <section id="termination-terms" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                11. Termination
              </h2>
              <p className="landing-body text-base leading-relaxed">
                Either party may terminate a subscription agreement by providing written notice 30 days prior to the expiration of the current billing cycle.
              </p>
              <p className="landing-body text-sm leading-relaxed">
                Sigma Health may suspend or terminate an account immediately in the event of material breach of these Terms, non-payment, or security threats. Upon termination, a 30-day data export window is granted prior to permanent database deletion.
              </p>
            </section>

            {/* 12. Governing Law */}
            <section id="governing-law" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                12. Governing Law & Dispute Resolution
              </h2>
              <p className="landing-body text-base leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the contracting Sigma Health entity is incorporated, without regard to its conflict of law principles.
              </p>
              <p className="landing-body text-sm leading-relaxed">
                The parties agree to attempt informal resolution of any dispute for 30 days prior to initiating formal legal proceedings or binding arbitration.
              </p>
            </section>

            {/* 13. Contact Information */}
            <section id="contact-information" className="scroll-mt-28 space-y-4">
              <h2 className="landing-display text-2xl font-bold tracking-tight text-[color:var(--landing-ink)] border-b border-[color:var(--landing-border)] pb-3">
                13. Legal Contact Information
              </h2>
              <p className="landing-body text-base leading-relaxed">
                For legal inquiries, contract execution, or notices under these Terms, please contact our legal department:
              </p>

              <div className="rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/50 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-[color:var(--landing-teal)]" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-ledger-ink)]">Legal Email</p>
                    <a
                      href="mailto:legal@sigmaconnect.org"
                      className="landing-focus text-base font-bold text-[color:var(--landing-teal)] hover:underline"
                    >
                      legal@sigmaconnect.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-[color:var(--landing-border)]">
                  <Building2 className="size-5 text-[color:var(--landing-teal)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--landing-ledger-ink)]">Corporate Address</p>
                    <p className="text-sm font-medium text-[color:var(--landing-ink)]">Sigma Health Technologies Inc.</p>
                    <p className="text-xs text-[color:var(--landing-ledger-ink)] mt-0.5">Legal & Governance Department</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href={ROUTES.privacy}
                    className="landing-focus landing-btn-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    <span>Read Privacy Policy</span>
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </Link>
                  <Link
                    href={ROUTES.contacts}
                    className="landing-focus landing-btn-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    <span>Contact Sales</span>
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
