import { Lock } from "lucide-react";
import { ReactNode } from "react";

interface PaidFeatureWrapperProps {
  children: ReactNode;
  feature: string;
  enabled?: boolean;
}

export default function PaidFeatureWrapper({
  children,
  feature,
  enabled = false,
}: PaidFeatureWrapperProps) {
  if (enabled) return <>{children}</>;

  return (
    <div className="relative group cursor-not-allowed p-4 rounded-xl">
      <div className="absolute inset-0 bg-base-100/80 flex items-center justify-center z-10 group-hover:bg-base-100/90 transition-all">
        <div className="flex flex-col items-center gap-2 text-center p-4">
          <Lock className="w-6 h-6" />
          <p className="font-semibold">{feature}</p>
          <p className="text-sm opacity-75">Upgrade to access this feature</p>
        </div>
      </div>
      <div className="opacity-50 pointer-events-none">{children}</div>
    </div>
  );
}
