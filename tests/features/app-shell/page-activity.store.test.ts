import { beforeEach, describe, expect, it } from "vitest";

import { usePageActivityStore } from "@/features/app-shell/stores/page-activity.store";

beforeEach(() => {
  usePageActivityStore.setState({ sources: {} });
});

describe("page activity store", () => {
  it("tracks named activity sources", () => {
    const { setSource } = usePageActivityStore.getState();

    setSource("list", true);
    setSource("list", true);
    expect(Object.keys(usePageActivityStore.getState().sources)).toEqual(["list"]);

    setSource("calendar", true);
    setSource("list", false);
    expect(Object.keys(usePageActivityStore.getState().sources)).toEqual([
      "calendar",
    ]);

    setSource("calendar", false);
    expect(usePageActivityStore.getState().sources).toEqual({});
  });
});
