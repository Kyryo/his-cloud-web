export type RemittancePayerOption = {
  code: string;
  label: string;
  description: string;
};

/** Supported remittance payers (mirrors backend PayerCode). */
export const REMITTANCE_PAYERS: RemittancePayerOption[] = [
  {
    code: "MASM",
    label: "MASM",
    description: "Medical Aid Society of Malawi",
  },
];

export function getRemittancePayer(
  code: string,
): RemittancePayerOption | undefined {
  return REMITTANCE_PAYERS.find((payer) => payer.code === code);
}
