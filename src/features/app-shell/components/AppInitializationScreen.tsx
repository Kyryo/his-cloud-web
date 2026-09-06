import Image from "next/image";

import { BRAND_LOGO_SRC } from "@/constants/brand";
import { siteConfig } from "@/constants/site";

export function AppInitializationScreen() {
  return (
    <div
      className="flex min-h-svh w-full items-center justify-center bg-white"
      data-testid="app-initialization-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading</span>
      <Image
        src={BRAND_LOGO_SRC}
        alt={siteConfig.name}
        width={96}
        height={96}
        className="app-init-logo h-20 w-20 object-contain"
        priority
      />
    </div>
  );
}
