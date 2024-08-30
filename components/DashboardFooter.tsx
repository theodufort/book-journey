import Image from "next/image";
import { useEffect, useState } from "react";

export const DashboardFooter = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    setIsStandalone(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (isStandalone) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-base-300 text-center py-2 text-xs z-10">
      <div className="flex items-center justify-center">
        <p className="mr-2 text-sm">
          Download the app from any browser by clicking the icon in the address
          bar:
        </p>
        <Image src={"/pwa.png"} width={30} height={30} alt="PWA icon" />
      </div>
    </footer>
  );
};
