import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";

const ReferralLinkCard: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, [supabase.auth]);

  const referralLink = userId
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/signin?ref=${userId}`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!userId) {
    return null; // Or a loading state
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <h2 className="card-title">Invite a Friend:</h2>
        <p className="text-sm mb-2">
          You and your friend will earn 100 points each!
        </p>
        <div className="flex items-center justify-center">
          <button
            onClick={copyToClipboard}
            className={`btn ${copied ? "btn-success" : "btn-primary"}`}
          >
            {copied ? "Copied!" : "Copy Referral Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralLinkCard;
