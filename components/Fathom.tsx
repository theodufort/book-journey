"use client";
import { load, trackPageview } from "fathom-client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TrackPageView(): any {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    load("JUPRDRDT", {
      includedDomains: ["www.mybookquest.com", "mybookquest.com"],
      auto: false,
    });
  }, []);

  // Record a pageview when route changes
  useEffect(() => {
    trackPageview();
  }, [pathname, searchParams]);
  return null;
}
export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
