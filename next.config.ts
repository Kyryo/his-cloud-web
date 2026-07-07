import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

// assetPrefix routes static chunks through the deploy gateway (/__hmis_web_new).
// In local `next dev` on :3000 it breaks chunk loading unless you opt in via
// NEXT_PUBLIC_USE_GATEWAY_ASSET_PREFIX=true (e.g. when using gateway.dev.conf on :8080).
const useGatewayAssetPrefix =
  process.env.NEXT_PUBLIC_USE_GATEWAY_ASSET_PREFIX === "true";
const assetPrefix =
  process.env.NODE_ENV === "development" && !useGatewayAssetPrefix
    ? undefined
    : process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined;

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix,
  turbopack: {
    root: appRoot,
  },
  devIndicators: false,
};

export default nextConfig;
