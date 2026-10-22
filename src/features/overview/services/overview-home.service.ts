import { bffRequest } from "@/lib/bff-client";
import type {
  OverviewActivityItem,
  OverviewHomePayload,
} from "@/features/overview/utils/overview-start";

export async function fetchOverviewHome() {
  return bffRequest<OverviewHomePayload>("/api/overview/home");
}

export async function saveOverviewPins(areas: string[]) {
  return bffRequest<{ pinned: OverviewHomePayload["pinned"] }>(
    "/api/overview/pins",
    {
      method: "PUT",
      body: { areas },
    },
  );
}

export async function fetchOverviewActivity() {
  return bffRequest<OverviewActivityItem[]>("/api/overview/activity");
}
