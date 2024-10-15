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
    // The cookie is set by the page component, we can use it here if needed
    console.log("Referral code from cookie:", ref);
    // You can add any server-side logic here that needs to use the referral code
  }

  return <>{children}</>;
}
