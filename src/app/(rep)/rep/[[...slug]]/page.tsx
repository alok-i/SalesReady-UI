import { RepScreen } from "@/components/rep-screen";

export default async function RepPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { slug } = await params;
  const { session } = await searchParams;
  return <RepScreen slug={slug} sessionId={session} />;
}
