"use client";

import {
  BarChart3, Bell, BookOpenCheck, BrainCircuit, ChevronDown, CircleUserRound,
  GraduationCap, Home, Library, LogOut, Menu, MessageSquareText, Search, Settings, Sparkles,
  Target, Users, X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { useCurrentUser } from "@/lib/queries";
import { ErrorState, LoadingState } from "./ui";

type NavItem = { label: string; href: string; icon: typeof Home };

const managerNav: NavItem[] = [
  { label: "Overview", href: "/manager", icon: Home },
  { label: "Company Brain", href: "/manager/company", icon: BrainCircuit },
  { label: "Knowledge", href: "/manager/knowledge", icon: Library },
  { label: "Research", href: "/manager/research", icon: Search },
  { label: "Programs", href: "/manager/programs", icon: GraduationCap },
  { label: "Reps", href: "/manager/reps", icon: Users },
  { label: "Reports", href: "/manager/report", icon: BarChart3 },
];

const repNav: NavItem[] = [
  { label: "Today", href: "/rep", icon: Home },
  { label: "Learn", href: "/rep/learn", icon: BookOpenCheck },
  { label: "Assessment", href: "/rep/assessment", icon: Target },
  { label: "AI Interview", href: "/rep/interview", icon: MessageSquareText },
  { label: "Roleplay", href: "/rep/roleplay", icon: Sparkles },
  { label: "Feedback", href: "/rep/feedback", icon: BarChart3 },
  { label: "Progress", href: "/rep/progress", icon: GraduationCap },
];

export function AppShell({ children, role }: { children: React.ReactNode; role: "manager" | "rep" }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const currentUser = useCurrentUser();
  const signout = useMutation({
    mutationFn: api.signout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
  const nav = role === "manager" ? managerNav : repNav;

  useEffect(() => {
    if (currentUser.error instanceof ApiError && currentUser.error.status === 401) {
      void api.signout().finally(() => {
        queryClient.clear();
        router.replace("/login");
        router.refresh();
      });
      return;
    }
    const actualRole = currentUser.data?.role;
    if (actualRole && role === "rep" && actualRole !== "REP") {
      router.replace("/manager");
    } else if (actualRole && role === "manager" && actualRole === "REP") {
      router.replace("/rep");
    }
  }, [currentUser.data?.role, currentUser.error, queryClient, role, router]);

  if (currentUser.isPending) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f8fc]"><LoadingState label="Loading your workspace…" /></div>;
  }

  if (currentUser.isError) {
    return <div className="mx-auto max-w-xl p-8"><ErrorState message={currentUser.error.message} onRetry={() => currentUser.refetch()} /></div>;
  }

  const { user, organization, role: sessionRole } = currentUser.data;
  if ((role === "rep" && sessionRole !== "REP") || (role === "manager" && sessionRole === "REP")) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f8fc]"><LoadingState label="Opening your workspace…" /></div>;
  }
  const displayRole = sessionRole === "REP" ? "Sales representative" : sessionRole === "ADMIN" ? "Administrator" : "Enablement manager";
  const organizationInitials = organization.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
      {open && <button className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between px-6">
          <Link href={role === "manager" ? "/manager" : "/rep"} className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white"><Sparkles size={18} fill="currentColor" /></span>
            SalesReady<span className="text-violet-600">AI</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close navigation"><X size={20} /></button>
        </div>
        <div className="mx-4 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">{organizationInitials}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{organization.name}</p><p className="text-xs text-slate-500">{sessionRole.toLowerCase()} workspace</p></div>
            <ChevronDown size={15} className="text-slate-400" />
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label={`${role} navigation`}>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">{role === "manager" ? "Manage" : "My training"}</p>
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><Icon size={18} strokeWidth={active ? 2.4 : 1.8} />{item.label}</Link>;
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          {role === "manager" && <Link href="/manager/setup" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><Settings size={18} />Workspace settings</Link>}
          <button onClick={() => signout.mutate()} disabled={signout.isPending} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50 disabled:opacity-50">
            <CircleUserRound size={32} className="text-slate-400" />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{user.displayName}</span><span className="block truncate text-xs text-slate-500">{signout.isPending ? "Signing out…" : displayRole}</span></span>
            <LogOut size={16} className="text-slate-400" />
          </button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="mr-auto pl-12 text-sm text-slate-500 lg:pl-0"><span className="hidden sm:inline">Workspace / </span><span className="font-semibold capitalize text-slate-800">{pathname.split("/").filter(Boolean).at(-1) ?? "Overview"}</span></div>
          <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell size={19} /><span className="absolute right-2 top-2 size-2 rounded-full bg-violet-600 ring-2 ring-white" /></button>
        </header>
        <main className="mx-auto max-w-360 p-4 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
