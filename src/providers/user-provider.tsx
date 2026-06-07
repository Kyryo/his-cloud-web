"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { getCurrentUser } from "@/features/auth/services/auth.service";
import type { User } from "@/features/auth/types/auth.types";

type UserContextValue = {
  userData: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const user = await getCurrentUser();
    setUserData(user);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (active) {
        setUserData(user);
        setIsLoading(false);
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <UserContext.Provider value={{ userData, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
