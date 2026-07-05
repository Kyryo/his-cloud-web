import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const LEFT_SERVICES = [
  {
    title: "Patient Management",
    description:
      "Efficiently handle patient records, appointments, and communication in one place.",
  },
  {
    title: "Lab Integration",
    description:
      "Connect with labs seamlessly to receive test results and update patient files instantly.",
  },
  {
    title: "Telehealth Services",
    description: "Enable remote consultations with secure messaging technology.",
  },
] as const;

const RIGHT_SERVICES = [
  {
    title: "Workflow Automation",
    description:
      "Reduce administrative burden with automated notifications, reminders, and reporting.",
  },
  {
    title: "Analytics & Reporting",
    description:
      "Gain actionable insights through real-time dashboards and performance metrics.",
  },
  {
    title: "Scalability",
    description:
      "From small clinics to large hospitals, our platform grows with your needs.",
  },
] as const;

export function ServicesSection() {
  return (
    <section className="relative bg-white py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
        <h2 className="mb-6 font-[family-name:var(--font-bricolage)] text-5xl font-extrabold leading-tight text-brand-navy md:text-6xl">
          Our <span className="text-brand-primary">Services</span>
        </h2>
        <p className="mx-auto mb-20 max-w-2xl text-xl text-brand-muted">
          Solutions designed to streamline your healthcare operations.
        </p>

        <div className="grid gap-16 text-left md:grid-cols-2">
          <div className="space-y-10 rounded-3xl border border-brand-border bg-brand-tint p-8">
            {LEFT_SERVICES.map((service) => (
              <div
                key={service.title}
                className="flex items-start gap-4 border-l-4 border-brand-primary py-4 pl-6"
              >
                <div>
                  <h3 className="mb-2 text-2xl font-semibold text-brand-navy">
                    {service.title}
                  </h3>
                  <p className="text-brand-muted">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-10 rounded-3xl border border-brand-border bg-white p-8">
            {RIGHT_SERVICES.map((service) => (
              <div
                key={service.title}
                className="flex items-start gap-4 border-l-4 border-brand-sky py-4 pl-6"
              >
                <div>
                  <h3 className="mb-2 text-2xl font-semibold text-brand-navy">
                    {service.title}
                  </h3>
                  <p className="text-brand-muted">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Link
            href={ROUTES.services}
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-brand-primary-hover"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  );
}
