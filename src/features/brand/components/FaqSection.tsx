"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "What is Sigma Health?",
    answer:
      "Sigma Health is a leading provider of innovative healthcare solutions, offering integrated platforms for clinics, hospitals, and patients to improve care and operational efficiency.",
  },
  {
    question: "What services do you offer?",
    answer:
      "We provide electronic medical records systems, telemedicine solutions, appointment management, health analytics, and patient engagement tools.",
  },
  {
    question: "Which industries do you serve?",
    answer:
      "Primarily healthcare institutions including hospitals, clinics, diagnostic centers, and wellness providers.",
  },
  {
    question: "Do you offer custom solutions?",
    answer:
      "Yes, we tailor software and platforms to meet the unique needs of healthcare providers and organizations.",
  },
  {
    question: "How do you ensure data security?",
    answer:
      "We follow enterprise-grade encryption, comply with healthcare regulations, and implement secure development practices for all our solutions.",
  },
  {
    question: "What support is provided?",
    answer:
      "Our support includes 24/7 technical assistance, training, and dedicated account managers to ensure seamless operations.",
  },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white px-6 py-12">
      <div className="mb-12 text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-brand-primary">
          Frequently Asked
        </span>
        <h2 className="mb-6 font-[family-name:var(--font-bricolage)] text-2xl font-extrabold text-brand-navy md:text-4xl">
          Common Questions
        </h2>
        <div className="mx-auto h-0.5 w-24 bg-brand-border" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4">
        {FAQS.map((faq, index) => (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between rounded-xl border border-brand-border bg-brand-tint p-4 text-left transition-all duration-300"
            >
              <h3 className="pr-4 text-lg font-medium text-brand-navy md:text-xl">
                {faq.question}
              </h3>
              <ChevronDown
                className={cn(
                  "h-6 w-6 text-brand-navy transition-transform duration-300",
                  openIndex === index && "rotate-180",
                )}
              />
            </button>

            {openIndex === index && (
              <div className="rounded-xl bg-white px-4 pb-8 pt-4 text-lg leading-relaxed text-brand-muted">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
