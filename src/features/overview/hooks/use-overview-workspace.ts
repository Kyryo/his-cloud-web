import { useQuery } from "@tanstack/react-query";

import { fetchAppointments, fetchAppointmentSummaryStats } from "@/features/appointments/services/appointments.service";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import { fetchCustomerSummaryStats } from "@/features/customers/utils/customer-stats";
import { fetchInboxItems } from "@/features/notifications/services/inbox.service";
import { localTodayIso } from "@/features/overview/utils/overview-workspace";
import { fetchVisitQueueSummary, fetchVisits } from "@/features/visits/services/visits.service";

export const OVERVIEW_WORKSPACE_QUERY_KEY = "overview-workspace";

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export function useOverviewWorkspace() {
  return useQuery({
    queryKey: [OVERVIEW_WORKSPACE_QUERY_KEY],
    queryFn: async () => {
      const today = localTodayIso();
      const [
        customers,
        customerStats,
        visits,
        visitSummary,
        appointments,
        appointmentStats,
        inbox,
      ] = await Promise.allSettled([
        fetchCustomers({ page: 1, pageSize: 8, ordering: "-created_at" }),
        fetchCustomerSummaryStats(),
        fetchVisits({ page: 1, pageSize: 8, isActive: true }),
        fetchVisitQueueSummary(),
        fetchAppointments({
          page: 1,
          pageSize: 8,
          scheduledFrom: today,
          scheduledTo: today,
        }),
        fetchAppointmentSummaryStats(),
        fetchInboxItems({ page: 1, pageSize: 8 }),
      ]);

      const customerList = settledValue(customers, {
        results: [],
        pagination: null,
      });
      const visitList = settledValue(visits, {
        results: [],
        pagination: null,
      });
      const appointmentList = settledValue(appointments, {
        results: [],
        pagination: null,
      });
      const customerStatsValue = settledValue(customerStats, {
        totalClients: 0,
        newThisMonth: 0,
        maleCount: 0,
        femaleCount: 0,
        otherCount: 0,
        averageAge: 0,
      });
      const visitSummaryValue = settledValue(visitSummary, {
        todays_visits: 0,
        todays_active_visits: 0,
        todays_completed_visits: 0,
        total_visits: 0,
      });
      const appointmentStatsValue = settledValue(appointmentStats, {
        todays_appointments: 0,
        upcoming_appointments: 0,
        in_progress: 0,
        cancelled_today: 0,
      });

      return {
        customers: customerList.results,
        customerCount:
          customerStatsValue.totalClients ||
          customerList.pagination?.count ||
          customerList.results.length,
        newClientsThisMonth: customerStatsValue.newThisMonth,
        visits: visitList.results,
        activeVisitCount:
          visitSummaryValue.todays_active_visits ||
          visitList.pagination?.count ||
          visitList.results.length,
        completedVisitsToday: visitSummaryValue.todays_completed_visits,
        appointments: appointmentList.results,
        todaysAppointmentCount:
          appointmentStatsValue.todays_appointments ||
          appointmentList.pagination?.count ||
          appointmentList.results.length,
        inProgressAppointmentCount: appointmentStatsValue.in_progress,
        inbox: settledValue(inbox, {
          results: [],
          pagination: null,
        }).results,
      };
    },
  });
}
