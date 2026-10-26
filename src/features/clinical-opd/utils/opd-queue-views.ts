export const OPD_QUEUE_VIEW_MODES = ["table", "list", "board"] as const;
export type OpdQueueViewMode = (typeof OPD_QUEUE_VIEW_MODES)[number];

export const DEFAULT_OPD_QUEUE_VIEW_MODE: OpdQueueViewMode = "table";

const VIEW_STORAGE_PREFIX = "hmis.clinical-queue-view:v1";
const viewListeners = new Set<() => void>();
const memoryViews = new Map<string, OpdQueueViewMode>();

function browserStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function clinicalQueueViewStorageKey(specialtyCode: string) {
  return `${VIEW_STORAGE_PREFIX}:${specialtyCode}`;
}

export function parseOpdQueueViewMode(
  value: string | null | undefined,
): OpdQueueViewMode {
  if (value === "list" || value === "board" || value === "table") {
    return value;
  }
  return DEFAULT_OPD_QUEUE_VIEW_MODE;
}

export function readClinicalQueueViewMode(specialtyCode: string): OpdQueueViewMode {
  const remembered = memoryViews.get(specialtyCode);
  if (remembered) {
    return remembered;
  }

  const storage = browserStorage();
  if (!storage) {
    return DEFAULT_OPD_QUEUE_VIEW_MODE;
  }

  try {
    return parseOpdQueueViewMode(
      storage.getItem(clinicalQueueViewStorageKey(specialtyCode)),
    );
  } catch {
    return DEFAULT_OPD_QUEUE_VIEW_MODE;
  }
}

export function writeClinicalQueueViewMode(
  specialtyCode: string,
  mode: OpdQueueViewMode,
) {
  memoryViews.set(specialtyCode, mode);

  const storage = browserStorage();
  if (storage) {
    try {
      storage.setItem(clinicalQueueViewStorageKey(specialtyCode), mode);
    } catch {
      // Ignore quota and private-mode failures. The in-memory view still applies.
    }
  }

  for (const listener of viewListeners) {
    listener();
  }
}

/** Drops the in-memory view so tests do not leak across cases. */
export function resetClinicalQueueViewMemory() {
  memoryViews.clear();
}

export function subscribeClinicalQueueView(onStoreChange: () => void) {
  viewListeners.add(onStoreChange);
  return () => {
    viewListeners.delete(onStoreChange);
  };
}