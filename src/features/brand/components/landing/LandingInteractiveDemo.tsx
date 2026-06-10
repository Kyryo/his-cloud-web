"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type DemoTab = "queue" | "patient" | "pharmacy" | "billing";

type QueueStatus = "waiting" | "in_consult" | "done";

type QueuePatient = {
  id: string;
  name: string;
  age: number;
  reason: string;
  wait: string;
  status: QueueStatus;
  clientId: string;
  gender: string;
  phone: string;
  diagnosis: string;
  vitals: string;
  notes: string;
  prescriptions: { drug: string; dose: string; qty: number }[];
  invoice: {
    lines: { item: string; amount: number }[];
    paid: number;
    method: string;
  };
};

const CLINIC_NAME = "Sunrise Community Clinic";

const STATUS_LABELS: Record<QueueStatus, string> = {
  waiting: "Waiting",
  in_consult: "In consult",
  done: "Done",
};

const QUEUE_PATIENTS: QueuePatient[] = [
  {
    id: "p1",
    name: "Grace Wanjiku",
    age: 34,
    reason: "Antenatal check-up",
    wait: "12 min",
    status: "in_consult",
    clientId: "SC-1042",
    gender: "Female",
    phone: "+254 712 448 901",
    diagnosis: "Routine ANC — 28 weeks",
    vitals: "BP 118/74 · Temp 36.8°C · Weight 62 kg",
    notes: "Hb due this visit. Tetanus booster on schedule.",
    prescriptions: [
      { drug: "Ferrous sulphate 200mg", dose: "1 tab daily", qty: 30 },
      { drug: "Folic acid 5mg", dose: "1 tab daily", qty: 30 },
    ],
    invoice: {
      lines: [
        { item: "ANC consultation", amount: 800 },
        { item: "Hb test", amount: 450 },
        { item: "Ferrous sulphate 200mg × 30", amount: 180 },
        { item: "Folic acid 5mg × 30", amount: 120 },
      ],
      paid: 0,
      method: "M-Pesa",
    },
  },
  {
    id: "p2",
    name: "Amina Okafor",
    age: 8,
    reason: "Fever and cough",
    wait: "28 min",
    status: "waiting",
    clientId: "SC-0887",
    gender: "Female",
    phone: "+234 803 221 445",
    diagnosis: "Upper respiratory infection — under review",
    vitals: "Temp 38.2°C · HR 102",
    notes: "Mother reports 3-day fever. No known allergies.",
    prescriptions: [
      { drug: "Paracetamol 250mg syrup", dose: "5 ml every 6h", qty: 1 },
      { drug: "Amoxicillin 250mg/5ml", dose: "5 ml twice daily", qty: 1 },
    ],
    invoice: {
      lines: [
        { item: "Paediatric consultation", amount: 1200 },
        { item: "Paracetamol syrup", amount: 350 },
        { item: "Amoxicillin suspension", amount: 890 },
      ],
      paid: 0,
      method: "Cash",
    },
  },
  {
    id: "p3",
    name: "Rajesh Mehta",
    age: 52,
    reason: "Diabetes follow-up",
    wait: "—",
    status: "done",
    clientId: "SC-0315",
    gender: "Male",
    phone: "+91 98765 43210",
    diagnosis: "Type 2 diabetes — controlled",
    vitals: "Fasting glucose 6.4 mmol/L · BP 128/82",
    notes: "Continue current regimen. Review HbA1c in 3 months.",
    prescriptions: [
      { drug: "Metformin 500mg", dose: "1 tab twice daily", qty: 60 },
    ],
    invoice: {
      lines: [
        { item: "Follow-up consultation", amount: 900 },
        { item: "Glucose test strip", amount: 200 },
        { item: "Metformin 500mg × 60", amount: 640 },
      ],
      paid: 1740,
      method: "Cash",
    },
  },
  {
    id: "p4",
    name: "Carlos Mendoza",
    age: 41,
    reason: "Wound dressing",
    wait: "5 min",
    status: "waiting",
    clientId: "SC-1201",
    gender: "Male",
    phone: "+57 310 882 3344",
    diagnosis: "Post-op wound — day 4",
    vitals: "Temp 36.9°C · Wound clean, no erythema",
    notes: "Return in 3 days for dressing change.",
    prescriptions: [
      { drug: "Cloxacillin 500mg", dose: "1 cap four times daily", qty: 20 },
    ],
    invoice: {
      lines: [
        { item: "Wound care", amount: 1500 },
        { item: "Dressing pack", amount: 400 },
        { item: "Cloxacillin 500mg × 20", amount: 520 },
      ],
      paid: 0,
      method: "Insurance",
    },
  },
  {
    id: "p5",
    name: "Fatou Diallo",
    age: 19,
    reason: "Malaria test",
    wait: "—",
    status: "done",
    clientId: "SC-0973",
    gender: "Female",
    phone: "+221 77 123 4567",
    diagnosis: "Malaria RDT negative",
    vitals: "Temp 37.1°C",
    notes: "Advise fluids and rest. Return if fever persists.",
    prescriptions: [],
    invoice: {
      lines: [
        { item: "Consultation", amount: 700 },
        { item: "Malaria RDT", amount: 500 },
      ],
      paid: 1200,
      method: "Orange Money",
    },
  },
];

const PHARMACY_STOCK = [
  { name: "Paracetamol 500mg", onHand: 8, unit: "boxes", reorder: 20, status: "low" as const },
  { name: "Amoxicillin 250mg caps", onHand: 42, unit: "strips", reorder: 15, status: "ok" as const },
  { name: "ORS sachets", onHand: 120, unit: "sachets", reorder: 50, status: "ok" as const },
  { name: "Metformin 500mg", onHand: 6, unit: "bottles", reorder: 10, status: "low" as const },
  { name: "Artemether/Lumefantrine", onHand: 18, unit: "packs", reorder: 12, status: "ok" as const },
  { name: "Gentamicin eye drops", onHand: 3, unit: "bottles", reorder: 5, status: "low" as const },
] as const;

const DEMO_TABS: { id: DemoTab; label: string }[] = [
  { id: "queue", label: "Queue" },
  { id: "patient", label: "Patient record" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "billing", label: "Billing" },
];

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function StatusPill({ status }: { status: QueueStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-2 py-0.5 text-[11px] font-medium leading-none",
        status === "waiting" && "bg-[var(--ld-waiting-bg)] text-[var(--ld-waiting-text)]",
        status === "in_consult" && "bg-[var(--ld-consult-bg)] text-[var(--ld-consult-text)]",
        status === "done" && "bg-[var(--ld-done-bg)] text-[var(--ld-done-text)]",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function DemoField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[11px] text-[var(--ld-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-[var(--ld-text)]">{value}</dd>
    </div>
  );
}

function DemoCallout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "border-l-2 border-[var(--ld-primary)] bg-[var(--ld-accent)] px-3 py-2 text-xs leading-5 text-[var(--ld-text)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

function QueueScreen({
  patients,
  selectedId,
  onSelect,
}: {
  patients: QueuePatient[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const waiting = patients.filter((p) => p.status === "waiting").length;
  const inConsult = patients.filter((p) => p.status === "in_consult").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ld-border)] px-3 py-2 sm:px-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ld-text)]">Today&apos;s queue</h2>
          <p className="text-[11px] text-[var(--ld-muted)]">
            {waiting} waiting · {inConsult} in consult
          </p>
        </div>
        <time className="text-[11px] text-[var(--ld-muted)]">Fri, 5 Jun · 10:42</time>
      </div>

      <DemoCallout className="mx-3 mt-3 sm:mx-4">
        Sigma keeps your waiting list in sync across reception and consulting rooms.
      </DemoCallout>

      <ul className="min-h-0 flex-1 overflow-y-auto divide-y divide-[var(--ld-border)]">
        {patients.map((patient) => {
          const isSelected = patient.id === selectedId;

          return (
            <li key={patient.id}>
              <button
                type="button"
                onClick={() => onSelect(patient.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-3 text-left sm:px-4",
                  isSelected
                    ? "bg-[var(--ld-accent)]"
                    : "bg-[var(--ld-surface)] hover:bg-[var(--ld-hover)]",
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--ld-border)] bg-[var(--ld-bg)] text-[11px] font-semibold text-[var(--ld-primary)]">
                  {patient.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-[var(--ld-text)]">
                      {patient.name}
                    </span>
                    <span className="text-[11px] text-[var(--ld-muted)]">
                      {patient.age} yrs
                    </span>
                    <StatusPill status={patient.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--ld-muted)]">
                    {patient.reason}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-[var(--ld-muted)]">
                  {patient.wait}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PatientScreen({ patient }: { patient: QueuePatient }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--ld-border)] pb-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--ld-text)]">{patient.name}</h2>
          <p className="mt-0.5 text-xs text-[var(--ld-muted)]">
            {patient.age} yrs · {patient.gender} · {patient.clientId}
          </p>
        </div>
        <StatusPill status={patient.status} />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <DemoField label="Phone" value={patient.phone} />
        <DemoField label="Today's visit" value={patient.reason} />
        <DemoField label="Vitals" value={patient.vitals} className="sm:col-span-2" />
        <DemoField label="Working diagnosis" value={patient.diagnosis} className="sm:col-span-2" />
        <DemoField label="Visit notes" value={patient.notes} className="sm:col-span-2" />
      </dl>

      <div className="mt-4 border-t border-[var(--ld-border)] pt-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ld-muted)]">
          Prescriptions
        </h3>
        {patient.prescriptions.length > 0 ? (
          <ul className="mt-2 divide-y divide-[var(--ld-border)] border border-[var(--ld-border)]">
            {patient.prescriptions.map((rx) => (
              <li
                key={rx.drug}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-[var(--ld-text)]">{rx.drug}</p>
                  <p className="text-xs text-[var(--ld-muted)]">{rx.dose}</p>
                </div>
                <span className="text-xs text-[var(--ld-muted)]">Qty {rx.qty}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--ld-muted)]">No prescriptions this visit.</p>
        )}
      </div>

      <div className="mt-4">
        <DemoCallout>
          Sigma links each prescription to inventory — dispensing updates stock automatically.
        </DemoCallout>
      </div>
    </div>
  );
}

function PharmacyScreen({ patient }: { patient: QueuePatient }) {
  const lowItems = PHARMACY_STOCK.filter((item) => item.status === "low");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--ld-text)]">Pharmacy stock</h2>
        <span className="text-[11px] text-[var(--ld-muted)]">Updated just now</span>
      </div>

      {lowItems.length > 0 ? (
        <div className="mt-3 space-y-2">
          {lowItems.map((item) => (
            <p
              key={item.name}
              className="border border-[var(--ld-warning-border)] bg-[var(--ld-warning-bg)] px-3 py-2 text-xs leading-5 text-[var(--ld-text)]"
            >
              <span className="font-medium">{item.name}</span> is running low ({item.onHand}{" "}
              {item.unit} left). Sigma can generate a purchase order automatically.
            </p>
          ))}
        </div>
      ) : null}

      <table className="mt-4 w-full min-w-[280px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--ld-border)] text-[11px] uppercase tracking-wide text-[var(--ld-muted)]">
            <th className="py-2 pr-2 font-medium">Item</th>
            <th className="py-2 pr-2 font-medium">On hand</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {PHARMACY_STOCK.map((item) => (
            <tr key={item.name} className="border-b border-[var(--ld-border)]">
              <td className="py-2.5 pr-2 text-[var(--ld-text)]">{item.name}</td>
              <td className="py-2.5 pr-2 text-[var(--ld-muted)]">
                {item.onHand} {item.unit}
              </td>
              <td className="py-2.5">
                {item.status === "low" ? (
                  <span className="text-xs font-medium text-[var(--ld-warning-text)]">
                    Running low
                  </span>
                ) : (
                  <span className="text-xs text-[var(--ld-muted)]">OK</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {patient.prescriptions.length > 0 ? (
        <div className="mt-4 border-t border-[var(--ld-border)] pt-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ld-muted)]">
            Ready to dispense for {patient.name.split(" ")[0]}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--ld-text)]">
            {patient.prescriptions.map((rx) => (
              <li key={rx.drug} className="flex justify-between gap-2">
                <span>{rx.drug}</span>
                <span className="text-[var(--ld-muted)]">× {rx.qty}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--ld-muted)]">
            Dispensing will deduct stock and attach to today&apos;s visit.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function BillingScreen({ patient }: { patient: QueuePatient }) {
  const subtotal = patient.invoice.lines.reduce((sum, line) => sum + line.amount, 0);
  const balance = subtotal - patient.invoice.paid;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ld-text)]">
            Invoice — {patient.name}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ld-muted)]">{patient.clientId}</p>
        </div>
        <span className="rounded border border-[var(--ld-border)] px-2 py-0.5 text-[11px] text-[var(--ld-muted)]">
          {patient.invoice.method}
        </span>
      </div>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--ld-border)] text-left text-[11px] uppercase tracking-wide text-[var(--ld-muted)]">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {patient.invoice.lines.map((line) => (
            <tr key={line.item} className="border-b border-[var(--ld-border)]">
              <td className="py-2.5 text-[var(--ld-text)]">{line.item}</td>
              <td className="py-2.5 text-right text-[var(--ld-muted)]">
                {formatKes(line.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-4 space-y-2 border-t border-[var(--ld-border)] pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--ld-muted)]">Subtotal</dt>
          <dd className="font-medium text-[var(--ld-text)]">{formatKes(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--ld-muted)]">Paid</dt>
          <dd className="text-[var(--ld-text)]">{formatKes(patient.invoice.paid)}</dd>
        </div>
        <div className="flex justify-between border-t border-[var(--ld-border)] pt-2">
          <dt className="font-semibold text-[var(--ld-text)]">Balance due</dt>
          <dd className="font-semibold text-[var(--ld-text)]">{formatKes(balance)}</dd>
        </div>
      </dl>

      {balance > 0 ? (
        <div className="mt-4">
          <DemoCallout>
            Sigma can send an M-Pesa payment link to {patient.phone} when the visit is closed.
          </DemoCallout>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--ld-done-text)]">Paid in full — receipt ready.</p>
      )}
    </div>
  );
}

export function LandingInteractiveDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("queue");
  const [selectedPatientId, setSelectedPatientId] = useState(QUEUE_PATIENTS[0].id);

  const selectedPatient =
    QUEUE_PATIENTS.find((patient) => patient.id === selectedPatientId) ?? QUEUE_PATIENTS[0];

  function handlePatientSelect(id: string) {
    setSelectedPatientId(id);
    setActiveTab("patient");
  }

  return (
    <div
      className="landing-demo mx-auto w-full max-w-5xl text-[var(--ld-text)]"
      data-landing-demo
    >
      <div className="overflow-hidden rounded-lg border border-[var(--ld-border)] bg-[var(--ld-surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--ld-border)] bg-[var(--ld-chrome)] px-3 py-2 sm:px-4">
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full border border-[var(--ld-border)] bg-[var(--ld-chrome-dot)]" />
            <span className="size-2.5 rounded-full border border-[var(--ld-border)] bg-[var(--ld-chrome-dot)]" />
            <span className="size-2.5 rounded-full border border-[var(--ld-border)] bg-[var(--ld-chrome-dot)]" />
          </div>
          <div className="min-w-0 flex-1 truncate px-2 text-center text-[10px] text-[var(--ld-muted)] sm:text-xs">
            app.sigmahealth.io/{CLINIC_NAME.toLowerCase().replace(/\s+/g, "-")}
          </div>
          <span className="shrink-0 rounded border border-[var(--ld-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--ld-primary)]">
            Live demo
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-[var(--ld-border)] px-3 py-2 sm:px-4">
          <p className="truncate text-xs font-semibold text-[var(--ld-text)] sm:text-sm">
            {CLINIC_NAME}
          </p>
          <p className="shrink-0 text-[10px] text-[var(--ld-muted)]">Nairobi, Kenya</p>
        </div>

        <div
          className="flex overflow-x-auto border-b border-[var(--ld-border)]"
          role="tablist"
          aria-label="Demo screens"
        >
          {DEMO_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium sm:px-4 sm:text-sm",
                activeTab === tab.id
                  ? "border-[var(--ld-primary)] text-[var(--ld-primary)]"
                  : "border-transparent text-[var(--ld-muted)] hover:text-[var(--ld-text)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-[320px] flex-col bg-[var(--ld-bg)] sm:min-h-[380px]">
          {activeTab === "queue" ? (
            <QueueScreen
              patients={QUEUE_PATIENTS}
              selectedId={selectedPatientId}
              onSelect={handlePatientSelect}
            />
          ) : null}
          {activeTab === "patient" ? <PatientScreen patient={selectedPatient} /> : null}
          {activeTab === "pharmacy" ? <PharmacyScreen patient={selectedPatient} /> : null}
          {activeTab === "billing" ? <BillingScreen patient={selectedPatient} /> : null}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-brand-muted">
        Tap a patient in the queue to explore their record, pharmacy items, and invoice.
      </p>
    </div>
  );
}
