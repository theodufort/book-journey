import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { cookies } from "next/headers";
import { ReactNode } from "react";

export const metadata = getSEOTags({
  title: `Welcome to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
});

export default async function Layout({
  children,
  searchParams,
}: {
  children: ReactNode;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const ref = searchParams.ref as string | undefined;
  
  if (ref) {
    cookies().set("referralCode", ref, { 
      path: "/",
      httpOnly: true,
    });
  }

  return <>{children}</>;
}
