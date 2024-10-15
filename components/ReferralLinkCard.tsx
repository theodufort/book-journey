import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

const ReferralLinkCard: React.FC = () => {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/signin?ref=${session?.user?.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
