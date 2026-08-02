"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Activity, AlertTriangle, BadgeCheck, Ban, BarChart3, Bell, CalendarDays, CheckCircle2, CreditCard, Crown, Headphones, ImagePlus, LayoutDashboard, Lock, MapPin, MessageSquare, RefreshCw, Search, ShieldCheck, Ticket, Users, XCircle } from "lucide-react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { api, ApiError, clearSession } from "@/services/api";
import type { AdminBreakdownItem, AdminEventRow, AdminMessageRow, AdminOverview, AdminPaymentRow, AdminReportRow, AdminSeriesPoint, AdminSupportTicketRow, AdminUserRow, AdminVerificationRow } from "@/types/api";
import { Badge, Button, EmptyState, Field, Notice, Select, Spinner, TextArea, TextInput, Toggle } from "@/components/ui/primitives";

type AdminSection = "overview" | "users" | "reports" | "payments" | "messages" | "events" | "support" | "verifications" | "certifications";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);
let zoomRegistered = false;

function useChartZoom() {
  useEffect(() => {
    if (zoomRegistered) return;
    import("chartjs-plugin-zoom").then((module) => {
      ChartJS.register(module.default);
      zoomRegistered = true;
    }).catch(() => undefined);
  }, []);
}

const chartColors = ["#f472b6", "#d4af37", "#38bdf8", "#22c55e", "#fb7185", "#a78bfa"];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: { display: false },
    zoom: {
      pan: { enabled: true, mode: "x" as const },
      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" as const },
    },
    tooltip: {
      backgroundColor: "rgba(21,16,31,.96)",
      borderColor: "rgba(255,255,255,.12)",
      borderWidth: 1,
      titleColor: "#fff",
      bodyColor: "#d8cfdf",
      padding: 12,
    },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,.06)" }, ticks: { color: "#9f93aa" } },
    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,.08)" }, ticks: { color: "#9f93aa", precision: 0 } },
  },
};

const sections: Array<{ key: AdminSection; label: string; icon: typeof LayoutDashboard; href: string }> = [
  { key: "overview", label: "Vue globale", icon: LayoutDashboard, href: "/admin" },
  { key: "users", label: "Comptes", icon: Users, href: "/admin/users" },
  { key: "reports", label: "Signalements", icon: AlertTriangle, href: "/admin/reports" },
  { key: "payments", label: "Paiements", icon: CreditCard, href: "/admin/payments" },
  { key: "messages", label: "Messages", icon: MessageSquare, href: "/admin/messages" },
  { key: "events", label: "Evenements", icon: CalendarDays, href: "/admin/events" },
  { key: "support", label: "Support", icon: Headphones, href: "/admin/support" },
  { key: "verifications", label: "Verifications", icon: ShieldCheck, href: "/admin/verifications" },
  { key: "certifications", label: "Certifications", icon: Crown, href: "/admin/certifications" },
];

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Action impossible pour le moment.";
}

function money(cents = 0, currency = "XAF") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function date(value?: string | null) {
  if (!value) return "Non renseigne";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function tone(status?: string): "neutral" | "gold" | "success" | "danger" | "primary" {
  if (["active", "approved", "confirmed", "resolved"].includes(status ?? "")) return "success";
  if (["pending", "reviewing", "paused"].includes(status ?? "")) return "gold";
  if (["suspended", "banned", "rejected", "failed", "open"].includes(status ?? "")) return "danger";
  return "neutral";
}

function AdminFrame({ section, children }: { section: AdminSection; children: ReactNode }) {
  const router = useRouter();
  useChartZoom();
  const [pendingActions, setPendingActions] = useState<Record<string, number>>({});
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pendingTotal = Object.values(pendingActions).reduce((sum, value) => sum + value, 0);

  useEffect(() => {
    function refreshAdminCounts() {
      api.adminOverview()
        .then((overview) => setPendingActions(overview.system?.pending_actions ?? {}))
        .catch(() => undefined);
      api.unreadNotifications()
        .then((res) => setUnreadNotifications(res.count))
        .catch(() => undefined);
    }

    refreshAdminCounts();
    const timer = window.setInterval(refreshAdminCounts, 20000);
    return () => window.clearInterval(timer);
  }, []);

  async function logout() {
    await api.logout().catch(() => undefined);
    clearSession();
    router.push("/login");
  }

  function sectionCount(key: AdminSection) {
    if (key === "reports") return pendingActions.reports ?? 0;
    if (key === "payments") return pendingActions.payments ?? 0;
    if (key === "support") return pendingActions.support ?? 0;
    if (key === "verifications") return pendingActions.verifications ?? 0;
    if (key === "certifications") return pendingActions.certifications ?? 0;
    return 0;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1500px] gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-0 z-40 border-b border-white/10 bg-[#15101f]/95 p-3 backdrop-blur-2xl lg:static lg:border-b-0 lg:border-r lg:p-4">
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-2 py-2 lg:py-3">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl primary-gradient">
              <ShieldCheck size={22} />
              {pendingTotal > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#d4af37] px-1 text-center text-[10px] font-black text-[#1b1424]">{pendingTotal}</span> : null}
            </div>
            <div>
              <p className="text-sm font-black">US Admin</p>
              <p className="text-xs text-[var(--muted)]">{pendingTotal} action(s) en attente</p>
            </div>
          </Link>
          <Link href="/dashboard/notifications" className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 lg:mt-4">
            <span className="flex items-center gap-3"><Bell size={18} /> Notifications admin</span>
            {unreadNotifications > 0 ? <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-black text-white">{unreadNotifications}</span> : null}
          </Link>
          <nav className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:mt-5 lg:grid lg:grid-cols-1 lg:overflow-visible lg:px-0 lg:pb-0">
            {sections.map((item) => {
              const Icon = item.icon;
              const active = item.key === section;
              const count = sectionCount(item.key);
              return (
                <Link key={item.key} href={item.href} className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition lg:gap-3 ${active ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-white/8 hover:text-white"}`}>
                  <Icon size={18} /> <span className="whitespace-nowrap">{item.label}</span>
                  {count > 0 ? <span className="ml-auto rounded-full bg-[#d4af37] px-2 py-0.5 text-xs font-black text-[#1b1424]">{count}</span> : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:mt-5 lg:grid-cols-1">
            <Link href="/dashboard/discovery" className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-white">Retour app</Link>
            <button type="button" onClick={logout} className="rounded-2xl bg-white/5 px-4 py-3 text-left text-sm font-bold text-[#ffb4ab]">Deconnexion</button>
          </div>
        </aside>
        <section className="min-w-0 overflow-hidden p-3 sm:p-6 lg:p-8">{children}</section>
      </div>
    </main>
  );
}

function AdminHeader({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mb-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">Administration</p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{body}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, hint }: { title: string; value: string | number; icon: ReactNode; hint?: string }) {
  return (
    <article className="glass rounded-[24px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">{title}</p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/8 text-[var(--gold)]">{icon}</div>
      </div>
      {hint ? <p className="mt-3 text-xs text-[var(--muted)]">{hint}</p> : null}
    </article>
  );
}

function LineChart({ title, data }: { title: string; data: AdminSeriesPoint[] }) {
  const chartData = {
    labels: data.map((item) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(item.date))),
    datasets: [{
      data: data.map((item) => item.value),
      borderColor: "#f472b6",
      backgroundColor: "rgba(244,114,182,.18)",
      pointBackgroundColor: "#f9a8d4",
      pointBorderColor: "#fff",
      pointHoverRadius: 6,
      borderWidth: 3,
      fill: true,
      tension: 0.38,
    }],
  };

  return (
    <article className="glass rounded-[20px] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black text-white">{title}</h3>
        <Badge tone="primary">{data.reduce((sum, item) => sum + item.value, 0)} total</Badge>
      </div>
      <div className="h-56"><Line data={chartData} options={chartOptions} /></div>
    </article>
  );
}

function Breakdown({ title, items }: { title: string; items: AdminBreakdownItem[] }) {
  const chartData = {
    labels: items.map((item) => item.label),
    datasets: [{
      data: items.map((item) => item.value),
      backgroundColor: items.map((_, index) => chartColors[index % chartColors.length]),
      borderColor: "rgba(255,255,255,.12)",
      borderWidth: 1,
      borderRadius: 8,
    }],
  };

  return (
    <article className="glass rounded-[20px] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-black text-white">{title}</h3>
        <Badge>{items.reduce((sum, item) => sum + item.value, 0)}</Badge>
      </div>
      <div className="h-56"><Bar data={chartData} options={chartOptions} /></div>
    </article>
  );
}

function DonutChart({ title, items }: { title: string; items: AdminBreakdownItem[] }) {
  const chartData = {
    labels: items.map((item) => item.label),
    datasets: [{
      data: items.map((item) => item.value),
      backgroundColor: items.map((_, index) => chartColors[index % chartColors.length]),
      borderColor: "rgba(21,16,31,.95)",
      borderWidth: 3,
    }],
  };

  return (
    <article className="glass rounded-[20px] p-5">
      <h3 className="font-black text-white">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
        <div className="h-44"><Doughnut data={chartData} options={{ ...chartOptions, cutout: "68%", scales: undefined }} /></div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-[var(--muted)]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{item.label}</span>
              <b>{item.value}</b>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function SystemStatus({ overview }: { overview: AdminOverview }) {
  const system = overview.system;
  if (!system) return null;
  const pendingTotal = Object.values(system.pending_actions ?? {}).reduce((sum, value) => sum + value, 0);
  const pendingLinks = [
    { label: "Verifications", value: system.pending_actions?.verifications ?? 0, href: "/admin/verifications", icon: ShieldCheck },
    { label: "Certifications", value: system.pending_actions?.certifications ?? 0, href: "/admin/certifications", icon: Crown },
    { label: "Signalements", value: system.pending_actions?.reports ?? 0, href: "/admin/reports", icon: AlertTriangle },
    { label: "Support", value: system.pending_actions?.support ?? 0, href: "/admin/support", icon: Headphones },
    { label: "Paiements", value: system.pending_actions?.payments ?? 0, href: "/admin/payments", icon: CreditCard },
  ];

  return (
    <article className="glass rounded-[20px] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">Etat du systeme</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">API, base de donnees, actions en attente et utilisateurs recemment actifs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={system.api === "ok" ? "success" : "danger"}>API {system.api}</Badge>
          <Badge tone={system.database === "ok" ? "success" : "danger"}>DB {system.database}</Badge>
          <Badge tone={pendingTotal ? "gold" : "success"}>{pendingTotal} action(s)</Badge>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Environnement" value={system.environment} />
        <Info label="Heure serveur" value={date(system.server_time)} />
        <Info label="Users en ligne" value={system.online_users} />
        <Info label="Paiements pending" value={system.pending_actions?.payments ?? 0} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {pendingLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              <span className="flex items-center gap-3"><Icon size={18} className="text-[var(--gold)]" /> {item.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-black ${item.value ? "bg-[#d4af37] text-[#1b1424]" : "bg-white/10 text-[var(--muted)]"}`}>{item.value}</span>
            </Link>
          );
        })}
      </div>
    </article>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-28 animate-pulse rounded-[28px] bg-white/8" />
      <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-[24px] bg-white/8" />)}</div>
      <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-[24px] bg-white/8" />)}</div>
    </div>
  );
}

function OverviewView() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  function load(showLoading = true) {
    if (showLoading) setLoading(true);
    api.adminOverview().then(setOverview).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }

  useEffect(() => {
    api.adminOverview().then(setOverview).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminFrame section="overview"><AdminSkeleton /></AdminFrame>;
  if (!overview) return <AdminFrame section="overview"><Notice kind="error">{notice}</Notice></AdminFrame>;

  const kpi = overview.kpis;
  return (
    <AdminFrame section="overview">
      <AdminHeader title="Centre de controle" body="Suivi global des comptes, profils, matchs, messages, paiements, signalements et verifications." action={<Button variant="secondary" onClick={load}><RefreshCw size={18} /> Actualiser</Button>} />
      {notice ? <Notice kind="error">{notice}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Utilisateurs" value={kpi.users} icon={<Users size={20} />} hint={`${kpi.active_users} actifs`} />
        <MetricCard title="Profils complets" value={kpi.complete_profiles} icon={<BadgeCheck size={20} />} hint={`${kpi.profiles} profils au total`} />
        <MetricCard title="Score moderation" value={kpi.open_reports} icon={<AlertTriangle size={20} />} hint="Signalements ouverts" />
        <MetricCard title="Revenu confirme" value={money(kpi.revenue_cents)} icon={<CreditCard size={20} />} hint={`${kpi.active_subscriptions} abonnements actifs`} />
        <MetricCard title="Matches" value={kpi.matches} icon={<Activity size={20} />} />
        <MetricCard title="Conversations" value={kpi.conversations} icon={<MessageSquare size={20} />} />
        <MetricCard title="Messages" value={kpi.messages} icon={<BarChart3 size={20} />} />
        <MetricCard title="Verifications en attente" value={kpi.pending_verifications} icon={<ShieldCheck size={20} />} />
        <MetricCard title="Certifications a valider" value={kpi.pending_certifications ?? 0} icon={<Crown size={20} />} hint="Profils a 100%" />
      </div>
      <div className="mt-5">
        <SystemStatus overview={overview} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <LineChart title="Inscriptions" data={overview.series.users ?? []} />
        <LineChart title="Messages" data={overview.series.messages ?? []} />
        <LineChart title="Matches" data={overview.series.matches ?? []} />
        <LineChart title="Paiements confirmes" data={overview.series.payments ?? []} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <DonutChart title="Comptes par statut" items={overview.breakdowns.users_by_status ?? []} />
        <Breakdown title="Paiements par statut" items={overview.breakdowns.payments_by_status ?? []} />
        <DonutChart title="Messages par type" items={overview.breakdowns.messages_by_type ?? []} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SmallList title="Derniers utilisateurs" items={overview.latest.users.map((item) => `${item.name ?? item.email} · ${item.certification_score}%`)} />
        <SmallList title="Derniers signalements" items={overview.latest.reports.map((item) => `${item.category} · ${item.reported_user ?? item.target_type}`)} />
        <SmallList title="Derniers paiements" items={overview.latest.payments.map((item) => `${item.user ?? "Compte"} · ${money(item.amount_cents, item.currency)}`)} />
      </div>
    </AdminFrame>
  );
}

function SmallList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="glass rounded-[24px] p-4">
      <h3 className="font-black text-white">{title}</h3>
      <div className="mt-4 space-y-2">
        {items.length ? items.map((item) => <p key={item} className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-[var(--muted)]">{item}</p>) : <p className="text-sm text-[var(--muted)]">Aucune donnee.</p>}
      </div>
    </article>
  );
}

function UsersView() {
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [active, setActive] = useState<AdminUserRow | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  function load(showLoading = true) {
    if (showLoading) setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    api.adminUsers(params.toString()).then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }

  useEffect(() => {
    api.adminUsers().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  async function updateStatus(user: AdminUserRow, nextStatus: "active" | "paused" | "suspended" | "banned") {
    const updated = await api.adminUpdateUserStatus(user.id, { status: nextStatus, reason }).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (updated) {
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setActive((current) => current?.id === updated.id ? { ...current, ...updated } : current);
      setNotice("Compte mis a jour et notification envoyee.");
    }
  }

  return (
    <AdminFrame section="users">
      <AdminHeader title="Gestion des comptes" body="Recherche, suivi de profil, score de certification, blocage, suspension et reactivation." />
      <form onSubmit={(event) => { event.preventDefault(); load(); }} className="glass mb-5 grid gap-3 rounded-[24px] p-4 md:grid-cols-[1fr_220px_auto]">
        <Field label="Recherche"><TextInput value={q} onChange={(event) => setQ(event.target.value)} placeholder="Email, nom, prenom..." /></Field>
        <Field label="Statut"><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tous</option><option value="active">Actif</option><option value="paused">Pause</option><option value="suspended">Suspendu</option><option value="banned">Bloque</option></Select></Field>
        <Button type="submit"><Search size={18} /> Filtrer</Button>
      </form>
      {notice ? <div className="mb-4"><Notice kind={notice.includes("jour") ? "success" : "error"}>{notice}</Notice></div> : null}
      {loading ? <Spinner /> : (
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="glass overflow-hidden rounded-[24px]">
            {items.length === 0 ? <EmptyState title="Aucun compte trouve." body="Ajustez la recherche ou les filtres." /> : (
              <>
                <div className="hidden grid-cols-[minmax(260px,1.4fr)_120px_140px_120px_120px] gap-3 border-b border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.05em] text-[var(--muted)] xl:grid">
                  <span>Utilisateur</span><span>Statut</span><span>Certification</span><span>Photos</span><span>Reports</span>
                </div>
                <div className="divide-y divide-white/10">
                  {items.map((user) => (
                    <button key={user.id} type="button" onClick={() => setActive(user)} className={`grid w-full gap-3 px-4 py-4 text-left transition xl:grid-cols-[minmax(260px,1.4fr)_120px_140px_120px_120px] xl:items-center ${active?.id === user.id ? "bg-[var(--primary)]/18" : "hover:bg-white/6"}`}>
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-sm font-black text-white">{(user.name ?? user.email).slice(0, 1).toUpperCase()}</span>
                        <span className="min-w-0">
                          <b className="block truncate text-white">{user.name ?? "Sans nom"}</b>
                          <small className="block truncate text-[var(--muted)]">{user.email}</small>
                        </span>
                      </span>
                      <span><Badge tone={tone(user.status)}>{user.status}</Badge></span>
                      <span className="min-w-0">
                        <span className="flex items-center justify-between text-xs font-bold text-[var(--muted)]"><span>{user.certification_score}%</span><span>{user.certification_status ?? "score"}</span></span>
                        <span className="mt-1 block h-2 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#d4af37]" style={{ width: `${user.certification_score}%` }} /></span>
                      </span>
                      <span className="text-sm font-black text-white">{user.photos_count}</span>
                      <span className={`text-sm font-black ${user.reports_count > 0 ? "text-[#ffb4ab]" : "text-white"}`}>{user.reports_count}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
          <aside className="glass h-max rounded-[24px] p-5">
            {active ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white">{(active.name ?? active.email).slice(0, 1).toUpperCase()}</div>
                  <div className="min-w-0 flex-1"><h2 className="truncate text-xl font-black">{active.name ?? active.email}</h2><p className="truncate text-xs text-[var(--muted)]">{active.email}</p><p className="mt-1 text-xs text-[var(--muted)]">Derniere activite: {date(active.last_seen_at)}</p></div>
                  <Badge tone={tone(active.status)}>{active.status}</Badge>
                </div>
                <Score label="Certification" value={active.certification_score} />
                <Score label="Profil" value={active.profile_completion} />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Info label="Photos" value={active.photos_count} />
                  <Info label="Signalements" value={active.reports_count} />
                  <Info label="Genre" value={active.gender ?? "-"} />
                  <Info label="Universite" value={active.university ?? "-"} />
                </div>
                <Field label="Message de moderation"><TextInput value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Raison envoyee au user..." /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => updateStatus(active, "active")}><CheckCircle2 size={18} /> Activer</Button>
                  <Button variant="secondary" onClick={() => updateStatus(active, "paused")}><Lock size={18} /> Pause</Button>
                  <Button variant="danger" onClick={() => updateStatus(active, "suspended")}><Ban size={18} /> Suspendre</Button>
                  <Button variant="danger" onClick={() => updateStatus(active, "banned")}><XCircle size={18} /> Bloquer</Button>
                </div>
              </div>
            ) : <EmptyState title="Selectionnez un compte" body="Cliquez sur un utilisateur pour voir le score et appliquer une action." />}
          </aside>
        </div>
      )}
    </AdminFrame>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return <div><div className="flex justify-between text-xs font-bold text-[var(--muted)]"><span>{label}</span><span>{value}%</span></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full primary-gradient" style={{ width: `${value}%` }} /></div></div>;
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-[var(--muted)]">{label}</p><b className="mt-1 block text-white">{value}</b></div>;
}

function DataPanel<T>({ rows, render, empty }: { rows: T[]; render: (item: T) => ReactNode; empty: string }) {
  if (!rows.length) return <EmptyState title={empty} body="Les donnees apparaitront quand la base en contiendra." />;
  return <div className="glass space-y-2 rounded-[24px] p-3">{rows.map(render)}</div>;
}

function ReportsView() {
  const [items, setItems] = useState<AdminReportRow[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminReports().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false)); }, []);

  async function update(item: AdminReportRow, status: "reviewing" | "resolved" | "dismissed") {
    const updated = await api.adminUpdateReport(item.id, { status, priority: item.priority }).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (updated) {
      setItems((current) => current.map((row) => row.id === updated.id ? updated : row));
      setNotice("Signalement mis a jour.");
    }
  }

  return (
    <AdminFrame section="reports">
      <AdminHeader title="Signalements et moderation" body="Tri par priorite, suivi du statut et fermeture des dossiers de securite." />
      {notice ? <div className="mb-4"><Notice kind={notice.includes("jour") ? "success" : "error"}>{notice}</Notice></div> : null}
      {loading ? <Spinner /> : <DataPanel rows={items} empty="Aucun signalement." render={(item) => (
        <article key={item.id} className="grid gap-3 rounded-2xl bg-white/5 p-4 lg:grid-cols-[1fr_180px_260px]">
          <div><div className="flex flex-wrap gap-2"><Badge tone={tone(item.status)}>{item.status}</Badge><Badge tone={item.priority >= 3 ? "danger" : "gold"}>P{item.priority}</Badge></div><h3 className="mt-3 font-black">{item.category}</h3><p className="mt-1 text-sm text-[var(--muted)]">{item.details ?? "Sans detail"}</p><p className="mt-2 text-xs text-[var(--muted)]">Cible: {item.reported_user ?? item.target_type} · {date(item.created_at)}</p></div>
          <div className="text-sm text-[var(--muted)]">Reporter: <b className="text-white">{item.reporter ?? "-"}</b></div>
          <div className="grid grid-cols-3 gap-2"><Button variant="secondary" onClick={() => update(item, "reviewing")}>Revue</Button><Button variant="secondary" onClick={() => update(item, "resolved")}>Resolu</Button><Button variant="danger" onClick={() => update(item, "dismissed")}>Ignorer</Button></div>
        </article>
      )} />}
    </AdminFrame>
  );
}

function PaymentsView() {
  const [items, setItems] = useState<AdminPaymentRow[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminPayments().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false)); }, []);
  const total = useMemo(() => items.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + item.amount_cents, 0), [items]);

  return (
    <AdminFrame section="payments">
      <AdminHeader title="Paiements et abonnements" body="Suivi des transactions, revenus confirmes, plans et statuts de paiement." action={<Badge tone="success">{money(total)}</Badge>} />
      {notice ? <Notice kind="error">{notice}</Notice> : null}
      {loading ? <Spinner /> : <DataPanel rows={items} empty="Aucun paiement." render={(item) => (
        <article key={item.id} className="grid gap-3 rounded-2xl bg-white/5 p-4 md:grid-cols-[1fr_160px_160px_120px]">
          <div><b>{item.user ?? `User #${item.user_id}`}</b><p className="mt-1 text-xs text-[var(--muted)]">{item.plan ?? "Plan inconnu"} · {item.phone ?? "-"}</p></div>
          <b>{money(item.amount_cents, item.currency)}</b>
          <Badge tone={tone(item.status)}>{item.status}</Badge>
          <p className="text-xs text-[var(--muted)]">{date(item.confirmed_at ?? item.created_at)}</p>
        </article>
      )} />}
    </AdminFrame>
  );
}

function MessagesView() {
  const [items, setItems] = useState<AdminMessageRow[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminMessages().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false)); }, []);

  return (
    <AdminFrame section="messages">
      <AdminHeader title="Usage messages" body="Frequence d'usage, types de messages, et contenus signales pour moderation." />
      {notice ? <Notice kind="error">{notice}</Notice> : null}
      {loading ? <Spinner /> : <DataPanel rows={items} empty="Aucun message." render={(item) => (
        <article key={item.id} className="grid gap-3 rounded-2xl bg-white/5 p-4 lg:grid-cols-[1fr_120px_140px_140px]">
          <div><b>{item.sender ?? `User #${item.sender_id}`}</b><p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{item.body ?? "Message vide"}</p></div>
          <Badge tone="primary">{item.type}</Badge>
          <Badge tone={item.reports_count ? "danger" : "neutral"}>{item.reports_count} report</Badge>
          <p className="text-xs text-[var(--muted)]">{date(item.created_at)}</p>
        </article>
      )} />}
    </AdminFrame>
  );
}

function SupportView() {
  const [items, setItems] = useState<AdminSupportTicketRow[]>([]);
  const [active, setActive] = useState<AdminSupportTicketRow | null>(null);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.adminSupportTickets().then((res) => {
      setItems(res.data);
      setActive((current) => current ? res.data.find((item) => item.id === current.id) ?? res.data[0] ?? null : res.data[0] ?? null);
    }).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }

  useEffect(() => {
    api.adminSupportTickets().then((res) => {
      setItems(res.data);
      setActive(res.data[0] ?? null);
    }).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  async function update(item: AdminSupportTicketRow, status: AdminSupportTicketRow["status"], priority = item.priority) {
    const updated = await api.adminUpdateSupportTicket(item.id, { status, priority, admin_note: note || item.admin_note || undefined }).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (updated) {
      setItems((current) => current.map((row) => row.id === updated.id ? updated : row));
      setActive(updated);
      setNote("");
      setNotice("Ticket support mis a jour.");
    }
  }

  return (
    <AdminFrame section="support">
      <AdminHeader title="Support utilisateurs" body="Tickets d'aide, paiements, verification, bugs et dossiers de securite." action={<Button variant="secondary" onClick={load}><RefreshCw size={18} /> Actualiser</Button>} />
      {notice ? <div className="mb-4"><Notice kind={notice.includes("jour") ? "success" : "error"}>{notice}</Notice></div> : null}
      {loading ? <Spinner /> : items.length === 0 ? <EmptyState title="Aucun ticket support" body="Les demandes des utilisateurs apparaitront ici." /> : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="glass overflow-hidden rounded-[24px]">
            <div className="divide-y divide-white/10">
              {items.map((item) => (
                <button key={item.id} type="button" onClick={() => { setActive(item); setNote(item.admin_note ?? ""); }} className={`grid w-full gap-3 p-4 text-left transition lg:grid-cols-[1fr_130px_120px_130px] lg:items-center ${active?.id === item.id ? "bg-[var(--primary)]/18" : "hover:bg-white/6"}`}>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2"><Headphones size={18} className="text-[var(--gold)]" /><b className="truncate text-white">{item.subject}</b></span>
                    <small className="mt-1 block truncate text-[var(--muted)]">{item.user ?? "Utilisateur"} - {item.email ?? "email indisponible"}</small>
                  </span>
                  <Badge tone={tone(item.status)}>{item.status}</Badge>
                  <Badge tone={item.priority === "urgent" ? "danger" : item.priority === "high" ? "gold" : "neutral"}>{item.priority}</Badge>
                  <span className="text-xs text-[var(--muted)]">{date(item.created_at)}</span>
                </button>
              ))}
            </div>
          </section>
          <aside className="glass h-max rounded-[24px] p-5">
            {!active ? null : (
              <div>
                <div className="flex flex-wrap gap-2"><Badge tone={tone(active.status)}>{active.status}</Badge><Badge tone="primary">{active.category}</Badge></div>
                <h2 className="mt-4 text-xl font-black text-white">{active.subject}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{active.message}</p>
                {active.attachment_url ? <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-white/10"><Image src={active.attachment_url} alt="Piece jointe support" fill sizes="420px" className="object-cover" unoptimized /></div> : null}
                <Field label="Note de traitement"><TextArea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Reponse interne, action effectuee, contexte..." /></Field>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => update(active, "in_progress")}>En cours</Button>
                  <Button variant="secondary" onClick={() => update(active, "waiting_user")}>Attente user</Button>
                  <Button onClick={() => update(active, "resolved")}>Resolu</Button>
                  <Button variant="danger" onClick={() => update(active, "closed")}>Fermer</Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </AdminFrame>
  );
}

const emptyEventForm = {
  title: "",
  description: "",
  category: "campus",
  status: "open",
  venue: "",
  city: "",
  starts_at: "",
  capacity: "",
  cover_url: "",
  is_premium: false,
};

function EventsView() {
  const [items, setItems] = useState<AdminEventRow[]>([]);
  const [active, setActive] = useState<AdminEventRow | null>(null);
  const [form, setForm] = useState(emptyEventForm);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  function load() {
    setLoading(true);
    api.adminEvents().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }

  useEffect(() => {
    api.adminEvents().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  function edit(event: AdminEventRow) {
    setActive(event);
    setForm({
      title: event.title ?? "",
      description: event.description ?? "",
      category: event.category ?? "campus",
      status: event.status ?? "open",
      venue: event.venue ?? "",
      city: event.city ?? "",
      starts_at: event.starts_at ? event.starts_at.slice(0, 16) : "",
      capacity: event.capacity ? String(event.capacity) : "",
      cover_url: event.cover_url ?? "",
      is_premium: !!event.is_premium,
    });
    setCoverFile(null);
    setGalleryFiles([]);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setCoverPreview("");
    setGalleryPreviews([]);
  }

  function chooseCover(file: File | null) {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : "");
  }

  function chooseGallery(files: FileList | null) {
    galleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    const images = Array.from(files ?? []).slice(0, 8);
    setGalleryFiles(images);
    setGalleryPreviews(images.map((file) => URL.createObjectURL(file)));
  }

  function eventFormData() {
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "cover_url") return;
      if (key === "capacity") {
        if (value) body.set(key, String(value));
        return;
      }
      if (key === "starts_at") {
        if (value) body.set(key, String(value));
        return;
      }
      body.set(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value ?? ""));
    });
    if (coverFile) body.set("cover_image", coverFile);
    galleryFiles.forEach((file) => body.append("images[]", file));
    return body;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const payload = eventFormData();
    const saved = active
      ? await api.adminUpdateEvent(active.id, payload).catch((err) => { setNotice(errorMessage(err)); return null; })
      : await api.adminCreateEvent(payload).catch((err) => { setNotice(errorMessage(err)); return null; });
    if (saved) {
      setItems((current) => active ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setActive(saved);
      setNotice(active ? "Evenement mis a jour." : "Evenement cree.");
    }
    setSaving(false);
  }

  return (
    <AdminFrame section="events">
      <AdminHeader title="Gestion des evenements" body="Creation, programmation, statut, capacite et suivi des invitations." action={<Button variant="secondary" onClick={load}><RefreshCw size={18} /> Actualiser</Button>} />
      {notice ? <div className="mb-4"><Notice kind={notice.includes("jour") || notice.includes("cree") ? "success" : "error"}>{notice}</Notice></div> : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="glass overflow-hidden rounded-[24px]">
          {loading ? <div className="p-4"><Spinner /></div> : items.length === 0 ? <EmptyState title="Aucun evenement" body="Creez le premier evenement depuis le formulaire." /> : (
            <div className="divide-y divide-white/10">
              {items.map((item) => (
                <button key={item.id} type="button" onClick={() => edit(item)} className={`grid w-full gap-3 p-4 text-left transition lg:grid-cols-[1fr_140px_140px_120px] lg:items-center ${active?.id === item.id ? "bg-[var(--primary)]/18" : "hover:bg-white/6"}`}>
                  <span className="flex min-w-0 items-center gap-3"><span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10">{item.cover_url ? <Image src={item.cover_url} alt={item.title} fill sizes="64px" className="object-cover" /> : <span className="grid h-full place-items-center"><Ticket size={18} className="text-[var(--gold)]" /></span>}</span><span className="min-w-0"><span className="flex items-center gap-2"><Ticket size={18} className="text-[var(--gold)]" /><b className="truncate text-white">{item.title}</b></span><small className="mt-1 flex items-center gap-1 truncate text-[var(--muted)]"><MapPin size={13} /> {item.venue ?? "Lieu non renseigne"} - {item.city ?? "Ville"}</small></span></span>
                  <Badge tone={tone(item.status)}>{item.status}</Badge>
                  <span className="text-sm text-[var(--muted)]">{date(item.starts_at)}</span>
                  <span className="text-sm font-black text-white">{item.accepted_count ?? 0}/{item.capacity ?? "illimite"}</span>
                </button>
              ))}
            </div>
          )}
        </section>
        <form onSubmit={submit} className="glass h-max space-y-4 rounded-[24px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-xl font-black text-white">{active ? "Modifier" : "Nouvel evenement"}</h2><p className="mt-1 text-sm text-[var(--muted)]">Les champs alimentent directement la page events.</p></div>
            {active ? <Button variant="ghost" onClick={() => { setActive(null); setForm(emptyEventForm); }}>Nouveau</Button> : null}
          </div>
          <Field label="Titre"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
          <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Categorie"><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Statut"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="open">Open</option><option value="waitlist">Waitlist</option><option value="full">Full</option><option value="closed">Closed</option><option value="cancelled">Cancelled</option></Select></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Lieu"><TextInput value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Field>
            <Field label="Ville"><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date"><TextInput type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></Field>
            <Field label="Capacite"><TextInput type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/10">{coverPreview || active?.cover_url ? <Image src={coverPreview || active!.cover_url!} alt="Couverture evenement" fill sizes="160px" className="object-cover" unoptimized /> : <div className="grid h-full place-items-center text-[var(--muted)]"><ImagePlus size={28} /></div>}</div><Field label="Image de couverture locale"><TextInput type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => chooseCover(e.target.files?.[0] ?? null)} /></Field></div><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.05em] text-[var(--muted)]">Galerie evenement</p><span className="text-xs font-bold text-[var(--muted)]">{galleryFiles.length}/8 nouvelles</span></div>{(galleryPreviews.length || active?.images?.length) ? (<div className="mb-3 grid grid-cols-4 gap-2">{[...(active?.images?.map((image) => image.url) ?? []), ...galleryPreviews].slice(0, 8).map((url, index) => (<div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-xl bg-white/10"><Image src={url} alt={`Image evenement ${index + 1}`} fill sizes="80px" className="object-cover" unoptimized /></div>))}</div>) : null}<Field label="Ajouter des images"><TextInput type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => chooseGallery(e.target.files)} /></Field></div>
          <Toggle checked={form.is_premium} onChange={(checked) => setForm({ ...form, is_premium: checked })} label="Reserve premium" />
          <Button type="submit" disabled={saving} className="w-full">{saving ? "Enregistrement..." : active ? "Mettre a jour" : "Creer evenement"}</Button>
        </form>
      </div>
    </AdminFrame>
  );
}

function VerificationsView() {
  const [items, setItems] = useState<AdminVerificationRow[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminVerifications().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false)); }, []);

  async function update(item: AdminVerificationRow, status: "approved" | "rejected") {
    const updated = await api.adminUpdateVerification(item.id, { status, rejection_reason: status === "rejected" ? "Image non conforme ou insuffisamment claire." : undefined }).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (updated) {
      setItems((current) => current.map((row) => row.id === updated.id ? { ...row, ...updated } : row));
      setNotice("Verification mise a jour et utilisateur notifie.");
    }
  }

  return (
    <AdminFrame section="verifications">
      <AdminHeader title="Verifications de profil" body="Validation selfie/document et impact direct sur le score de certification." />
      {notice ? <div className="mb-4"><Notice kind={notice.includes("jour") ? "success" : "error"}>{notice}</Notice></div> : null}
      {loading ? <Spinner /> : <DataPanel rows={items} empty="Aucune verification." render={(item) => (
        <article key={item.id} className={`grid gap-4 rounded-2xl border p-4 md:grid-cols-[112px_1fr_240px] ${item.status === "approved" ? "border-[#22c55e]/25 bg-[#22c55e]/8" : "border-white/10 bg-white/5"}`}>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
            {item.image_url ? <Image src={item.image_url} alt={`Verification ${item.id}`} fill sizes="112px" className="object-cover" /> : <div className="grid h-full place-items-center"><ShieldCheck className="text-white/30" /></div>}
          </div>
          <div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge tone={tone(item.status)}>{item.status}</Badge><Badge>{item.type}</Badge>{item.status === "approved" ? <Badge tone="success">Verrouille</Badge> : null}</div><h3 className="mt-3 truncate text-lg font-black text-white">{item.user ?? `User #${item.user_id}`}</h3><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.rejection_reason ?? `Envoye le ${date(item.created_at)}`}</p></div>
          <div className="grid content-center gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            <Button variant="secondary" disabled={item.status === "approved"} onClick={() => update(item, "approved")}><CheckCircle2 size={18} /> Approuver</Button>
            <Button variant="danger" disabled={item.status === "approved"} onClick={() => update(item, "rejected")}><XCircle size={18} /> Refuser</Button>
          </div>
        </article>
      )} />}
    </AdminFrame>
  );
}

function CertificationsView() {
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.adminCertifications().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }

  useEffect(() => {
    api.adminCertifications().then((res) => setItems(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  async function certify(user: AdminUserRow) {
    const updated = await api.adminCertifyUser(user.id, reason || "Certification manuelle admin").catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (updated) {
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice("Profil certifie, badge dore active et utilisateur notifie.");
    }
  }

  return (
    <AdminFrame section="certifications">
      <AdminHeader title="Certifications" body="Validation finale des profils qui atteignent 100% de score de certification." action={<Button variant="secondary" onClick={load}><RefreshCw size={18} /> Actualiser</Button>} />
      {notice ? <div className="mb-4"><Notice kind={notice.includes("certifie") ? "success" : "error"}>{notice}</Notice></div> : null}
      <div className="glass mb-5 rounded-[20px] p-4">
        <Field label="Note admin"><TextInput value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motif ou note interne de certification..." /></Field>
      </div>
      {loading ? <Spinner /> : <DataPanel rows={items} empty="Aucun profil eligible." render={(user) => (
        <article key={user.id} className="grid gap-4 rounded-2xl bg-white/5 p-4 lg:grid-cols-[1fr_180px_220px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={user.certification_status === "certified" ? "gold" : "primary"}>{user.certification_status ?? "eligible"}</Badge>
              <Badge tone={tone(user.status)}>{user.status}</Badge>
            </div>
            <h3 className="mt-3 text-lg font-black text-white">{user.name ?? user.email}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{user.email} · {user.university ?? "Universite non renseignee"}</p>
          </div>
          <div className="space-y-2">
            <Score label="Certification" value={user.certification_score} />
            <Score label="Profil" value={user.profile_completion} />
          </div>
          <div className="grid gap-2">
            <Button variant={user.certification_status === "certified" ? "premium" : "secondary"} disabled={user.certification_status === "certified"} onClick={() => certify(user)}>
              <Crown size={18} /> {user.certification_status === "certified" ? "Deja certifie" : "Certifier"}
            </Button>
            <Link href={`/admin/users`} className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-bold text-white">Voir comptes</Link>
          </div>
        </article>
      )} />}
    </AdminFrame>
  );
}

export function AdminView({ section = "overview" }: { section?: string }) {
  const current = sections.some((item) => item.key === section) ? section as AdminSection : "overview";
  if (current === "users") return <UsersView />;
  if (current === "reports") return <ReportsView />;
  if (current === "payments") return <PaymentsView />;
  if (current === "messages") return <MessagesView />;
  if (current === "events") return <EventsView />;
  if (current === "support") return <SupportView />;
  if (current === "verifications") return <VerificationsView />;
  if (current === "certifications") return <CertificationsView />;
  return <OverviewView />;
}

export function AdminRouteView() {
  const params = useParams<{ section?: string }>();
  return <AdminView section={params.section} />;
}

