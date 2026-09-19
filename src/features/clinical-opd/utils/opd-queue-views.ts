export const OPD_QUEUE_VIEW_MODES = ["table", "list"] as const;
export type OpdQueueViewMode = (typeof OPD_QUEUE_VIEW_MODES)[number];