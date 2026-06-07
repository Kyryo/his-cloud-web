function maskLocalPart(local: string): string {
  if (local.length === 0) return "";
  const maskLength = Math.min(Math.max(local.length - 1, 1), 3);
  return `${local[0]}${"*".repeat(maskLength)}`;
}

function maskDomain(domain: string): string {
  const parts = domain.split(".");

  if (parts.length === 1) {
    return maskLocalPart(parts[0]);
  }

  const tld = parts.pop()!;
  const maskedLabels = parts.map((label) => maskLocalPart(label));

  return [...maskedLabels, tld].join(".");
}

/** Masks local and domain parts, e.g. hello@example.com → h***@e***.com */
export function maskEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");

  if (atIndex <= 0) {
    return trimmed;
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (!domain) {
    return `${maskLocalPart(local)}@`;
  }

  return `${maskLocalPart(local)}@${maskDomain(domain)}`;
}
