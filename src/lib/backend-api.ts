import "server-only";

import { sessionSchema, type Session } from "./api-contracts";

export const BACKEND_API_URL =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3005/v1";

type BackendEnvelope<T> = {
  data: T;
  meta: { requestId: string };
};

export async function backendFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
}

export async function readBackendSession(response: Response): Promise<Session> {
  const payload: unknown = await response.clone().json();
  const envelope = payload as BackendEnvelope<unknown>;
  return sessionSchema.parse(envelope.data);
}
