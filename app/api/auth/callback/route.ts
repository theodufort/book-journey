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
    // Update the user's record with the referral information
    const { error } = await supabase
      .from('users')
      .update({ referred_by: referralCode })
      .eq('id', userId);

    if (error) {
      console.error('Error updating referral:', error);
    }

    // You might want to add more logic here, such as:
    // - Incrementing a referral count for the referrer
    // - Granting rewards to both the referrer and the new user
    // - Logging the referral in a separate table
  }
}
