"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Crisp } from "crisp-sdk-web";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import config from "@/config";
import { Database } from "@/types/supabase";

// All the client wrappers are here (they can't be in server components)
// 1. NextTopLoader: Show a progress bar at the top when navigating between pages
// 2. Toaster: Show Success/Error messages anywhere from the app with toast()
// 3. Tooltip: Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content=""
// 4. CrispChat: Set Crisp customer chat support (see above)
const ClientLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {/* Show a progress bar at the top when navigating between pages */}
      <NextTopLoader color={config.colors.main} showSpinner={false} />

      {/* Content inside app/page.js files  */}
      {children}

      {/* Show Success/Error messages anywhere from the app with toast() */}
      <Toaster
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content="" */}
      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />
    </>
  );
};

export default ClientLayout;
