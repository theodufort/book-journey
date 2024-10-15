import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const ref = searchParams.get("ref");

  // If there's a ref parameter and we're on the signin page
  if (ref && pathname === "/signin") {
    const response = NextResponse.next();

    // Set the referral code as a cookie
    response.cookies.set("referralCode", ref, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/signin",
};
