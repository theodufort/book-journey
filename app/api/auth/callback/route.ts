import config from "@/config";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const addToConvertKit = async (email: string, first_name: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/convertkit/subscribe`,
      {
        email_address: email,
        first_name: first_name || email.split("@")[0],
      }
    );
    if (response.status === 200) {
      console.log("User added to ConvertKit");
    }
  } catch (error) {
    console.error("Error adding user to ConvertKit:", error);
  }
};
// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const ref = requestUrl.searchParams.get("ref");
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      await addToConvertKit(user.email, user.user_metadata.first_name);

      if (ref) {
        // Handle the referral
        await handleReferral(user.id, ref);
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
      .from("referrals")
      .insert({ referrer_id: referralCode, referred_id: userId });

    if (referralError) {
      console.error("Error inserting referral:", referralError);
    } else {
      console.log("Referral successfully recorded");

      // Add 100 points to the new user's account
      const { error: pointsError } = await supabase.rpc("increment", {
        inc: 100,
        userid: userId,
      });

      if (pointsError) {
        console.error("Error adding points to new user:", pointsError);
      } else {
        console.log("100 points added to new user");
      }

      // Add 100 points to the referrer's account
      const { error: referrerPointsError } = await supabase.rpc("increment", {
        inc: 100,
        userid: referralCode,
      });
      if (referrerPointsError) {
        console.error("Error adding points to referrer:", referrerPointsError);
      } else {
        console.log("100 points added to referrer");
      }
    }
  }
}
