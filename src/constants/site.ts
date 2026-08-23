import { getAppHost, getMarketingHost, hostOrigin } from "@/constants/hosts";

const marketingHost = getMarketingHost();
const appHost = getAppHost();

export const siteConfig = {
  name: "Sigma Health HMIS",
  url: marketingHost ? hostOrigin(marketingHost) : "https://hmis.sigmaconnect.org",
  appUrl: appHost ? hostOrigin(appHost) : "https://app.sigmahmis.com",
  description: "Your complete hospitalwide health information system.",
} as const;
