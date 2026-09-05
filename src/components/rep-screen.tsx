"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Flame, Lightbulb, Send, Sparkles, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  simulationEvaluationSchema,
  simulationMessagesSchema,
  simulationSessionSchema,
  type SimulationEvaluation,
  type SimulationMessage,
} from "@/lib/api-contracts";
import { programDays, reportSkills } from "@/lib/demo-data";
import { useCurrentUser, useDailyTasks, useSimulationScenarios } from "@/lib/queries";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, Progress } from "./ui";

function Home() {
  const currentUser = useCurrentUser();
  const assignments = useDailyTasks();

  if (assignments.isPending) return <LoadingState label="Loading today’s plan…" />;
  if (assignments.isError) return <ErrorState message={assignments.error.message} onRetry={() => assignments.refetch()} />;

  const assignment = assignments.data[0];
  const version = assignment?.program.versions.slice().sort((a, b) => b.version - a.version)[0];
  const days = version?.days.slice().sort((a, b) => a.dayNumber - b.dayNumber) ?? [];
  const activeDay = days.find(day => day.tasks.length > 0);
  const tasks = activeDay?.tasks.slice().sort((a, b) => a.ordinal - b.ordinal) ?? [];
  const firstName = currentUser.data?.user.displayName.split(/\s+/)[0] ?? "there";

  if (!assignment || !activeDay) {
    return <div className="space-y-8"><PageHeader eyebrow="Today" title={`Good afternoon, ${firstName}`} description="Your assigned learning will appear here." /><EmptyState title="No active program" description="Ask your manager to assign an approved readiness program." /></div>;
  }

  const taskHref = (type: "LESSON" | "ASSESSMENT" | "SIMULATION") =>
    type === "LESSON" ? "/rep/learn" : type === "ASSESSMENT" ? "/rep/assessment" : "/rep/roleplay";

  return <div className="space-y-8"><PageHeader eyebrow={`Day ${activeDay.dayNumber} of ${days.length}`} title={`Good afternoon, ${firstName}`} description={`Continue ${assignment.program.name} and complete today’s assigned plan.`} />
    <Card className="overflow-hidden border-0 bg-linear-to-br from-violet-700 to-indigo-700 text-white"><div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center"><div><Badge tone="purple">Today’s focus</Badge><h2 className="mt-4 text-2xl font-bold">{activeDay.title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-violet-100">{tasks.length} task{tasks.length === 1 ? "" : "s"} from the latest approved program version.</p><Link href={tasks[0] ? taskHref(tasks[0].type) : "/rep"}><Button className="mt-6 bg-white text-violet-700 hover:bg-violet-50">Continue learning <ArrowRight size={16} /></Button></Link></div><div className="grid size-32 place-items-center rounded-full border-10 border-white/20 bg-white/10"><div className="text-center"><p className="text-3xl font-bold">{tasks.length}</p><p className="text-xs text-violet-100">assigned</p></div></div></div></Card>
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><Card><div className="flex items-center justify-between"><div><h2 className="font-bold">Today’s plan</h2><p className="text-sm text-slate-500">{assignment.program.name}</p></div><Badge tone={assignment.status === "IN_PROGRESS" ? "amber" : "green"}>{assignment.status.toLowerCase().replace("_", " ")}</Badge></div><div className="mt-5 space-y-3">{tasks.map((task, i) => <Link href={taskHref(task.type)} key={task.id} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-violet-300 hover:bg-violet-50/40"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600">{i + 1}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{task.type}</p><h3 className="text-sm font-semibold text-slate-800">{task.title}</h3><p className="text-xs text-slate-500">Task {task.ordinal}</p></div><ArrowRight size={17} className="text-slate-400" /></Link>)}</div></Card>
      <div className="space-y-5"><Card><div className="flex gap-4"><span className="rounded-xl bg-orange-50 p-3 text-orange-500"><Flame /></span><div><p className="text-3xl font-bold">8 days</p><p className="text-sm text-slate-500">Your longest streak yet</p></div></div></Card><Card><h2 className="font-bold">Overall readiness</h2><div className="mt-4 flex items-end justify-between"><p className="text-4xl font-bold text-slate-950">88%</p><span className="text-xs font-semibold text-emerald-600">+5% this week</span></div><div className="mt-4"><Progress value={88} /></div></Card></div></div></div>;
}

function Learn() {
  return <div className="mx-auto max-w-4xl space-y-8"><PageHeader eyebrow="Day 4 · Learn" title="The product narrative" description="Learn a simple structure for connecting buyer pain to a differentiated point of view." />
    <Card className="p-0 overflow-hidden"><div className="bg-slate-950 px-6 py-10 text-white sm:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Lesson 1 of 3 · 8 minutes</p><h2 className="mt-3 max-w-2xl text-3xl font-bold">Great stories start with change—not your product.</h2></div><article className="prose max-w-none px-6 py-8 text-slate-600 sm:px-12"><p className="text-lg leading-8">Your buyer is already navigating change. The strongest narrative names that shift, shows why the old approach is costly, and creates urgency for a better way.</p><div className="my-8 rounded-2xl border border-violet-100 bg-violet-50 p-6"><Lightbulb className="mb-3 text-violet-600" /><h3 className="font-bold text-slate-900">The three-part narrative</h3><ol className="mt-3 space-y-2 text-sm"><li><strong>1. Name the change</strong> reshaping the buyer’s world.</li><li><strong>2. Expose the cost</strong> of maintaining the status quo.</li><li><strong>3. Show the path</strong> to a measurable business outcome.</li></ol></div><h3 className="font-bold text-slate-900">Try this</h3><p className="leading-7">Instead of “Our platform uses AI to improve sales readiness,” lead with: “The way buyers evaluate vendors has changed—but most reps are still trained on product recall.”</p></article><div className="flex justify-between border-t border-slate-100 p-5"><Button variant="ghost"><ArrowLeft size={16} />Back</Button><Button>Complete lesson <Check size={16} /></Button></div></Card></div>;
}

function Assessment() {
  const [choice, setChoice] = useState<number>();
  return <div className="mx-auto max-w-3xl space-y-8"><PageHeader eyebrow="Assessment · Question 4 of 10" title="Product & positioning checkpoint" description="Choose the strongest response. You’ll get source-grounded feedback after each answer." />
    <Progress value={40} /><Card><p className="text-xs font-bold uppercase tracking-wide text-violet-600">Single choice</p><h2 className="mt-3 text-xl font-bold leading-8">A prospect says, “We already have a learning management system.” What is the best first response?</h2><fieldset className="mt-6 space-y-3"><legend className="sr-only">Choose an answer</legend>{["Our platform has more modern AI features than a traditional LMS.", "That makes sense. How are you currently measuring whether reps can perform in real buyer conversations?", "SalesReadyAI can replace your LMS and consolidate your tech stack.", "Would you like me to show you a feature comparison?"].map((answer, i) => <label key={answer} className={`flex cursor-pointer gap-4 rounded-xl border p-4 text-sm leading-6 transition ${choice === i ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-300"}`}><input type="radio" name="answer" className="mt-1 accent-violet-600" checked={choice === i} onChange={() => setChoice(i)} /><span><strong className="mr-2">{String.fromCharCode(65+i)}.</strong>{answer}</span></label>)}</fieldset><div className="mt-7 flex justify-end"><Button disabled={choice === undefined}>Submit answer <ArrowRight size={16} /></Button></div></Card></div>;
}

function Conversation({ roleplay = false }: { roleplay?: boolean }) {
  const router = useRouter();
  const scenarios = useSimulationScenarios();
  const [sessionId, setSessionId] = useState<string>();
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const type = roleplay ? "ROLEPLAY" : "INTERVIEW";
  const scenario = scenarios.data?.find(item => item.type === type);
  const start = useMutation({
    mutationFn: () => api.post(`/learning/simulations/${scenario!.id}/sessions`, {}, simulationSessionSchema),
    onSuccess: session => setSessionId(session.id),
  });
  const sendMessage = useMutation({
    mutationFn: (content: string) => api.post(`/learning/simulation-sessions/${sessionId}/messages`, { content }, simulationMessagesSchema),
    onSuccess: newMessages => {
      setMessages(current => [...current, ...newMessages]);
      setDraft("");
    },
  });
  const complete = useMutation({
    mutationFn: () => api.post(`/learning/simulation-sessions/${sessionId}/complete`, {}, simulationEvaluationSchema),
    onSuccess: evaluation => {
      sessionStorage.setItem(`simulation-evaluation:${evaluation.sessionId}`, JSON.stringify(evaluation));
      router.push(`/rep/feedback?session=${encodeURIComponent(evaluation.sessionId)}`);
    },
  });
  const error = start.error ?? sendMessage.error ?? complete.error;
  const errorMessage = error instanceof ApiError ? error.message : error?.message;
  const send = () => {
    const content = draft.trim();
    if (!content || !sessionId || sendMessage.isPending) return;
    sendMessage.mutate(content);
  };

  if (scenarios.isPending) return <LoadingState label="Loading simulation scenarios…" />;
  if (scenarios.isError) return <ErrorState message={scenarios.error.message} onRetry={() => scenarios.refetch()} />;
  if (!scenario) return <EmptyState title={`No ${roleplay ? "roleplay" : "interview"} is available`} description="Ask your manager to add a matching simulation scenario." />;

  return <div className="mx-auto max-w-4xl space-y-6"><PageHeader eyebrow={`${roleplay ? "AI roleplay" : "AI interview"} · ${scenario.type.toLowerCase()}`} title={scenario.title} description={roleplay ? "Run a realistic conversation. Your buyer adapts to every response." : "Explain your thinking out loud and receive an evidence-based evaluation."} action={sessionId ? <Button variant="secondary" onClick={() => complete.mutate()} disabled={complete.isPending || !messages.length}>{complete.isPending ? "Evaluating…" : "Complete session"}</Button> : undefined} />
    {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
    {!sessionId ? <Card className="text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-violet-100 text-violet-700"><Sparkles size={20} /></span><h2 className="mt-4 text-lg font-bold">{scenario.title}</h2><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">Start when you are ready. The AI response and final evaluation will be generated by the SalesReady API.</p><Button className="mt-6" onClick={() => start.mutate()} disabled={start.isPending}>{start.isPending ? "Starting…" : "Start session"}</Button></Card> :
    <Card className="p-0 overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-violet-600 text-white"><Sparkles size={18} /></span><div><p className="text-sm font-bold">SalesReady AI coach</p><p className="flex items-center gap-1 text-xs text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" />Live session</p></div></div><Badge tone="neutral"><Clock3 size={13} /> Active</Badge></div>
      <div className="min-h-105 space-y-5 bg-slate-50/60 p-5 sm:p-8">{messages.length === 0 && <p className="mx-auto max-w-md pt-28 text-center text-sm text-slate-500">Begin the conversation with your opening response.</p>}{messages.filter(message => message.role !== "SYSTEM").map(message => <div key={message.id} className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "USER" ? "rounded-br-md bg-violet-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"}`}>{message.content}</div></div>)}</div>
      <div className="border-t border-slate-100 p-4"><div className="flex gap-2"><textarea value={draft} disabled={sendMessage.isPending || complete.isPending} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={2} placeholder="Type your response…" className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100" /><Button onClick={send} disabled={!draft.trim() || sendMessage.isPending || complete.isPending} aria-label="Send response">{sendMessage.isPending ? <Clock3 className="animate-spin" size={17} /> : <Send size={17} />}</Button></div><p className="mt-2 text-xs text-slate-400">Press Enter to send · Complete the session when you are ready for evaluation</p></div></Card>}</div>;
}

function Feedback({ sessionId }: { sessionId?: string }) {
  const evaluationQuery = useQuery({
    queryKey: ["simulation-evaluation", sessionId],
    enabled: Boolean(sessionId),
    retry: false,
    queryFn: (): SimulationEvaluation | null => {
      const stored = sessionStorage.getItem(`simulation-evaluation:${sessionId}`);
      try {
        const parsed = simulationEvaluationSchema.safeParse(stored ? JSON.parse(stored) : null);
        return parsed.success ? parsed.data : null;
      } catch {
        sessionStorage.removeItem(`simulation-evaluation:${sessionId}`);
        return null;
      }
    },
  });

  if (sessionId && evaluationQuery.isPending) return <LoadingState label="Loading your evaluation…" />;
  const evaluation = evaluationQuery.data;
  if (!evaluation) return <EmptyState title="Evaluation not found" description="Complete a simulation in this browser session to view its feedback." action={<Link href="/rep/roleplay"><Button>Start a roleplay</Button></Link>} />;

  const passed = evaluation.score >= 75;
  return <div className="space-y-8"><PageHeader eyebrow="Session feedback" title={passed ? "Simulation passed" : "Keep practicing"} description="This evaluation was generated from your completed conversation." action={<Badge tone={passed ? "green" : "amber"}><CheckCircle2 size={14} />{passed ? "Passed" : "Coaching needed"}</Badge>} />
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]"><Card className="text-center"><div className="mx-auto grid size-28 place-items-center rounded-full bg-violet-50"><div><p className="text-4xl font-bold text-violet-700">{Math.round(evaluation.score)}</p><p className="text-xs text-violet-600">out of 100</p></div></div><h2 className="mt-5 font-bold">{passed ? "Ready with coaching" : "Practice recommended"}</h2><div className="mt-6 space-y-4 text-left">{Object.entries(evaluation.skillScores).map(([skill, score]) => <Progress key={skill} label={skill.replace(/([A-Z])/g, " $1").replace(/^./, value => value.toUpperCase())} value={score} />)}</div></Card>
      <Card><div className="flex gap-3"><Target className="shrink-0 text-amber-500" /><div><h2 className="font-bold">Coach feedback</h2><ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">{evaluation.feedback.map(item => <li key={item}>{item}</li>)}</ul></div></div></Card></div></div>;
}

function ProgressPage() {
  return <div className="space-y-8"><PageHeader eyebrow="My progress" title="You’re 72% of the way to certification" description="Every score reflects demonstrated knowledge and skill—not just course completion." />
    <div className="grid gap-4 sm:grid-cols-3"><Card><Trophy className="text-violet-600" /><p className="mt-4 text-3xl font-bold">88%</p><p className="text-sm text-slate-500">Readiness score</p></Card><Card><Flame className="text-orange-500" /><p className="mt-4 text-3xl font-bold">8 days</p><p className="text-sm text-slate-500">Current streak</p></Card><Card><Clock3 className="text-blue-500" /><p className="mt-4 text-3xl font-bold">4.8h</p><p className="text-sm text-slate-500">Focused practice</p></Card></div>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><Card><h2 className="font-bold">15-day journey</h2><div className="mt-5 grid gap-2 sm:grid-cols-3">{programDays.map(day => <div key={day.day} className={`rounded-xl border p-3 ${day.day < 4 ? "border-emerald-100 bg-emerald-50" : day.day === 4 ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200"}`}><p className="text-xs font-bold text-slate-400">DAY {day.day}</p><p className="mt-1 text-xs font-semibold text-slate-700">{day.title}</p></div>)}</div></Card><Card><h2 className="font-bold">Skill readiness</h2><div className="mt-5 space-y-5">{reportSkills.slice(0,4).map(skill => <Progress key={skill.label} label={skill.label} value={skill.value} />)}</div></Card></div></div>;
}

export function RepScreen({ slug, sessionId }: { slug?: string[]; sessionId?: string }) {
  const page = slug?.[0] ?? "home";
  if (page === "learn") return <Learn />;
  if (page === "assessment") return <Assessment />;
  if (page === "interview") return <Conversation />;
  if (page === "roleplay") return <Conversation roleplay />;
  if (page === "feedback") return <Feedback sessionId={sessionId} />;
  if (page === "progress") return <ProgressPage />;
  return <Home />;
}
