import { z } from "zod";

const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().optional(),
    message: z.string().optional(),
    details: z.unknown().optional(),
  }).optional(),
});

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = "API_ERROR",
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const dataEnvelopeSchema = <T>(schema: z.ZodType<T>) =>
  z.object({ data: schema });

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  schema: z.ZodType<T> = z.unknown() as z.ZodType<T>,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload = apiErrorSchema.safeParse(await response.json().catch(() => ({})));
    throw new ApiError(
      payload.data?.error?.message ?? "Something went wrong. Please try again.",
      response.status,
      payload.data?.error?.code,
      payload.data?.error?.details,
    );
  }

  const payload: unknown = await response.json();
  return dataEnvelopeSchema(schema).parse(payload).data;
}

export const api = {
  get: <T>(path: string, schema: z.ZodType<T>) =>
    apiRequest(`/api/backend${path}`, undefined, schema),
  post: <T>(path: string, body: unknown, schema: z.ZodType<T>) =>
    apiRequest(`/api/backend${path}`, { method: "POST", body: JSON.stringify(body) }, schema),
  patch: <T>(path: string, body: unknown, schema: z.ZodType<T>) =>
    apiRequest(`/api/backend${path}`, { method: "PATCH", body: JSON.stringify(body) }, schema),
  signin: <T>(body: unknown, schema: z.ZodType<T>) =>
    apiRequest("/api/auth/signin", { method: "POST", body: JSON.stringify(body) }, schema),
  signout: () =>
    apiRequest("/api/auth/signout", { method: "POST" }, z.object({ signedOut: z.boolean() })),
};
