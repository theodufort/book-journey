import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

// The middleware is used to refresh the user's session before loading Server Component routes
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl;
  const locale = url.searchParams.get("locale");
  if (locale) {
    // Set the NEXT_LOCALE cookie with the value from the URL
    res.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  }
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}
