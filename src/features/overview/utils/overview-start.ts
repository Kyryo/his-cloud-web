import type { AppIconName } from "@/components/icons/app-icon";
import {
  workspaceAreaDetails,
  type OverviewQuickLink,
} from "@/features/overview/utils/overview-quick-links";

export const OVERVIEW_QUICK_ACCESS_LIMIT = 4;

export type OverviewQuickAccessCard = {
  area_key: string;
  label: string;
  is_primary: boolean;
};

export type OverviewHomePin = {
  area_key: string;
  is_default: boolean;
};

export type OverviewHomePayload = {
  quick_access: OverviewQuickAccessCard[];
  pinned: OverviewHomePin[];
  generated_at?: string;
};

export type OverviewActivityItem = {
  id: number;
  uuid: string;
  action: string;
  description: string;
  patient_name: string | null;
  patient_href: string | null;
  related_label: string | null;
  related_href: string | null;
  href: string | null;
  occurred_at: string;
  icon_key: string;
  related_object_type: string | null;
  related_object_id: string | null;
};

export type OverviewActionCard = OverviewQuickLink & {
  isPrimary: boolean;
};

export function resolveQuickAccessCards(
  cards: OverviewQuickAccessCard[] | undefined,
  userGroups: string[],
  enabledModules: string[],
): OverviewActionCard[] {
  if (!cards?.length) {
    return [];
  }
  return cards.map((card) => {
    const details = workspaceAreaDetails(
      card.area_key,
      userGroups,
      enabledModules,
    );
    return {
      ...details,
      pageName: card.label || details.pageName,
      isPrimary: Boolean(card.is_primary),
    };
  });
}

export function activityIconName(iconKey: string): AppIconName {
  const map: Record<string, AppIconName> = {
    user: "user",
    calendar: "calendar",
    file: "file",
    shield: "shield",
    clipboard: "clipboard",
    pill: "pill",
    activity: "activity",
  };
  return map[iconKey] ?? "activity";
}
