import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

export function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
  onClick,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "premium" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const variants = {
    primary: "primary-gradient text-white shadow-[0_12px_28px_rgba(215,38,61,0.26)]",
    premium: "premium-gradient text-white shadow-[0_12px_28px_rgba(212,175,55,0.18)]",
    secondary: "glass text-white hover:bg-white/10",
    ghost: "text-[var(--muted)] hover:bg-white/10",
    danger: "bg-white/10 text-[#ffb4ab] hover:bg-[#93000a]/40",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">{label}</span>
      <span className="glass flex min-h-[54px] items-center gap-3 rounded-2xl px-4 focus-within:border-[var(--primary-soft)]">
        {icon ? <span className="text-[var(--primary-soft)]">{icon}</span> : null}
        {children}
      </span>
    </label>
  );
}

export function IconButton({
  label,
  children,
  onClick,
  className = "",
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`glass inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white transition hover:bg-white/10 active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border-0 bg-transparent text-white outline-none placeholder:text-white/30 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full border-0 bg-[#1e1928] text-white outline-none ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full resize-none border-0 bg-transparent text-white outline-none placeholder:text-white/30 ${props.className ?? ""}`}
    />
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-[24px] p-8 text-center">
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageTitle({ eyebrow = "US Nous", title, body, action }: { eyebrow?: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h1>
        {body ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "success" | "danger" | "primary" }) {
  const styles = {
    neutral: "border-white/10 bg-white/8 text-[var(--muted)]",
    gold: "border-[#d4af37]/25 bg-[#d4af37]/10 text-[#ffe6a3]",
    success: "border-[#22c55e]/25 bg-[#22c55e]/10 text-[#bbf7d0]",
    danger: "border-[#dc2626]/25 bg-[#dc2626]/10 text-[#fecaca]",
    primary: "border-[#ec4899]/25 bg-[#ec4899]/10 text-[#ffd7e8]",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

export function ProgressBar({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full primary-gradient" style={{ width: `${normalized}%` }} />
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm font-bold text-white transition hover:bg-white/10"
    >
      <span>{label}</span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full border transition ${checked ? "border-[#d4af37]/60 bg-[#d4af37]/25" : "border-white/15 bg-white/10"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full transition ${checked ? "left-6 bg-[#d4af37]" : "left-1 bg-white/70"}`} />
      </span>
    </button>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: ReactNode }) {
  const styles = {
    info: "border-white/10 bg-white/5 text-[var(--muted)]",
    error: "border-[#ffb4ab]/25 bg-[#93000a]/20 text-[#ffdad6]",
    success: "border-[#e9c349]/25 bg-[#e9c349]/10 text-[#ffe088]",
  };
  return <div className={`rounded-2xl border p-3 text-sm ${styles[kind]}`}>{children}</div>;
}

export function Spinner({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--muted)]">
      <LoaderCircle className="animate-spin text-[var(--primary-soft)]" size={18} />
      {label}
    </div>
  );
}
