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
    icon: "/favicon.ico",
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
