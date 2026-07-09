import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";

import { siteConfig } from "@/constants/site";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.className} ${bricolage.variable} min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="light" attribute="class" forcedTheme="light">
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
