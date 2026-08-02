"use client";

import { api } from "@/services/api";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function enablePushNotifications() {
  if (!isPushSupported()) {
    throw new Error("Les notifications push ne sont pas supportees par ce navigateur.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Autorisation de notifications refusee.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  const { public_key } = await api.pushPublicKey();
  if (!public_key) {
    throw new Error("Cle publique VAPID manquante cote backend.");
  }

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await api.subscribePush({ ...existing.toJSON(), content_encoding: "aes128gcm" });
    return existing;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(public_key),
  });
  await api.subscribePush({ ...subscription.toJSON(), content_encoding: "aes128gcm" });

  return subscription;
}

export async function disablePushNotifications() {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await api.unsubscribePush(subscription.endpoint);
  await subscription.unsubscribe();
}
