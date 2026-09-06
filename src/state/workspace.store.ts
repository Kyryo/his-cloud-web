import { create } from "zustand";

import type { User } from "@/features/auth/types/auth.types";
import { writeActiveClinicId } from "@/features/app-shell/utils/active-clinic";
import {
  getActiveClinics,
  resolveInitialClinicId,
} from "@/features/app-shell/utils/workspace-clinics";

type WorkspaceState = {
  activeClinicId: number | null;
  openNavSections: Record<string, boolean>;
  setActiveClinicId: (clinicId: number) => void;
  setNavSectionOpen: (title: string, open: boolean) => void;
  hydrateFromUser: (user: User) => void;
  reset: () => void;
};

const INITIAL_WORKSPACE_STATE = {
  activeClinicId: null as number | null,
  openNavSections: {} as Record<string, boolean>,
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  ...INITIAL_WORKSPACE_STATE,
  setActiveClinicId: (clinicId) => {
    writeActiveClinicId(clinicId);
    set({ activeClinicId: clinicId });
  },
  setNavSectionOpen: (title, open) => {
    set((state) => ({
      openNavSections: {
        ...state.openNavSections,
        [title]: open,
      },
    }));
  },
  hydrateFromUser: (user) => {
    const clinics = getActiveClinics(user);
    const current = get().activeClinicId;
    if (current && clinics.some((clinic) => clinic.clinic === current)) {
      return;
    }

    set({ activeClinicId: resolveInitialClinicId(user) });
  },
  reset: () => {
    set({ ...INITIAL_WORKSPACE_STATE, openNavSections: {} });
  },
}));
