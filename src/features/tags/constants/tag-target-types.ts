export const TAG_TARGET_TYPES = {
  CUSTOMER: "sales.Customer",
} as const;

export type TagTargetType = (typeof TAG_TARGET_TYPES)[keyof typeof TAG_TARGET_TYPES];
