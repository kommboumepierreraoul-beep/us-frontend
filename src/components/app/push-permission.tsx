"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api, getToken } from "@/services/api";
import { enablePushNotifications, isPushSupported } from "@/services/push";
import { Button, Notice } from "@/components/ui/primitives";

const STORAGE_KEY = "us_push_prompt_dismissed";

export function PushPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken() || !isPushSupported()) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    if (Notification.permission === "default") {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  async function activate() {
    setLoading(true);
    setMessage("");
    try {
      await enablePushNotifications();
      await api.testPush().catch(() => undefined);
      setMessage("Notifications push activees.");
      window.setTimeout(() => setVisible(false), 1400);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Activation impossible.");
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-xl rounded-[24px] border border-white/10 bg-[#1b1424]/95 p-4 shadow-2xl backdrop-blur-xl lg:bottom-6">
      <button type="button" onClick={dismiss} className="absolute right-3 top-3 rounded-full p-2 text-[var(--muted)] hover:bg-white/10" aria-label="Fermer">
        <X size={16} />
      </button>
      <div className="flex gap-3 pr-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
          <Bell size={20} />
        </span>
        <div>
          <h2 className="font-black text-white">Activer les notifications</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Recevez automatiquement les nouveaux matchs, messages et alertes importantes US.</p>
          {message ? <div className="mt-3"><Notice kind={message.includes("activees") ? "success" : "error"}>{message}</Notice></div> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={activate} disabled={loading}>{loading ? "Activation..." : "Autoriser les notifications"}</Button>
            <Button variant="secondary" onClick={dismiss}>Plus tard</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
