"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BadgeCheck,
  Crown,
  CalendarDays,
  HelpCircle,
  HeartHandshake,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { api, clearSession, getToken } from "@/services/api";
import { BrandMark } from "@/components/ui/brand";
import { IconButton } from "@/components/ui/primitives";
import { PushPermissionPrompt } from "@/components/app/push-permission";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Sparkles;
  badge?: "messages" | "notifications";
  premium?: boolean;
};

const primaryNavItems: NavItem[] = [
  { href: "/dashboard/discovery", label: "Decouvrir", icon: Sparkles },
  { href: "/dashboard/likes", label: "Likes", icon: Heart },
  { href: "/dashboard/matches", label: "Matches", icon: HeartHandshake },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle, badge: "messages" },
  { href: "/dashboard/profile", label: "Profil", icon: UserRound },
];

const mobileBottomItems: NavItem[] = [
  { href: "/dashboard/discovery", label: "Decouvrir", icon: Sparkles },
  { href: "/dashboard/events", label: "Evenements", icon: CalendarDays },
  { href: "/dashboard/matches", label: "Matches", icon: HeartHandshake },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle, badge: "messages" },
  { href: "/dashboard/profile", label: "Profil", icon: UserRound },
];

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  { label: "Rencontres", items: primaryNavItems.slice(0, 4) },
  {
    label: "Activite",
    items: [
      { href: "/dashboard/events", label: "Evenements", icon: CalendarDays },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
      { href: "/dashboard/filters", label: "Filtres", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/dashboard/profile", label: "Profil", icon: UserRound },
      { href: "/dashboard/verification", label: "Verification", icon: ShieldCheck },
      { href: "/dashboard/certified", label: "Certification", icon: BadgeCheck },
      { href: "/dashboard/settings", label: "Parametres", icon: Settings },
      { href: "/dashboard/support/contact", label: "Support", icon: HelpCircle },
    ],
  },
];

const mobileQuickItems: NavItem[] = [
  { href: "/dashboard/filters", label: "Filtres", icon: SlidersHorizontal },
  { href: "/dashboard/likes", label: "Likes", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
  { href: "/dashboard/premium", label: "Premium", icon: Crown, premium: true },
  { href: "/dashboard/settings", label: "Parametres", icon: Settings },
  { href: "/dashboard/support/contact", label: "Support", icon: HelpCircle },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard/discovery") return pathname === "/dashboard" || pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentNavLabel(pathname: string) {
  const allItems = [...mobileBottomItems, ...primaryNavItems, ...mobileQuickItems, ...navGroups.flatMap((group) => group.items)];
  return allItems.find((item) => isNavActive(pathname, item.href))?.label ?? "Dashboard";
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = typeof window === "undefined" ? true : Boolean(getToken());
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPendingCount, setAdminPendingCount] = useState(0);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const refreshCounts = () => Promise.all([
      api.unreadNotifications().then((res) => setUnreadNotifications(res.count)).catch(() => undefined),
      api.unreadMessages().then((res) => setUnreadMessages(res.count)).catch(() => undefined),
    ]);
    api.me().then((user) => {
      const allowed = Boolean(user.is_admin);
      setIsAdmin(allowed);
      if (allowed) {
        api.adminOverview()
          .then((overview) => setAdminPendingCount(Object.values(overview.system?.pending_actions ?? {}).reduce((sum, value) => sum + value, 0)))
          .catch(() => undefined);
      }
    }).catch(() => undefined);
    refreshCounts();
    const timer = window.setInterval(refreshCounts, 15000);
    return () => window.clearInterval(timer);
  }, [router]);

  async function logout() {
    await api.logout().catch(() => undefined);
    clearSession();
    router.replace("/login");
  }

  function badgeFor(item: NavItem) {
    if (item.badge === "messages") return unreadMessages;
    if (item.badge === "notifications") return unreadNotifications;
    return 0;
  }

  function NavLink({ item, compact = false }: { item: NavItem; compact?: boolean }) {
    const active = isNavActive(pathname, item.href);
    const Icon = item.icon;
    const badge = badgeFor(item);
    return (
      <Link
        href={item.href}
        onClick={() => {
          setProfileMenuOpen(false);
          setMobileMoreOpen(false);
        }}
        className={`relative flex items-center gap-3 rounded-2xl text-sm font-bold transition ${
          compact ? "px-3 py-3" : "px-4 py-3"
        } ${
          active
            ? item.premium ? "premium-gradient text-white shadow-[0_0_18px_rgba(212,175,55,0.18)]" : "bg-[var(--primary)] text-white shadow-[0_0_18px_rgba(215,38,61,0.28)]"
            : "text-[var(--muted)] hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={compact ? 18 : 19} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {badge > 0 ? <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-black text-white">{badge}</span> : null}
      </Link>
    );
  }

  const currentLabel = currentNavLabel(pathname);

  if (!hasToken) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">Chargement de votre espace US...</main>;
  }

  return (
    <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+6.25rem)] lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#100c1a]/70 px-3 py-3 backdrop-blur-2xl sm:px-5 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/dashboard/discovery" className="flex min-w-0 items-center gap-3">
            <BrandMark compact hideTextOnMobile />
            <span className="min-w-0 lg:hidden">
              <span className="block truncate text-sm font-black text-white">{currentLabel}</span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--muted)]">Dashboard</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications">
              <IconButton label="Notifications" className="relative">
                <Bell size={18} />
                {unreadNotifications > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--primary)] px-1 text-center text-[10px] font-black text-white">{unreadNotifications}</span> : null}
              </IconButton>
            </Link>
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/dashboard/filters" className="glass inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-white">
                <SlidersHorizontal size={18} /> Filtres
              </Link>
              <Link href="/dashboard/premium" className="premium-gradient inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-white">
                <Crown size={18} /> Premium
              </Link>
              {isAdmin ? (
                <Link href="/admin" className="glass relative inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-white">
                  <LayoutDashboard size={18} /> Admin
                  {adminPendingCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#d4af37] px-1 text-center text-[10px] font-black text-[#1b1424]">{adminPendingCount}</span> : null}
                </Link>
              ) : null}
            </div>
            <div className="relative">
              <IconButton label="Profil et menu" onClick={() => { setProfileMenuOpen((open) => !open); setMobileMoreOpen(false); }}>
                <UserRound size={18} />
              </IconButton>
              {profileMenuOpen ? (
                <div className="absolute right-0 top-13 z-50 w-[calc(100vw-2rem)] max-w-64 rounded-[22px] border border-white/10 bg-[#1b1424]/95 p-2 shadow-2xl backdrop-blur-xl">
                  <Link onClick={() => setProfileMenuOpen(false)} href="/dashboard/profile" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white hover:bg-white/10"><UserRound size={17} /> Mon profil</Link>
                  <Link onClick={() => setProfileMenuOpen(false)} href="/dashboard/settings" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white hover:bg-white/10"><Settings size={17} /> Parametres</Link>
                  {isAdmin ? <Link onClick={() => setProfileMenuOpen(false)} href="/admin" className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white hover:bg-white/10"><span className="flex items-center gap-3"><LayoutDashboard size={17} /> Administration</span>{adminPendingCount > 0 ? <span className="rounded-full bg-[#d4af37] px-2 py-0.5 text-xs font-black text-[#1b1424]">{adminPendingCount}</span> : null}</Link> : null}
                  <Link onClick={() => setProfileMenuOpen(false)} href="/dashboard/support/contact" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white hover:bg-white/10"><HelpCircle size={17} /> Support</Link>
                  <Link onClick={() => setProfileMenuOpen(false)} href="/dashboard/verification" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white hover:bg-white/10"><Sparkles size={17} /> Verification</Link>
                  <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-[#ffb4ab] hover:bg-white/10"><LogOut size={17} /> Deconnexion</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-5 sm:py-6 lg:grid-cols-[240px_1fr]">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] flex-col justify-between overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl lg:flex">
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
            <nav className="space-y-5">
              {navGroups.map((group) => (
                <section key={group.label}>
                  <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">{group.label}</p>
                  <div className="space-y-1.5">
                    {group.items.map((item) => <NavLink key={item.href} item={item} />)}
                  </div>
                </section>
              ))}
            </nav>
          </div>
          <div className="mt-4 space-y-2">
            {isAdmin ? (
            <Link href="/admin" onClick={() => setMobileMoreOpen(false)} className="relative flex items-center gap-3 rounded-[20px] border border-[#d4af37]/25 bg-[#d4af37]/10 p-4 text-sm font-bold text-[#ffe6a3]">
                <LayoutDashboard size={20} />
                <span className="flex-1">Console admin</span>
                {adminPendingCount > 0 ? <span className="rounded-full bg-[#d4af37] px-2 py-0.5 text-xs font-black text-[#1b1424]">{adminPendingCount}</span> : null}
              </Link>
            ) : null}
            <Link href="/dashboard/premium" className="block rounded-[20px] border border-[#e9c349]/20 bg-[#e9c349]/10 p-4 text-sm text-[#ffe088]">
              <Crown className="mb-3" size={22} />
              <b>Club prive US</b>
              <span className="mt-1 block text-xs leading-5 text-[#e9c349]/80">Boosts, Super Likes et visibilite avancee.</span>
            </Link>
          </div>
        </aside>

        <main className="min-w-0 overflow-hidden">{children}</main>
      </div>

      {mobileMoreOpen ? (
        <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-50 rounded-[24px] border border-white/10 bg-[#1b1424]/96 p-3 shadow-2xl backdrop-blur-2xl lg:hidden">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">Menu</p>
            {isAdmin ? (
              <Link href="/admin" onClick={() => setMobileMoreOpen(false)} className="relative rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-black text-[#ffe6a3]">
                Admin {adminPendingCount > 0 ? `(${adminPendingCount})` : ""}
              </Link>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mobileQuickItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item.href);
              const badge = badgeFor(item);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMoreOpen(false)} className={`relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold ${active ? "bg-[var(--primary)] text-white" : item.premium ? "bg-[#d4af37]/12 text-[#ffe6a3]" : "bg-white/6 text-white"}`}>
                  <Icon size={18} /> <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {badge > 0 ? <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-black text-white">{badge}</span> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around rounded-t-[24px] border-t border-white/10 bg-[#221d2d]/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-2xl lg:hidden">
        {mobileBottomItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={item.href}
              onClick={() => setMobileMoreOpen(false)}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${active ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}
              aria-label={item.label}
            >
              <Icon size={21} />
              {item.href === "/dashboard/messages" && unreadMessages > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--primary)] px-1 text-center text-[10px] font-black text-white">{unreadMessages}</span> : null}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => { setMobileMoreOpen((open) => !open); setProfileMenuOpen(false); }}
          className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${mobileMoreOpen ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}
          aria-label="Plus"
        >
          <Menu size={21} />
        </button>
      </nav>
      <PushPermissionPrompt />
    </div>
  );
}
