const PRODUCTS = [
  {
    number: "01",
    title: "Smart EMR",
    description:
      "Centralize all patient records, lab results, and prescriptions in one intuitive platform with real-time access.",
    features: [
      "Secure patient data storage",
      "Instant lab results updates",
      "Prescription management",
    ],
  },
  {
    number: "02",
    title: "TeleConsult",
    description:
      "Enable secure remote consultations and follow-ups, reducing in-clinic congestion and enhancing patient care.",
    features: [
      "Remote consultations with doctors",
      "Secure messaging with patients",
      "Automated follow-up reminders",
    ],
  },
  {
    number: "03",
    title: "Health Analytics",
    description:
      "Unlock actionable insights with real-time dashboards, predictive analytics, and performance tracking.",
    features: [
      "Predictive patient health trends",
      "Real-time dashboards",
      "Performance tracking",
    ],
  },
] as const;

export function ProductsSection() {
  return (
    <section className="relative bg-white py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <h2 className="mb-12 text-center font-[family-name:var(--font-bricolage)] text-5xl font-extrabold text-brand-navy md:text-6xl">
          Our <span className="text-brand-primary">Products</span>
        </h2>

        <div className="space-y-24">
          {PRODUCTS.map((product, index) => (
            <div
              key={product.number}
              className={`flex flex-col items-center gap-12 ${
                index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
              } md:items-start`}
            >
              <div className="text-center md:w-1/2 md:text-left">
                <h3 className="mb-4 flex items-center justify-center gap-3 text-3xl font-bold text-brand-navy md:justify-start">
                  <span className="text-2xl font-extrabold text-brand-primary">
                    {product.number}
                  </span>
                  {product.title}
                </h3>
                <p className="mb-6 text-lg text-brand-muted">{product.description}</p>
                <div className="space-y-3">
                  {product.features.map((feature) => (
                    <p
                      key={feature}
                      className="flex items-center justify-center gap-3 text-lg text-brand-slate md:justify-start"
                    >
                      {feature}
                    </p>
                  ))}
                </div>
              </div>
              <div
                className={`flex md:w-1/2 ${
                  index % 2 === 1 ? "justify-center md:justify-start" : "justify-center md:justify-end"
                }`}
              >
                <span className="text-5xl font-extrabold text-brand-tint">
                  {product.number}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
