export type MemberVisitAutomationItem = {
  uuid: string;
  query: string;
  status: string;
  status_label: string;
  message: string;
  error_message: string;
  customer_name: string;
  customer_uuid: string | null;
  visit_uuid: string | null;
};

export type MemberVisitAutomationRun = {
  uuid: string;
  status: "pending" | "running" | "completed" | "failed" | string;
  payer_code: string;
  total: number;
  completed: number;
  failed: number;
  items: MemberVisitAutomationItem[];
};

export type MemberVisitAutomationSetup = {
  enabled: boolean;
  department: string;
  consultationService: string;
};
