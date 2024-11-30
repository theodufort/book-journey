import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ReactNode } from "react";
import "./globals.css";
import Fathom from "@/components/Fathom";

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

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      {config.domainName && (
        <head>
          <Fathom />
          <GoogleAnalytics gaId="G-1LDR3284GW" />
          <GoogleTagManager gtmId="AW-10934490832" />
          <meta name="impact-site-verification" data-value="369738092" />{" "}
          <Script
            strategy="lazyOnload"
            src="https://embed.tawk.to/6701c7a037379df10df23fe2/1i9ff7ip6"
          />
          <PlausibleProvider domain={config.domainName} />
        </head>
      )}
      <body className={font.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          <NextIntlClientProvider messages={messages}>
            <ClientLayout>{children}</ClientLayout>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
