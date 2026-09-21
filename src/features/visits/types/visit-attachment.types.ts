export type VisitEncounterAttachment = {
  id: number;
  uuid: string;
  encounter: number | string;
  encounter_uuid: string;
  file_name: string;
  file_mime_type: string;
  file_size: number | null;
  uploaded_by: number | null;
  uploaded_by_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VisitEncounterAttachmentListResponse = {
  results: VisitEncounterAttachment[];
};
