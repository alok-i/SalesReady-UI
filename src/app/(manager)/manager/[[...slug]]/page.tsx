import { ManagerScreen } from "@/components/manager-screen";

export default async function ManagerPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  return <ManagerScreen slug={slug} />;
}
