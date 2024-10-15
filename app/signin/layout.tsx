import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { cookies } from "next/headers";
import { ReactNode } from "react";

export const metadata = getSEOTags({
  title: `Welcome to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
});

export default async function Layout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const ref = cookieStore.get("referralCode")?.value;

  if (ref) {
    // The cookie is already set by the page component, so we don't need to set it again
    console.log("Referral code from cookie:", ref);
  }

  return <>{children}</>;
}
