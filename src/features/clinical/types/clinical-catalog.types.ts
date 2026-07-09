export type ClinicalClinic = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  status: string;
  is_active: boolean;
};

export type ClinicalDepartment = {
  id: number;
  uuid: string;
  clinic: number;
  clinic_name: string;
  name: string;
  code: string;
  department_type: string;
  status: string;
  is_active: boolean;
  walk_in_allowed: boolean;
  requires_appointment: boolean;
  default_appointment_duration_minutes?: number | null;
};

export type ClinicalLocation = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  clinic: number;
  clinic_name: string;
  status: string;
  is_active: boolean;
};

export type ConsultationServiceCatalogItem = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  description?: string;
  is_chargable: boolean;
  is_active: boolean;
};
