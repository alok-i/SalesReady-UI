import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "purple" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
    purple: "bg-violet-50 text-violet-700 ring-violet-600/15",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const variants = {
    primary: "bg-violet-600 text-white shadow-sm hover:bg-violet-700",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)] ${className}`}>{children}</section>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-violet-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && <div className="mb-2 flex justify-between text-xs font-medium text-slate-500"><span>{label}</span><span>{value}%</span></div>}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading your workspace…" }: { label?: string }) {
  return <div className="grid min-h-64 place-items-center text-center"><div><LoaderCircle className="mx-auto mb-3 animate-spin text-violet-600" aria-hidden /><p className="text-sm font-medium text-slate-600">{label}</p></div></div>;
}

export function ErrorState({ message = "We couldn’t load this content.", onRetry }: { message?: string; onRetry?: () => void }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><AlertCircle className="mx-auto mb-3 text-red-600" aria-hidden /><h2 className="font-semibold text-red-950">{message}</h2><p className="mt-1 text-sm text-red-700">Check your connection and try again.</p>{onRetry && <Button className="mt-4" onClick={onRetry}>Try again</Button>}</div>;
}

export function EmptyState({ title = "Nothing here yet", description = "New items will appear here when they’re available.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center"><Inbox className="mx-auto mb-3 text-slate-400" aria-hidden /><h2 className="font-semibold text-slate-800">{title}</h2><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}
