import Image from "next/image";
import { useEffect, useState } from "react";

export const CalendlyFooter = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    setIsStandalone(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (isStandalone) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-base-300 text-center py-2 text-xs z-10">
      <div className="flex items-center justify-center">
        <a
          className="mr-2 text-lg"
          href="https://calendly.com/expoweb/15-minutes-onboarding"
          target="_blank"
        >
          We are in beta! Click to book a 15 minute meeting with our founder!
        </a>
      </div>
    </footer>
  );
};
