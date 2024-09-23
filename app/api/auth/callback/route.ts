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
    await supabase.auth.exchangeCodeForSession(code);
  } else {
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const { data, error } = await resend.emails.send({
    //   from: "welcome@mybookquest.com",
    //   to: userLoggedIn == null ? "theodufort05@gmail.com" : userLoggedIn.email,
    //   subject: "Welcome to MyBookQuest!",
    //   react: WelcomeEmail(),
    // });
    // if (error) {
    //   return Response.json({ error });
    // }
  }
  console.log(process.env.NEXT_PUBLIC_BASE_URL);
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    "https://mybookquest.com" + config.auth.callbackUrl
  );
  // return NextResponse.redirect(
  //   "https://localhost:3000" + config.auth.callbackUrl
  // );
}
