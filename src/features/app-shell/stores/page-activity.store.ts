import { create } from "zustand";

type PageActivityState = {
  sources: Record<string, true>;
  setSource: (id: string, active: boolean) => void;
};

export const usePageActivityStore = create<PageActivityState>((set, get) => ({
  sources: {},
  setSource: (id, active) => {
    const current = get().sources;
    if (active) {
      if (current[id]) {
        return;
      }
      set({ sources: { ...current, [id]: true } });
      return;
    }

    if (!current[id]) {
      return;
    }

    const { [id]: _removed, ...rest } = current;
    set({ sources: rest });
  },
}));

export function useHasRegisteredPageActivity() {
  return usePageActivityStore(
    (state) => Object.keys(state.sources).length > 0,
  );
}
