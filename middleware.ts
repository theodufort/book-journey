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
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const ref = searchParams.get('ref');

  // If there's a ref parameter and we're on the signin page
  if (ref && pathname === '/signin') {
    const response = NextResponse.next();

    // Set the referral code as a cookie
    response.cookies.set('referralCode', ref, { 
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/signin',
};
