import type {
  ClinicalWorkspaceRouting,
  ClinicalWorkspaceTab,
} from "@/features/clinical-workspace/types/clinical-workspace.types";

type TabConfig<TabId extends string> = Pick<
  ClinicalWorkspaceRouting<TabId>,
  "specialty" | "tabs" | "preferredTabsByRole" | "fallbackTabId"
>;

export function workspaceEncounterBasePath(
  config: Pick<ClinicalWorkspaceRouting, "specialty">,
  visitUuid: string,
  encounterUuid: string,
): string {
  return `${config.specialty.basePath}/${visitUuid}/${encounterUuid}`;
}

export function workspaceTabHref<TabId extends string>(
  config: TabConfig<TabId>,
  visitUuid: string,
  encounterUuid: string,
  tabId: TabId,
): string {
  const base = workspaceEncounterBasePath(config, visitUuid, encounterUuid);
  const tab = config.tabs.find((item) => item.id === tabId);
  return tab ? `${base}/${tab.segment}` : base;
}

/**
 * Returns `null` for the bare encounter URL, which redirects to the role's
 * default tab rather than rendering a section of its own.
 */
export function workspaceTabFromPathname<TabId extends string>(
  config: TabConfig<TabId>,
  pathname: string,
  visitUuid: string,
  encounterUuid: string,
): TabId | null {
  const prefix = workspaceEncounterBasePath(config, visitUuid, encounterUuid);
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return null;
  }
  const segment = pathname.slice(prefix.length).replace(/^\//, "").split("/")[0];
  if (!segment) {
    return null;
  }
  return config.tabs.find((tab) => tab.segment === segment)?.id ?? null;
}

function tabIsVisible(tab: ClinicalWorkspaceTab, capabilities: readonly string[]) {
  if (tab.requiredCapability === null) {
    return true;
  }
  if (Array.isArray(tab.requiredCapability)) {
    return tab.requiredCapability.some((capability) =>
      capabilities.includes(capability),
    );
  }
  return capabilities.includes(tab.requiredCapability);
}

/** Every section the user may open, including header-menu ones. */
export function getVisibleWorkspaceSections<TabId extends string>(
  config: Pick<ClinicalWorkspaceRouting<TabId>, "tabs">,
  capabilities: readonly string[],
): ClinicalWorkspaceTab<TabId>[] {
  return config.tabs.filter((tab) => tabIsVisible(tab, capabilities));
}

/** Sections rendered in the tab bar. */
export function getVisibleWorkspaceTabs<TabId extends string>(
  config: Pick<ClinicalWorkspaceRouting<TabId>, "tabs">,
  capabilities: readonly string[],
): ClinicalWorkspaceTab<TabId>[] {
  return getVisibleWorkspaceSections(config, capabilities).filter(
    (tab) => tab.surface === "tab",
  );
}

/** Sections rendered in the header overflow menu. */
export function getVisibleWorkspaceMenuSections<TabId extends string>(
  config: Pick<ClinicalWorkspaceRouting<TabId>, "tabs">,
  capabilities: readonly string[],
): ClinicalWorkspaceTab<TabId>[] {
  return getVisibleWorkspaceSections(config, capabilities).filter(
    (tab) => tab.surface === "menu",
  );
}

export function getDefaultWorkspaceTab<TabId extends string>(
  config: TabConfig<TabId>,
  capabilities: readonly string[],
  userRole?: string | null,
): TabId {
  const visibleSections = getVisibleWorkspaceSections(config, capabilities);
  if (visibleSections.length === 0) {
    return config.fallbackTabId;
  }

  const preferredTabs = userRole ? config.preferredTabsByRole[userRole] : undefined;
  for (const preferredTab of preferredTabs ?? []) {
    if (visibleSections.some((section) => section.id === preferredTab)) {
      return preferredTab;
    }
  }

  const visibleTabs = getVisibleWorkspaceTabs(config, capabilities);
  return visibleTabs[0]?.id ?? visibleSections[0].id;
}

export function workspaceLandingHref<TabId extends string>(
  config: TabConfig<TabId>,
  visitUuid: string,
  encounterUuid: string,
  capabilities: readonly string[],
  userRole?: string | null,
): string {
  return workspaceTabHref(
    config,
    visitUuid,
    encounterUuid,
    getDefaultWorkspaceTab(config, capabilities, userRole),
  );
}
