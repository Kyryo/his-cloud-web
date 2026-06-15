export {
  closeVisit as closeCustomerVisit,
  countActiveVisits as countActiveCustomerVisits,
  countCompletedVisits as countCompletedCustomerVisits,
  countVisits as countCustomerVisits,
  createVisit as createCustomerVisit,
  fetchCustomerVisits,
  fetchVisit,
  findActiveVisit as findActiveCustomerVisit,
} from "@/features/visits/services/visits.service";

export type { FetchCustomerVisitsOptions } from "@/features/visits/types/visit.types";
