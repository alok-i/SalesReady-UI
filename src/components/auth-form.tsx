"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError, api } from "@/lib/api";
import { publicSessionSchema } from "@/lib/api-contracts";
import { Button } from "./ui";

const schema = z.object({
  name: z.string().min(2, "Enter your full name").optional(),
  email: z.email("Enter a valid work email"),
  password: z.string().min(8, "Use at least 8 characters"),
});
type Values = z.infer<typeof schema>;

export function AuthForm({ invite = false }: { invite?: boolean }) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: invite ? "Maya Chen" : undefined, email: invite ? "maya@acme.com" : "superadmin@salesready.ai", password: "DemoPass123!" } });
  const onSubmit = async (values: Values) => {
    if (invite) return;
    try {
      const session = await api.signin(
        { email: values.email, password: values.password },
        publicSessionSchema,
      );
      const isPlatformAdmin = Boolean(session.isPlatformAdmin ?? session.user.isPlatformAdmin);
      router.replace(isPlatformAdmin ? "/platform" : session.role === "REP" ? "/rep" : "/manager");
      router.refresh();
    } catch (error) {
      setError("root", {
        message: error instanceof ApiError ? error.message : "Unable to sign in. Please try again.",
      });
    }
  };
  return <div className="grid min-h-screen bg-white lg:grid-cols-2">
    <main className="flex items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md">
      <Link href="/" className="mb-12 flex items-center gap-2.5 text-xl font-bold"><span className="grid size-10 place-items-center rounded-xl bg-violet-600 text-white"><Sparkles size={19} fill="currentColor" /></span>SalesReady<span className="-ml-2.5 text-violet-600">AI</span></Link>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600">{invite ? "You’re invited" : "Welcome back"}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{invite ? "Join Acme’s sales team" : "Sign in to your workspace"}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{invite ? "Alex Morgan invited you to Enterprise AE readiness." : "Continue building a team that’s ready for every buyer conversation."}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">{invite && <Field label="Full name" error={errors.name?.message}><input {...register("name")} className="input" /></Field>}<Field label="Work email" error={errors.email?.message}><input type="email" {...register("email")} className="input" /></Field><Field label="Password" error={errors.password?.message}><input type="password" {...register("password")} className="input" /></Field>
        {errors.root?.message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.root.message}</p>}
        {!invite && <p className="text-right text-xs text-slate-400">Password recovery will be added in a later phase.</p>}<Button className="w-full" type="submit" disabled={isSubmitting || invite}>{isSubmitting ? "Opening workspace…" : invite ? "Invitation acceptance coming soon" : "Sign in"}<ArrowRight size={16} /></Button></form>
      <p className="mt-6 text-center text-xs text-slate-400">{invite ? "Invitation acceptance is outside the P0 integration." : "Try superadmin@salesready.ai, admin@example.com, or rep@example.com with DemoPass123!."}</p>
    </div></main>
    <aside className="hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute right-20 top-20 size-80 rounded-full bg-violet-600/20 blur-3xl" /><p className="relative text-sm font-semibold text-violet-300">Sales readiness, proven.</p><div className="relative max-w-lg"><blockquote className="text-3xl font-semibold leading-tight">“Our reps don’t just finish onboarding. They prove they can handle the moments that win deals.”</blockquote><p className="mt-5 text-sm text-slate-400">Elena Vasquez · VP Revenue Enablement</p><div className="mt-10 space-y-4">{["Grounded in your company truth", "Adaptive, realistic AI practice", "Evidence-based readiness scores"].map(x => <p className="flex items-center gap-3 text-sm" key={x}><CheckCircle2 size={18} className="text-violet-400" />{x}</p>)}</div></div><p className="relative text-xs text-slate-600">© 2026 SalesReadyAI</p></aside>
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-semibold text-slate-700">{label}</span><span className="mt-2 block">{children}</span>{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
