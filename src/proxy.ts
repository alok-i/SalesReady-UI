import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_ADMIN_COOKIE, REFRESH_COOKIE, ROLE_COOKIE } from "@/lib/auth-cookies";

function homeForSession(role?: string, isPlatformAdmin?: boolean) {
  if (isPlatformAdmin) return "/platform";
  return role === "REP" ? "/rep" : "/manager";
}

export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  const isPlatformAdmin = request.cookies.get(PLATFORM_ADMIN_COOKIE)?.value === "1";
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  const isPlatform = pathname === "/platform" || pathname.startsWith("/platform/");

  if (!refreshToken) {
    if (isLogin) return NextResponse.next();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin) {
    if (role || isPlatformAdmin) {
      return NextResponse.redirect(new URL(homeForSession(role, isPlatformAdmin), request.url));
    }
    return NextResponse.next();
  }

  if (isPlatform && !isPlatformAdmin) {
    return NextResponse.redirect(new URL(homeForSession(role, false), request.url));
  }

  if (isPlatformAdmin && (pathname.startsWith("/manager") || pathname.startsWith("/rep"))) {
    return NextResponse.redirect(new URL("/platform", request.url));
  }

  if (role === "REP" && pathname.startsWith("/manager")) {
    return NextResponse.redirect(new URL("/rep", request.url));
  }

  if (role && role !== "REP" && pathname.startsWith("/rep")) {
    return NextResponse.redirect(new URL("/manager", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/platform",
    "/platform/:path*",
    "/manager",
    "/manager/:path*",
    "/rep",
    "/rep/:path*",
  ],
};
