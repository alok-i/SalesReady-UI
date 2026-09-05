"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  LogOut,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError, api } from "@/lib/api";
import {
  createPlatformOrganization,
  queryKeys,
  useCurrentUser,
  usePlatformOrganizations,
} from "@/lib/queries";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from "./ui";

const createOrgSchema = z.object({
  name: z.string().trim().min(1, "Enter an organization name").max(100),
  adminDisplayName: z.string().trim().min(1, "Enter the admin name").max(100),
  adminEmail: z.email("Enter a valid admin email"),
  adminPassword: z.string().min(8, "Use at least 8 characters").max(128),
  salesMotion: z.enum(["enterprise", "midmarket", "plg"]),
  masteryGoals: z.string().trim().min(1, "Describe what reps should master").max(2000),
});
type CreateOrgValues = z.infer<typeof createOrgSchema>;

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const signout = useMutation({
    mutationFn: api.signout,
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });

  useEffect(() => {
    if (currentUser.error instanceof ApiError && currentUser.error.status === 401) {
      void api.signout().finally(() => {
        queryClient.clear();
        router.replace("/login");
        router.refresh();
      });
      return;
    }
    if (currentUser.data && !currentUser.data.isPlatformAdmin && !currentUser.data.user.isPlatformAdmin) {
      router.replace(currentUser.data.role === "REP" ? "/rep" : "/manager");
    }
  }, [currentUser.data, currentUser.error, queryClient, router]);

  if (currentUser.isPending) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f8fc]"><LoadingState label="Loading platform console…" /></div>;
  }

  if (currentUser.isError) {
    return <div className="mx-auto max-w-xl p-8"><ErrorState message={currentUser.error.message} onRetry={() => currentUser.refetch()} /></div>;
  }

  const { user } = currentUser.data;
  if (!currentUser.data.isPlatformAdmin && !user.isPlatformAdmin) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f8fc]"><LoadingState label="Opening your workspace…" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-20 items-center px-6">
          <Link href="/platform" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950">
            <span className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white"><Sparkles size={18} fill="currentColor" /></span>
            SalesReady<span className="text-violet-600">AI</span>
          </Link>
        </div>
        <div className="mx-4 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">Platform console</p>
          <p className="text-xs text-slate-500">Onboard and monitor customer orgs</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          <Link
            href="/platform"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${pathname === "/platform" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Building2 size={18} /> Organizations
          </Link>
          <Link
            href="/platform/onboard"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${pathname.startsWith("/platform/onboard") ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Plus size={18} /> Onboard organization
          </Link>
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button onClick={() => signout.mutate()} disabled={signout.isPending} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50 disabled:opacity-50">
            <Users size={20} className="text-slate-400" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800">{user.displayName}</span>
              <span className="block truncate text-xs text-slate-500">{signout.isPending ? "Signing out…" : "Super admin"}</span>
            </span>
            <LogOut size={16} className="text-slate-400" />
          </button>
        </div>
      </aside>
      <div className="pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200/80 bg-white/90 px-8 backdrop-blur">
          <div className="text-sm text-slate-500">
            Platform / <span className="font-semibold capitalize text-slate-800">{pathname.split("/").filter(Boolean).at(-1) ?? "organizations"}</span>
          </div>
        </header>
        <main className="mx-auto max-w-360 p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

export function PlatformScreen({ slug }: { slug?: string[] }) {
  const page = slug?.[0] ?? "organizations";
  if (page === "onboard") return <OnboardOrganization />;
  return <OrganizationsOverview />;
}

function OrganizationsOverview() {
  const organizations = usePlatformOrganizations();

  if (organizations.isPending) return <LoadingState label="Loading organizations…" />;
  if (organizations.isError) {
    return <ErrorState message={organizations.error.message} onRetry={() => organizations.refetch()} />;
  }

  const rows = organizations.data;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super admin"
        title="Customer organizations"
        description="Monitor every onboarded organization and open onboarding for new customers."
        action={<Link href="/platform/onboard"><Button><Plus size={17} />Onboard organization</Button></Link>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Organizations</p><p className="mt-2 text-3xl font-bold">{rows.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Total reps</p><p className="mt-2 text-3xl font-bold">{rows.reduce((sum, org) => sum + org.counts.reps, 0)}</p></Card>
        <Card><p className="text-sm text-slate-500">Programs</p><p className="mt-2 text-3xl font-bold">{rows.reduce((sum, org) => sum + org.counts.programs, 0)}</p></Card>
      </div>
      <Card>
        {rows.length === 0 ? (
          <EmptyState
            title="No customer organizations yet"
            description="Create the first customer workspace and assign their organization admin."
            action={<Link href="/platform/onboard"><Button>Onboard organization</Button></Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Admins</th>
                  <th className="pb-3">Reps</th>
                  <th className="pb-3">Programs</th>
                  <th className="pb-3">Assignments</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((org) => (
                  <tr key={org.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4">
                      <p className="text-sm font-semibold text-slate-800">{org.name}</p>
                      <p className="text-xs text-slate-500">{org.slug}</p>
                    </td>
                    <td className="py-4 text-sm text-slate-600">
                      {(org.admins ?? []).map((admin) => admin.displayName).join(", ") || "—"}
                    </td>
                    <td className="py-4"><Badge tone="purple">{org.counts.reps}</Badge></td>
                    <td className="py-4 text-sm font-semibold">{org.counts.programs}</td>
                    <td className="py-4 text-sm font-semibold">{org.counts.assignments}</td>
                    <td className="py-4 text-sm text-slate-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function OnboardOrganization() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createdName, setCreatedName] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      salesMotion: "enterprise",
      masteryGoals: "Consultative discovery, business value articulation, and confident competitive positioning.",
    },
  });

  const create = useMutation({
    mutationFn: createPlatformOrganization,
    onSuccess: async (result) => {
      setCreatedName(result.organization.name);
      reset();
      await queryClient.invalidateQueries({ queryKey: queryKeys.platformOrganizations });
    },
  });

  const onSubmit = handleSubmit((values: CreateOrgValues) => {
    setCreatedName(undefined);
    create.mutate({
      name: values.name,
      companyProfile: {
        companyName: values.name,
        salesMotion: values.salesMotion,
        masteryGoals: values.masteryGoals,
      },
      admin: {
        email: values.adminEmail,
        displayName: values.adminDisplayName,
        password: values.adminPassword,
      },
    });
  });

  const errorMessage = create.error instanceof ApiError
    ? create.error.message
    : create.error
      ? "Unable to onboard organization. Please try again."
      : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Onboarding"
        title="Create a customer organization"
        description="Provision the workspace and its first organization admin. That admin will manage knowledge, programs, and reps."
      />
      <Card>
        <form className="space-y-6" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-semibold">Organization name</span>
            <input {...register("name")} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
            {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Org admin name</span>
              <input {...register("adminDisplayName")} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              {errors.adminDisplayName && <span className="mt-1 block text-xs text-red-600">{errors.adminDisplayName.message}</span>}
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Org admin email</span>
              <input type="email" {...register("adminEmail")} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
              {errors.adminEmail && <span className="mt-1 block text-xs text-red-600">{errors.adminEmail.message}</span>}
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold">Temporary admin password</span>
            <input type="password" {...register("adminPassword")} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
            {errors.adminPassword && <span className="mt-1 block text-xs text-red-600">{errors.adminPassword.message}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Primary sales motion</span>
            <select {...register("salesMotion")} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <option value="enterprise">Enterprise</option>
              <option value="midmarket">Mid-market</option>
              <option value="plg">Product-led growth</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">What should reps master?</span>
            <textarea {...register("masteryGoals")} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" />
            {errors.masteryGoals && <span className="mt-1 block text-xs text-red-600">{errors.masteryGoals.message}</span>}
          </label>
          {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
          {createdName && !create.isPending && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {createdName} was onboarded. Its organization admin can now sign in to the manager workspace.
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/platform")}>Back to list</Button>
            <Button type="submit" disabled={create.isPending || isSubmitting}>
              {create.isPending ? "Creating…" : "Create organization"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
