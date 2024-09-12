import { ReactNode } from "react";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Welcome to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
