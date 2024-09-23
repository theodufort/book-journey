import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Viewport } from "next";

import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });
export const viewport: Viewport = {
  // Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {config.domainName && (
        <head>
          {" "}
          <GoogleAnalytics gaId="G-1LDR3284GW" />
          <meta name="impact-site-verification" data-value="369738092" />
          <PlausibleProvider domain={config.domainName} />
        </head>
      )}
      <body className={font.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          {/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
