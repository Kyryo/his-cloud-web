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
import { useLabTestDetailWorkspace } from "@/features/laboratory/components/test-detail/lab-test-detail-workspace-context";
import { fetchLabTestActivity } from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabTestActivityItem } from "@/features/laboratory/types/laboratory-catalog.types";

const ACTION_ICONS: Record<string, LucideIcon> = {
  "laboratory.test.created": Plus,
  "laboratory.test.updated": Pencil,
  "laboratory.test.deactivated": History,
};

const ACTION_TONES: Record<string, ActivityIconTone> = {
  "laboratory.test.created": "success",
  "laboratory.test.updated": "info",
  "laboratory.test.deactivated": "danger",
};

const ACTION_TITLES: Record<string, string> = {
  "laboratory.test.created": "Test created",
  "laboratory.test.updated": "Test updated",
  "laboratory.test.deactivated": "Test deactivated",
};

function mapActivityToFeedItem(item: LabTestActivityItem): ActivityFeedItem {
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

export function LabTestActivityTabPanel() {
  const { test, refreshKey } = useLabTestDetailWorkspace();
  const [items, setItems] = useState<LabTestActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      try {
        setIsLoading(true);
        const response = await fetchLabTestActivity(test.uuid);
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
  }, [test.uuid, refreshKey]);

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
        data-testid="lab-test-activity-error"
      />
    );
  }

  return (
    <ActivityFeed
      title="Activity"
      description="Create, update, and deactivate events for this laboratory test."
      items={items.map(mapActivityToFeedItem)}
      emptyTitle="No activity yet"
      emptyDescription="Changes to this test will appear here as they happen."
      compact={false}
      data-testid="lab-test-activity-tab"
    />
  );
}
