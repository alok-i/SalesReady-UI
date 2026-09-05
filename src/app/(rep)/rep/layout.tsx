import { AppShell } from "@/components/app-shell";

export default function RepLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="rep">{children}</AppShell>;
}
