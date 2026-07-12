import { z } from "zod";

export const updateSalesReportSubscriptionBodySchema = z.object({
  daily_enabled: z.boolean().optional(),
  weekly_enabled: z.boolean().optional(),
  monthly_enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const unsubscribeSalesReportsBodySchema = z.object({
  token: z.string().uuid("Enter a valid unsubscribe token."),
});

export type UpdateSalesReportSubscriptionBody = z.infer<
  typeof updateSalesReportSubscriptionBodySchema
>;

export const adminUpdateSalesReportSubscriptionBodySchema = z.object({
  daily_enabled: z.boolean().optional(),
  weekly_enabled: z.boolean().optional(),
  monthly_enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_blocked: z.boolean().optional(),
});

export type AdminUpdateSalesReportSubscriptionBody = z.infer<
  typeof adminUpdateSalesReportSubscriptionBodySchema
>;
