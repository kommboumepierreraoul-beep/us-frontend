"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Crown,
  CalendarDays,
  HelpCircle,
  HeartHandshake,
  Heart,
  LogOut,
  MessageCircle,
  Settings,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { api, clearSession, getToken } from "@/services/api";
import { BrandMark } from "@/components/ui/brand";
import { IconButton } from "@/components/ui/primitives";
import { PushPermissionPrompt } from "@/components/app/push-permission";

const primaryNavItems = [
  { href: "/dashboard/discovery", label: "Decouvrir", icon: Sparkles },
  { href: "/dashboard/likes", label: "Likes", icon: Heart },
  { href: "/dashboard/matches", label: "Matches", icon: HeartHandshake },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/profile", label: "Profil", icon: UserRound },
];

const desktopNavItems = [
  ...primaryNavItems,
  { href: "/dashboard/events", label: "Evenements", icon: CalendarDays },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/premium", label: "Premium", icon: Crown },
  { href: "/dashboard/settings", label: "Parametres", icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = typeof window === "undefined" ? true : Boolean(getToken());
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const refreshCounts = () => Promise.all([
      api.unreadNotifications().then((res) => setUnreadNotifications(res.count)).catch(() => undefined),
      api.unreadMessages().then((res) => setUnreadMessages(res.count)).catch(() => undefined),
    ]);
    refreshCounts();
    const timer = window.setInterval(refreshCounts, 15000);
    return () => window.clearInterval(timer);
  }, [router]);

  async function logout() {
    await api.logout().catch(() => undefined);
    clearSession();
    router.replace("/login");
  }

  if (!hasToken) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">Chargement de votre espace US...</main>;
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#100c1a]/70 px-3 py-3 backdrop-blur-2xl sm:px-5 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandMark compact />
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
            </div>
            <div className="relative">
              <IconButton label="Profil et menu" onClick={() => setProfileMenuOpen((open) => !open)}>
                <UserRound size={18} />
              </IconButton>
              {profileMenuOpen ? (
                <div className="absolute right-0 top-13 z-50 w-[calc(100vw-2rem)] max-w-64 rounded-[22px] border border-white/10 bg-[#1b1424]/95 p-2 shadow-2xl backdrop-blur-xl">
                  <Link onClick={() => setProfileMenuOpen(false)} href="/dashboard/profile" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white hover:bg-white/10"><UserRound size={17} /> Mon profil</Link>
                  <Link onClick={() => setProfileMenuOpen(false)} href="/dashboard/settings" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white hover:bg-white/10"><Settings size={17} /> Parametres</Link>
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
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] flex-col justify-between rounded-[24px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl lg:flex">
          <nav className="space-y-2">
            {desktopNavItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active ? "bg-[var(--primary)] text-white shadow-[0_0_18px_rgba(215,38,61,0.28)]" : "text-[var(--muted)] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={19} /> {item.label}
                  {item.href === "/dashboard/messages" && unreadMessages > 0 ? <span className="ml-auto rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs text-white">{unreadMessages}</span> : null}
                </Link>
              );
            })}
          </nav>
          <Link href="/dashboard/premium" className="rounded-[20px] border border-[#e9c349]/20 bg-[#e9c349]/10 p-4 text-sm text-[#ffe088]">
            <Crown className="mb-3" size={22} />
            <b>Club prive US</b>
            <span className="mt-1 block text-xs leading-5 text-[#e9c349]/80">Boosts, Super Likes et visibilite avancee.</span>
          </Link>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around rounded-t-[24px] border-t border-white/10 bg-[#221d2d]/85 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-2xl lg:hidden">
        {primaryNavItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={item.href}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${active ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}
              aria-label={item.label}
            >
              <Icon size={21} />
              {item.href === "/dashboard/messages" && unreadMessages > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--primary)] px-1 text-center text-[10px] font-black text-white">{unreadMessages}</span> : null}
            </Link>
          );
        })}
      </nav>
      <PushPermissionPrompt />
    </div>
  );
}
