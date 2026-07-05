import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const FEATURES = [
  {
    title: "Patient Records",
    desc: "Secure and easy to access.",
    iconBg: "bg-brand-tint text-brand-primary",
  },
  {
    title: "Lab Integrations",
    desc: "Seamless data flow.",
    iconBg: "bg-brand-tint text-brand-sky",
  },
  {
    title: "Faster Workflow",
    desc: "Save time, reduce errors.",
    iconBg: "bg-brand-tint text-brand-primary",
  },
  {
    title: "Scalable",
    desc: "From small clinics to hospitals.",
    iconBg: "bg-brand-tint text-brand-sky",
  },
] as const;

export function AboutSection() {
  return (
    <section className="relative bg-white py-32">
      <div className="absolute inset-0">
        <Image
          src="/grid-bg.svg"
          alt=""
          fill
          className="object-cover opacity-20"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
        <h2 className="mb-6 font-[family-name:var(--font-bricolage)] text-5xl font-extrabold leading-tight text-brand-navy md:text-6xl">
          Smarter{" "}
          <span className="text-brand-primary">Healthcare</span>
        </h2>

        <p className="mx-auto mb-20 max-w-2xl text-xl text-brand-muted">
          All your tools in one simple, modern platform.
        </p>

        <div className="mb-20 flex flex-col justify-center gap-16 sm:flex-row">
          {[
            { value: "50K+", label: "Customers", color: "text-brand-primary" },
            { value: "30+", label: "Clinics", color: "text-brand-sky" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className={`text-4xl font-extrabold ${stat.color}`}>
                {stat.value}
              </span>
              <span className="mt-2 text-brand-muted">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mb-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${feature.iconBg}`}
              >
                <span className="text-lg font-bold">+</span>
              </div>
              <h3 className="text-lg font-semibold text-brand-navy">
                {feature.title}
              </h3>
              <p className="text-sm text-brand-muted">{feature.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href={ROUTES.about}
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-brand-primary-hover"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
}
