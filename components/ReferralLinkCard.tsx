import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const ReferralLinkCard: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, [supabase.auth]);

  const referralLink = userId
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/signin?ref=${userId}`
    : '';

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
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Your Referral Link</h2>
        <p className="text-sm mb-2">Share this link to invite others:</p>
        <div className="flex items-center">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="input input-bordered flex-grow mr-2"
          />
          <button
            onClick={copyToClipboard}
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralLinkCard;
