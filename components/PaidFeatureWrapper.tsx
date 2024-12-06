import { Lock } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import PricingPopup from "./PricingPopup";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

interface PaidFeatureWrapperProps {
  children: ReactNode;
  userId: string;
}

export default function PaidFeatureWrapper({
  children,
  userId,
}: PaidFeatureWrapperProps) {
  const [featureAccess, setFeatureAccess] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const [openSub, setOpenSub] = useState(false);
  useEffect(() => {
    fetchPaidFeatureEnabled();
  }, [userId, supabase]);

  const fetchPaidFeatureEnabled = async () => {
    const {
      data: { has_access },
      error,
    } = await supabase
      .from("profiles")
      .select("has_access")
      .eq("id", userId)
      .single();

    setFeatureAccess(has_access);
  };
  if (!featureAccess) return <>{children}</>;

  return (
    <div className="relative group rounded-xl">
      <PricingPopup isOpen={openSub} onClose={() => setOpenSub(false)} />
      <button onClick={() => setOpenSub(true)} className="w-full">
        <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10 bg-base-100/30 group-hover:bg-base-100/70 transition-all">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <Lock className="w-6 h-6" />
            <p className="text-sm opacity-75 hidden md:block">
              Upgrade to access this feature
            </p>
          </div>
        </div>
        <div className="opacity-50 pointer-events-none">{children}</div>
      </button>
    </div>
  );
}
