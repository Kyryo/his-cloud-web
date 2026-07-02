export type BillingActivityRecord = {
  id: number;
  uuid: string;
  occurred_at: string;
  action: string;
  action_display: string;
  summary: string;
  details: Record<string, unknown>;
  actor_name: string;
  actor_email: string;
  related_object_type: string;
  related_object_id: string;
  related_object_uuid: string;
};

export type BillingActivityListResponse = {
  results: BillingActivityRecord[];
};
