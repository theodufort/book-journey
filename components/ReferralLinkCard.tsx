import { getUser } from "@/libs/supabase/queries";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";

const ReferralLinkCard: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
  }, [supabase]);

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
          You will earn 100 points when a friend signs up!
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
