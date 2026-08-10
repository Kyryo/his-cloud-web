import { z } from "zod";

export const updateAppointmentsReportSubscriptionBodySchema = z.object({
  daily_enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const unsubscribeAppointmentsReportsBodySchema = z.object({
  token: z.string().uuid("Enter a valid unsubscribe token."),
});

export type UpdateAppointmentsReportSubscriptionBody = z.infer<
  typeof updateAppointmentsReportSubscriptionBodySchema
>;
