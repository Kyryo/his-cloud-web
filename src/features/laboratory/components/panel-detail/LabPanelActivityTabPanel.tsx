"use client";

import { useEffect, useState } from "react";
import { FlaskConical, History, Pencil, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ActivityFeed,
  type ActivityFeedItem,
} from "@/components/feed/activity-feed";
import type { ActivityIconTone } from "@/components/detail/detail-activity-timeline-utils";
import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { ListPageBlankState } from "@/features/app-shell/components/page-layout";
import { useLabPanelDetailWorkspace } from "@/features/laboratory/components/panel-detail/lab-panel-detail-workspace-context";
import { fetchLabPanelActivity } from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabPanelActivityItem } from "@/features/laboratory/types/laboratory-catalog.types";

const ACTION_ICONS: Record<string, LucideIcon> = {
  "laboratory.panel.created": Plus,
  "laboratory.panel.updated": Pencil,
  "laboratory.panel.deactivated": History,
};

const ACTION_TONES: Record<string, ActivityIconTone> = {
  "laboratory.panel.created": "success",
  "laboratory.panel.updated": "info",
  "laboratory.panel.deactivated": "danger",
};

const ACTION_TITLES: Record<string, string> = {
  "laboratory.panel.created": "Panel created",
  "laboratory.panel.updated": "Panel updated",
  "laboratory.panel.deactivated": "Panel deactivated",
};

function mapActivityToFeedItem(item: LabPanelActivityItem): ActivityFeedItem {
  return {
    id: item.uuid,
    title: ACTION_TITLES[item.action] ?? item.action,
    summary: item.message || "",
    occurredAt: item.occurred_at || item.created_at,
    icon: ACTION_ICONS[item.action] ?? FlaskConical,
    tone: ACTION_TONES[item.action] ?? "neutral",
    groupKey: item.action,
    createdByName: item.actor_name || undefined,
    createdByEmail: item.actor_email || undefined,
  };
}

export function LabPanelActivityTabPanel() {
  const { panel, refreshKey } = useLabPanelDetailWorkspace();
  const [items, setItems] = useState<LabPanelActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      try {
        setIsLoading(true);
        const response = await fetchLabPanelActivity(panel.uuid);
        if (cancelled) {
          return;
        }
        setItems(response.results ?? []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load activity.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [panel.uuid, refreshKey]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading activity..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error) {
    return (
      <ListPageBlankState
        title="Unable to load activity"
        description={error}
        data-testid="lab-panel-activity-error"
      />
    );
  }

  return (
    <ActivityFeed
      title="Activity"
      description="Create, update, and deactivate events for this laboratory panel."
      items={items.map(mapActivityToFeedItem)}
      emptyTitle="No activity yet"
      emptyDescription="Changes to this panel will appear here as they happen."
      compact={false}
      data-testid="lab-panel-activity-tab"
    />
  );
}
