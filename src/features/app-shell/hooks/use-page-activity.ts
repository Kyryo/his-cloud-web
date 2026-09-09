"use client";

import { useEffect, useId } from "react";

import { usePageActivityStore } from "@/features/app-shell/stores/page-activity.store";

/** Registers a named activity source so the top page loader can appear. */
export function usePageActivity(active: boolean) {
  const id = useId();

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      usePageActivityStore.getState().setSource(id, active);
    }

    void sync();

    return () => {
      cancelled = true;
      usePageActivityStore.getState().setSource(id, false);
    };
  }, [active, id]);
}
