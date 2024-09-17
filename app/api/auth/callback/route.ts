import { NextResponse, NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import config from "@/config";
import { Resend } from "resend";
import { WelcomeEmail } from "@/components/WelcomeTemplate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = createRouteHandlerClient({ cookies });

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Retrieve the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if this is a new sign-up
      if (user.aud === "authenticated") {
        // New user sign-up detected, send a welcome email
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
          from: "welcome@mybookquest.com",
          to: user.email,
          subject: "Welcome to MyBookQuest!",
          react: WelcomeEmail(),
        });

        if (error) {
          return NextResponse.json({ error });
        }
      }
    }
  }

  // Redirect to the callback URL after the sign-in/sign-up process
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
