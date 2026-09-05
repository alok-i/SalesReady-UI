import { NextResponse } from "next/server";
import { z } from "zod";
import { backendFetch, readBackendSession } from "@/lib/backend-api";
import { setSessionCookies } from "@/lib/session";

const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const parsed = signinSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Enter a valid email and password." } },
      { status: 400 },
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await backendFetch("/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return NextResponse.json(
      { error: { code: "API_UNAVAILABLE", message: "The SalesReady API is unavailable." } },
      { status: 502 },
    );
  }

  const payload: unknown = await backendResponse.json().catch(() => ({
    error: { code: "UPSTREAM_ERROR", message: "The API returned an invalid response." },
  }));

  if (!backendResponse.ok) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  const session = await readBackendSession(
    new Response(JSON.stringify(payload), { status: backendResponse.status }),
  );
  const response = NextResponse.json({
    data: {
      tokenType: session.tokenType,
      expiresIn: session.expiresIn,
      user: session.user,
      organization: session.organization,
      role: session.role,
    },
  });
  setSessionCookies(response, session);
  return response;
}
