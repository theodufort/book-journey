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
  return <>{children}</>;
}

export async function getServerSideProps(context) {
  const { ref } = context.query;
  if (ref) {
    // Set the referral code as a cookie
    context.res.setHeader('Set-Cookie', `referralCode=${ref}; Path=/; HttpOnly`);
  }
  return { props: {} };
}
