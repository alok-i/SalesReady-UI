"use client";

import { ErrorState } from "@/components/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto w-full max-w-3xl p-8"><ErrorState onRetry={reset} /></main>;
}
