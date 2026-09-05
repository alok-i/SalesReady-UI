import { PlatformScreen } from "@/components/platform-screen";

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  return <PlatformScreen slug={slug} />;
}
