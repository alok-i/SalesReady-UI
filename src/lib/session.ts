import "server-only";

import type { NextResponse } from "next/server";
import type { Session } from "./api-contracts";
import {
  ACCESS_COOKIE,
  PLATFORM_ADMIN_COOKIE,
  REFRESH_COOKIE,
  ROLE_COOKIE,
} from "./auth-cookies";

export { ACCESS_COOKIE, PLATFORM_ADMIN_COOKIE, REFRESH_COOKIE, ROLE_COOKIE };

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setSessionCookies(response: NextResponse, session: Session) {
  const isPlatformAdmin = Boolean(session.isPlatformAdmin ?? session.user.isPlatformAdmin);
  response.cookies.set(ACCESS_COOKIE, session.accessToken, {
    ...baseCookie,
    maxAge: session.expiresIn,
  });
  response.cookies.set(REFRESH_COOKIE, session.refreshToken, {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(ROLE_COOKIE, session.role, {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(PLATFORM_ADMIN_COOKIE, isPlatformAdmin ? "1" : "0", {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, PLATFORM_ADMIN_COOKIE]) {
    response.cookies.set(name, "", { ...baseCookie, maxAge: 0 });
  }
}
