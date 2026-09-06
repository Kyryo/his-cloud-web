import Image from "next/image";

import { LoadingSpinner } from "@/components/loading-spinner";
import { BRAND_LOGO_SRC } from "@/constants/brand";
import { siteConfig } from "@/constants/site";

export function AppInitializationScreen() {
  return (
    <div
      className="flex min-h-svh w-full flex-col items-center justify-center bg-dash-canvas px-6"
      data-testid="app-initialization-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <Image
          src={BRAND_LOGO_SRC}
          alt={siteConfig.name}
          width={140}
          height={42}
          className="h-9 w-auto"
          priority
        />
        <LoadingSpinner
          className="mt-8"
          layout="vertical"
          message="Preparing your workspace"
        />
      </div>
    </div>
  );
}
