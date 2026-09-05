"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, BrainCircuit, Check, CheckCircle2, Clock3, FileText, Globe2, MoreHorizontal, Plus, Search, Sparkles, Upload, Users } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { organizationSchema } from "@/lib/api-contracts";
import { brainTopics, knowledge, programDays, reportSkills } from "@/lib/demo-data";
import { queryKeys, useCurrentUser, useManagerDashboard, useMemberships } from "@/lib/queries";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, Progress } from "./ui";

function Overview() {
  const currentUser = useCurrentUser();
  const dashboard = useManagerDashboard();
  const memberships = useMemberships();

  if (dashboard.isPending || memberships.isPending || currentUser.isPending) {
    return <LoadingState label="Loading dashboard…" />;
  }
  if (dashboard.isError) {
    return <ErrorState message={dashboard.error.message} onRetry={() => dashboard.refetch()} />;
  }
  if (memberships.isError) {
    return <ErrorState message={memberships.error.message} onRetry={() => memberships.refetch()} />;
  }

  const firstName = currentUser.data?.user.displayName.split(/\s+/)[0] ?? "there";
  const activeReps = dashboard.data.members;
  const assignmentTotal = dashboard.data.assignments.reduce((sum, item) => sum + item._count, 0);
  const completedAssignments = dashboard.data.assignments.find((item) => item.status === "COMPLETED")?._count ?? 0;
  const inProgressAssignments = dashboard.data.assignments.find((item) => item.status === "IN_PROGRESS")?._count ?? 0;
  const completionRate = assignmentTotal > 0 ? Math.round((completedAssignments / assignmentTotal) * 100) : null;
  const avgReadiness = dashboard.data.latestSnapshots.length > 0
    ? Math.round(
        dashboard.data.latestSnapshots.reduce((sum, snapshot) => sum + snapshot.score, 0)
          / dashboard.data.latestSnapshots.length,
      )
    : null;

  const snapshotByUser = new Map(dashboard.data.latestSnapshots.map((snapshot) => [snapshot.userId, snapshot]));
  const reps = memberships.data
    .filter((membership) => membership.role === "REP")
    .map((membership) => {
      const snapshot = snapshotByUser.get(membership.userId);
      return {
        id: membership.userId,
        name: membership.user.displayName,
        initials: membership.user.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
        role: membership.role,
        progress: snapshot ? Math.round(snapshot.score) : 0,
        hasSnapshot: Boolean(snapshot),
      };
    });

  const kpis = [
    {
      label: "Active reps",
      value: String(activeReps),
      note: activeReps === 0 ? "No reps assigned yet" : `${activeReps} in this organization`,
      Icon: Users,
    },
    {
      label: "Avg. readiness",
      value: avgReadiness === null ? "—" : `${avgReadiness}%`,
      note: avgReadiness === null ? "No readiness snapshots yet" : `Based on ${dashboard.data.latestSnapshots.length} reps`,
      Icon: BrainCircuit,
    },
    {
      label: "Completion rate",
      value: completionRate === null ? "—" : `${completionRate}%`,
      note: assignmentTotal === 0 ? "No program assignments yet" : `${inProgressAssignments} in progress`,
      Icon: CheckCircle2,
    },
    {
      label: "Practice hours",
      value: "—",
      note: "Not available from the API yet",
      Icon: Clock3,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Manager overview"
        title={`Good afternoon, ${firstName}`}
        description="Here’s how your team is progressing toward sales readiness."
        action={<Button><Plus size={17} />Create program</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, note, Icon }) => (
          <Card key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">{note}</p>
              </div>
              <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600"><Icon size={19} /></span>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Team readiness</h2>
              <p className="text-sm text-slate-500">Current program progress</p>
            </div>
            <Button variant="ghost">View all <ArrowRight size={16} /></Button>
          </div>
          {reps.length === 0 ? (
            <EmptyState title="No reps yet" description="Invite reps to this organization to track readiness here." />
          ) : (
            <div className="space-y-5">
              {reps.map((rep) => (
                <div key={rep.id} className="grid items-center gap-3 sm:grid-cols-[180px_1fr_70px]">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{rep.initials}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{rep.name}</p>
                      <p className="text-xs text-slate-500">{rep.hasSnapshot ? "Readiness score" : "No score yet"}</p>
                    </div>
                  </div>
                  <Progress value={rep.progress} />
                  <span className="text-right text-sm font-bold text-slate-800">{rep.hasSnapshot ? `${rep.progress}%` : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="bg-slate-950 text-white">
          <span className="inline-flex rounded-xl bg-violet-500/20 p-3 text-violet-300"><Sparkles /></span>
          <h2 className="mt-5 text-xl font-bold">Company Brain coverage is coming next</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Knowledge coverage metrics will replace this placeholder once the knowledge APIs are wired into the overview.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Company() {
  return <div className="space-y-8"><PageHeader eyebrow="Company Brain" title="Your sales intelligence layer" description="SalesReadyAI turns your trusted company content into grounded training, roleplays, and evaluations." action={<Button><Sparkles size={17} />Refresh brain</Button>} />
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]"><Card className="text-center"><div className="mx-auto grid size-32 place-items-center rounded-full bg-[conic-gradient(#7c3aed_84%,#ede9fe_0)]"><div className="grid size-24 place-items-center rounded-full bg-white"><div><p className="text-3xl font-bold text-slate-950">84%</p><p className="text-xs text-slate-500">coverage</p></div></div></div><h2 className="mt-5 font-bold text-slate-900">Strong foundation</h2><p className="mt-1 text-sm text-slate-500">42 sources · updated 18 min ago</p></Card>
      <Card><h2 className="font-bold text-slate-900">Knowledge coverage</h2><div className="mt-6 space-y-5">{brainTopics.map(topic => <div key={topic.name}><div className="mb-2 flex justify-between"><span className="text-sm font-semibold text-slate-700">{topic.name}</span><span className="text-xs text-slate-500">{topic.sources} sources</span></div><Progress value={topic.coverage} /></div>)}</div></Card></div>
    <Card><div className="flex items-start gap-4"><span className="rounded-xl bg-amber-50 p-3 text-amber-600"><Sparkles size={20} /></span><div className="flex-1"><h2 className="font-bold text-slate-900">Recommended next step</h2><p className="mt-1 text-sm text-slate-500">Your competitive landscape coverage is below target. Add current battlecards or start AI-assisted research.</p></div><Button variant="secondary">Start research</Button></div></Card></div>;
}

function Knowledge() {
  const [query, setQuery] = useState("");
  const filtered = knowledge.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-8"><PageHeader eyebrow="Company knowledge" title="Ground AI in what your team trusts" description="Upload documents and links. Every generated lesson and evaluation stays traceable to these sources." action={<Button><Upload size={17} />Upload sources</Button>} />
    <Card><div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Search knowledge</span><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search knowledge…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></label><Button variant="secondary"><Globe2 size={17} />Add website</Button></div>
      <div className="mt-6 overflow-x-auto">{filtered.length ? <table className="w-full text-left"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="pb-3 font-semibold">Source</th><th className="pb-3 font-semibold">Type</th><th className="pb-3 font-semibold">Status</th><th className="pb-3 font-semibold">Updated</th><th /></tr></thead><tbody>{filtered.map(item => <tr key={item.title} className="border-b border-slate-100 last:border-0"><td className="py-4"><div className="flex items-center gap-3"><span className="rounded-lg bg-violet-50 p-2 text-violet-600"><FileText size={17} /></span><div><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="text-xs text-slate-500">{item.size}</p></div></div></td><td className="py-4 text-sm text-slate-500">{item.type}</td><td className="py-4"><Badge tone={item.status === "Ready" ? "green" : "amber"}>{item.status}</Badge></td><td className="py-4 text-sm text-slate-500">{item.updated}</td><td><button aria-label={`Actions for ${item.title}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table> : <EmptyState title="No matching sources" description="Try another search term or upload a new source." />}</div></Card></div>;
}

function Research() {
  return <div className="space-y-8"><PageHeader eyebrow="AI Research" title="Fill knowledge gaps, with evidence" description="Research your market and competitors. Review every finding and source before it enters your Company Brain." action={<Button><Plus size={17} />New research task</Button>} />
    <div className="grid gap-4 md:grid-cols-3">{[["Competitive messaging", "11 findings", "Ready to review"], ["Market trends: AI sales", "8 findings", "In progress"], ["Enterprise buying signals", "6 findings", "Ready to review"]].map(([title,count,status]) => <Card key={title}><div className="flex justify-between"><span className="rounded-xl bg-violet-50 p-2.5 text-violet-600"><Globe2 size={19} /></span><Badge tone={status === "In progress" ? "amber" : "green"}>{status}</Badge></div><h2 className="mt-5 font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{count} · sources checked</p><button className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-600">Open research <ArrowRight size={15} /></button></Card>)}</div>
    <Card><h2 className="font-bold text-slate-900">Latest evidence</h2><blockquote className="mt-5 border-l-2 border-violet-400 pl-4 text-sm leading-6 text-slate-600">“Revenue teams adopting conversation intelligence see faster ramp when coaching is tied to observed behaviors.”</blockquote><div className="mt-4 flex justify-between text-xs text-slate-500"><span>Gartner Market Guide · Aug 2026</span><Button variant="secondary"><Check size={15} />Approve finding</Button></div></Card></div>;
}

function Programs() {
  return <div className="space-y-8"><PageHeader eyebrow="15-day program" title="Enterprise AE readiness" description="A focused path from company context to certified performance. Generated from your Company Brain." action={<Button><Sparkles size={17} />Generate program</Button>} />
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><Card><div className="grid gap-3 md:grid-cols-2">{programDays.map(day => <article key={day.day} className={`flex items-center gap-4 rounded-xl border p-4 ${day.complete ? "border-emerald-100 bg-emerald-50/50" : "border-slate-200"}`}><span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${day.complete ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{day.complete ? <Check size={17} /> : day.day}</span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Day {day.day} · {day.focus}</p><h3 className="truncate text-sm font-semibold text-slate-800">{day.title}</h3></div></article>)}</div></Card>
      <div className="space-y-5"><Card><h2 className="font-bold text-slate-900">Program health</h2><div className="mt-5 space-y-4"><Progress value={76} label="Completion" /><Progress value={82} label="Average score" /></div><dl className="mt-6 grid grid-cols-2 gap-3 text-center"><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Assigned</dt><dd className="text-xl font-bold">24</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">Certified</dt><dd className="text-xl font-bold">7</dd></div></dl></Card><Button className="w-full"><Users size={17} />Assign reps</Button></div></div></div>;
}

function Reps() {
  const dashboard = useManagerDashboard();
  const memberships = useMemberships();

  if (dashboard.isPending || memberships.isPending) {
    return <LoadingState label="Loading reps…" />;
  }
  if (dashboard.isError) {
    return <ErrorState message={dashboard.error.message} onRetry={() => dashboard.refetch()} />;
  }
  if (memberships.isError) {
    return <ErrorState message={memberships.error.message} onRetry={() => memberships.refetch()} />;
  }

  const snapshotByUser = new Map(dashboard.data.latestSnapshots.map((snapshot) => [snapshot.userId, snapshot]));
  const reps = memberships.data
    .filter((membership) => membership.role === "REP")
    .map((membership) => {
      const snapshot = snapshotByUser.get(membership.userId);
      const score = snapshot ? Math.round(snapshot.score) : null;
      const status = !snapshot
        ? "No score yet"
        : snapshot.status === "READY"
          ? "On track"
          : "Needs attention";
      return {
        id: membership.userId,
        name: membership.user.displayName,
        initials: membership.user.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
        role: membership.role,
        progress: score ?? 0,
        score,
        status,
      };
    });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Team"
        title="Rep readiness"
        description="Monitor progress, spot coaching opportunities, and certify reps who demonstrate consistent performance."
        action={<Button><Plus size={17} />Invite reps</Button>}
      />
      <Card>
        {reps.length === 0 ? (
          <EmptyState title="No reps yet" description="Invite reps to this organization to track readiness here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3">Rep</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Readiness</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((rep) => (
                  <tr key={rep.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{rep.initials}</span>
                        <div>
                          <p className="text-sm font-semibold">{rep.name}</p>
                          <p className="text-xs text-slate-500">{rep.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="min-w-40 py-4 pr-8">
                      <Progress value={rep.progress} label={rep.score === null ? "No score yet" : `${rep.progress}% complete`} />
                    </td>
                    <td className="py-4 font-bold">{rep.score === null ? "—" : `${rep.score}%`}</td>
                    <td className="py-4">
                      <Badge tone={rep.status === "On track" ? "green" : rep.status === "Needs attention" ? "amber" : "neutral"}>
                        {rep.status}
                      </Badge>
                    </td>
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

function Report() {
  return <div className="space-y-8"><PageHeader eyebrow="Readiness report" title="Evidence, not activity" description="A clear view of what your team knows, can do, and needs to practice next." action={<Button variant="secondary">Export report</Button>} />
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]"><Card><h2 className="font-bold">Team skill profile</h2><p className="text-sm text-slate-500">Based on 312 scored interactions</p><div className="mt-7 space-y-5">{reportSkills.map(skill => <Progress key={skill.label} value={skill.value} label={skill.label} />)}</div></Card>
      <Card><h2 className="font-bold">Certification</h2><p className="mt-1 text-sm text-slate-500">Enterprise AE · Cohort 4</p><div className="mt-6 rounded-2xl bg-violet-50 p-5 text-center"><p className="text-4xl font-bold text-violet-700">7</p><p className="text-sm font-medium text-violet-700">reps certified</p></div><ul className="mt-5 space-y-3 text-sm">{["Knowledge score ≥ 85%", "Roleplay score ≥ 80%", "Manager review complete"].map(x => <li className="flex gap-2" key={x}><CheckCircle2 size={18} className="text-emerald-500" />{x}</li>)}</ul><Button className="mt-6 w-full">Review certifications</Button></Card></div></div>;
}

const workspaceSchema = z.object({
  companyName: z.string().trim().min(1, "Enter a company name").max(100),
  salesMotion: z.enum(["enterprise", "midmarket", "plg"]),
  masteryGoals: z.string().trim().min(1, "Describe what reps should master").max(2000),
});
type WorkspaceValues = z.infer<typeof workspaceSchema>;

function Setup() {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const [saved, setSaved] = useState(false);
  const profile = companyProfileFromOrg(currentUser.data?.organization);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    values: profile,
  });

  const save = useMutation({
    mutationFn: async (values: WorkspaceValues) => {
      const existing =
        typeof currentUser.data?.organization.companyProfile === "object" &&
        currentUser.data.organization.companyProfile
          ? currentUser.data.organization.companyProfile
          : {};
      return api.patch(
        "/organizations/company-profile",
        {
          ...existing,
          companyName: values.companyName,
          salesMotion: values.salesMotion,
          masteryGoals: values.masteryGoals,
        },
        organizationSchema,
      );
    },
    onSuccess: async () => {
      setSaved(true);
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });

  if (currentUser.isPending) return <LoadingState label="Loading workspace…" />;
  if (currentUser.isError) {
    return <ErrorState message={currentUser.error.message} onRetry={() => currentUser.refetch()} />;
  }

  const onSubmit = handleSubmit((values: WorkspaceValues) => {
    setSaved(false);
    save.mutate(values);
  });

  const errorMessage = save.error instanceof ApiError
    ? save.error.message
    : save.error
      ? "Unable to save workspace. Please try again."
      : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Workspace setup"
        title="Tune your SalesReadyAI workspace"
        description="Set the company context used for training, roleplays, and evaluations. Saving this completes org onboarding for your workspace."
      />
      <Card>
        <form className="space-y-6" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-semibold">Company name</span>
            <input
              {...register("companyName")}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            {errors.companyName && (
              <span className="mt-1 block text-xs text-red-600">{errors.companyName.message}</span>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Primary sales motion</span>
            <select
              {...register("salesMotion")}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <option value="enterprise">Enterprise</option>
              <option value="midmarket">Mid-market</option>
              <option value="plg">Product-led growth</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">What should reps master?</span>
            <textarea
              {...register("masteryGoals")}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            {errors.masteryGoals && (
              <span className="mt-1 block text-xs text-red-600">{errors.masteryGoals.message}</span>
            )}
          </label>
          {errorMessage && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}
          {saved && !save.isPending && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Workspace saved. Your organization profile is up to date.
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={save.isPending || isSubmitting}>
              {save.isPending ? "Saving…" : "Save workspace"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function companyProfileFromOrg(organization?: {
  name: string;
  companyProfile?: Record<string, unknown> | null;
}): WorkspaceValues {
  const profile = organization?.companyProfile ?? {};
  const salesMotion = profile.salesMotion;
  return {
    companyName: typeof profile.companyName === "string" && profile.companyName.trim()
      ? profile.companyName
      : organization?.name ?? "",
    salesMotion:
      salesMotion === "enterprise" || salesMotion === "midmarket" || salesMotion === "plg"
        ? salesMotion
        : "enterprise",
    masteryGoals:
      typeof profile.masteryGoals === "string" && profile.masteryGoals.trim()
        ? profile.masteryGoals
        : "Consultative discovery, business value articulation, and confident competitive positioning.",
  };
}

export function ManagerScreen({ slug }: { slug?: string[] }) {
  const page = slug?.[0] ?? "overview";
  if (page === "company") return <Company />;
  if (page === "knowledge") return <Knowledge />;
  if (page === "research") return <Research />;
  if (page === "programs") return <Programs />;
  if (page === "reps") return <Reps />;
  if (page === "report") return <Report />;
  if (page === "setup") return <Setup />;
  return <Overview />;
}
