"use server";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { cookies } from "next/headers";
import { ReactNode } from "react";
export const metadata = getSEOTags({
  title: `Welcome to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
});

export default function Layout({ children }: { children: ReactNode }) {
  const ref = searchParams.get("ref");
  console.log(ref);
  if (ref) {
    // Store the ref code in localStorage
    cookies().set("referralCode", ref);
  }
  return <>{children}</>;
}
