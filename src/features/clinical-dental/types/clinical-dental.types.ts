export type DentalCondition =
  | "caries"
  | "restoration"
  | "crown"
  | "missing"
  | "extracted"
  | "implant"
  | "root_canal"
  | "fracture"
  | "bridge"
  | "sealant"
  | "mobility"
  | "watch";

export type ToothSurface = "M" | "O" | "D" | "B" | "L" | "I";

export type DentalFindingStatus = "active" | "resolved";

export type DentalChartFinding = {
  uuid: string;
  tooth_number: number;
  surfaces: ToothSurface[];
  condition: DentalCondition;
  condition_display: string;
  status: DentalFindingStatus;
  notes: string;
  recorded_at: string;
  recorded_by_name: string | null;
  encounter_uuid: string;
  visit_uuid: string;
  visit_date: string | null;
  resolved_at: string | null;
  resolved_in_encounter_uuid: string | null;
};

export type DentalChart = {
  /** Active findings of the client across dental visits. */
  current: DentalChartFinding[];
  /** Findings recorded during this encounter. */
  encounter_findings: DentalChartFinding[];
};

export type DentalFindingPayload = {
  tooth_number: number;
  condition: DentalCondition;
  surfaces: ToothSurface[];
  notes?: string;
};

export type DentalFindingUpdatePayload = Partial<
  Omit<DentalFindingPayload, "tooth_number">
> & {
  status?: "resolved";
};

export type DentalProcedure = {
  uuid: string;
  product_uuid: string | null;
  procedure_name: string;
  procedure_code: string;
  tooth_numbers: number[];
  surfaces: ToothSurface[];
  treatment_status: string;
  treatment_date: string;
  notes: string;
  materials_used: string;
  diagnosis: string;
  performed_by_name: string | null;
  provider_name: string;
  actual_cost: string | null;
  visit_order_uuid: string | null;
  plan_item_uuid: string | null;
  encounter_uuid: string;
  created_at: string;
  /** Visit still active and the bill is not invoiced. */
  can_delete?: boolean;
  can_edit?: boolean;
};

export type DentalProcedureUpdatePayload = {
  tooth_numbers?: number[];
  surfaces?: ToothSurface[];
};

export type DentalToothHistory = {
  tooth_number: number;
  findings: DentalChartFinding[];
  treatments: DentalProcedure[];
};

export type DentalPlanStatus =
  | "draft"
  | "proposed"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DentalPlanItemStatus = "planned" | "performed" | "cancelled";

export type DentalTreatmentPlanItem = {
  uuid: string;
  product_uuid: string;
  product_name: string;
  product_code: string;
  tooth_numbers: number[];
  surfaces: ToothSurface[];
  sequence: number;
  status: DentalPlanItemStatus;
  estimated_price: string | null;
  notes: string;
  performed_treatment_uuid: string | null;
  performed_at: string | null;
};

export type DentalTreatmentPlan = {
  uuid: string;
  title: string;
  notes: string;
  status: DentalPlanStatus;
  accepted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  created_by_name: string | null;
  encounter_uuid: string;
  visit_uuid: string;
  items: DentalTreatmentPlanItem[];
  estimated_total: string;
};

export type DentalPlanItemPayload = {
  product_uuid: string;
  tooth_numbers: number[];
  surfaces: ToothSurface[];
  sequence?: number;
  estimated_price?: string | null;
  notes?: string;
};

export type DentalTreatmentPlanPayload = {
  title: string;
  notes?: string;
  items?: DentalPlanItemPayload[];
};

export type DentalPlanUpdatePayload = {
  title?: string;
  notes?: string;
  status?: DentalPlanStatus;
};

export type DentalPlanItemUpdatePayload = Partial<
  Omit<DentalPlanItemPayload, "product_uuid">
> & {
  status?: "cancelled";
};

export type DentalPerformPayload = {
  tooth_numbers?: number[];
  surfaces?: ToothSurface[];
  notes?: string;
  materials_used?: string;
};

export type DentalProcedurePayload = DentalPerformPayload & {
  product_uuid: string;
  diagnosis?: string;
  /** ISO date (YYYY-MM-DD); the API defaults to today. */
  treatment_date?: string;
};

export type DentalHistoryEncounter = {
  encounter_uuid: string;
  visit_uuid: string;
  visit_date: string | null;
  status: string;
  started_at: string | null;
  department_name: string;
  clinic_name: string;
  clinician_name: string | null;
  chart_findings: DentalChartFinding[];
  procedures: DentalProcedure[];
};

export type DentalHistorySections = {
  encounter_uuid: string | null;
  visit_uuid: string | null;
  chart_findings: DentalChartFinding[];
  procedures: DentalProcedure[];
};
