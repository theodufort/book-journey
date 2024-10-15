import config from "@/config";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      // Check for referral code in cookies
      const referralCode = cookies().get('referralCode')?.value;

      if (referralCode) {
        // Handle the referral
        await handleReferral(user.id, referralCode);
        
        // Clear the referral code cookie
        cookies().delete('referralCode');
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    process.env.NEXT_PUBLIC_BASE_URL + config.auth.callbackUrl
  );
}

async function handleReferral(userId: string, referralCode: string) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check if the referral is valid and not self-referral
  if (userId !== referralCode) {
    // Insert the referral information into the referrals table
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({ referrer_id: referralCode, referred_id: userId });

    if (referralError) {
      console.error('Error inserting referral:', referralError);
    } else {
      console.log('Referral successfully recorded');

      // Add 100 points to the new user's account
      const { error: pointsError } = await supabase
        .from('user_points')
        .upsert(
          { 
            user_id: userId, 
            points_earned: 100,
            points_redeemed: 0,
            points_earned_referrals: 0
          },
          { onConflict: 'user_id' }
        );

      if (pointsError) {
        console.error('Error adding points to new user:', pointsError);
      } else {
        console.log('100 points added to new user');
      }

      // Add 100 points to the referrer's account
      const { error: referrerPointsError } = await supabase
        .from('user_points')
        .update({ 
          points_earned: supabase.rpc('increment', { inc: 100 }),
          points_earned_referrals: supabase.rpc('increment', { inc: 100 })
        })
        .eq('user_id', referralCode);

      if (referrerPointsError) {
        console.error('Error adding points to referrer:', referrerPointsError);
      } else {
        console.log('100 points added to referrer');
      }
    }
  }
}
