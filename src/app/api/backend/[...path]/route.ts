import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { backendFetch, readBackendSession } from "@/lib/backend-api";
import {
  ACCESS_COOKIE,
  clearSessionCookies,
  REFRESH_COOKIE,
  setSessionCookies,
} from "@/lib/session";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

async function forward(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return jsonError(401, "UNAUTHENTICATED", "Sign in to continue.");
  }

  const query = request.nextUrl.search;
  const backendPath = `/${path.map(encodeURIComponent).join("/")}${query}`;
  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();
  const contentType = request.headers.get("content-type");

  const callBackend = (token: string) =>
    backendFetch(backendPath, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body: body?.byteLength ? body : undefined,
    });

  try {
    let backendResponse = accessToken
      ? await callBackend(accessToken)
      : new Response(null, { status: 401 });
    let refreshedSession;

    if (backendResponse.status === 401 && refreshToken) {
      const refreshResponse = await backendFetch("/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        refreshedSession = await readBackendSession(refreshResponse);
        backendResponse = await callBackend(refreshedSession.accessToken);
      } else {
        backendResponse = refreshResponse;
      }
    }

    const response = new NextResponse(await backendResponse.text(), {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
      },
    });
    const requestId = backendResponse.headers.get("x-request-id");
    if (requestId) response.headers.set("x-request-id", requestId);

    if (refreshedSession) {
      setSessionCookies(response, refreshedSession);
    } else if (backendResponse.status === 401) {
      clearSessionCookies(response);
    }
    return response;
  } catch {
    return jsonError(502, "API_UNAVAILABLE", "The SalesReady API is unavailable.");
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
