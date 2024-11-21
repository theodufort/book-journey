import { Lock } from "lucide-react";
import { ReactNode, useState } from "react";
import PricingPopup from "./PricingPopup";

interface PaidFeatureWrapperProps {
  children: ReactNode;
  enabled?: boolean;
}

export default function PaidFeatureWrapper({
  children,
  enabled = false,
}: PaidFeatureWrapperProps) {
  const [openSub, setOpenSub] = useState(false);
  if (enabled) return <>{children}</>;

  return (
    <div className="relative group p-4 rounded-xl">
      <PricingPopup isOpen={openSub} onClose={() => setOpenSub(false)} />
      <button 
        onClick={() => setOpenSub(true)}
        className="w-full"
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10 bg-base-100/30 group-hover:bg-base-100/70 transition-all">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <Lock className="w-6 h-6" />
            <p className="text-sm opacity-75">Upgrade to access this feature</p>
          </div>
        </div>
        <div className="opacity-50 pointer-events-none">{children}</div>
      </button>
    </div>
  );
}
