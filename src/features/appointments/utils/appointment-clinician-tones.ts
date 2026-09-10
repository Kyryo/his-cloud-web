export type AppointmentClinicianTone = {
  avatar: string;
  name: string;
};

const CLINICIAN_TONES: AppointmentClinicianTone[] = [
  { avatar: "bg-brand-primary text-white", name: "text-brand-primary" },
  { avatar: "bg-brand-green text-white", name: "text-brand-green" },
  { avatar: "bg-brand-amber text-white", name: "text-brand-amber" },
  { avatar: "bg-brand-navy text-white", name: "text-brand-navy" },
  { avatar: "bg-teal-800 text-white", name: "text-teal-800" },
  { avatar: "bg-stone-600 text-white", name: "text-stone-700" },
  { avatar: "bg-orange-800 text-white", name: "text-orange-800" },
  { avatar: "bg-emerald-800 text-white", name: "text-emerald-800" },
];

export const UNASSIGNED_CLINICIAN_TONE: AppointmentClinicianTone = {
  avatar: "bg-stone-200 text-stone-500",
  name: "text-stone-500",
};

export function getClinicianInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getClinicianTone(name: string): AppointmentClinicianTone {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return CLINICIAN_TONES[hash % CLINICIAN_TONES.length] ?? CLINICIAN_TONES[0];
}
