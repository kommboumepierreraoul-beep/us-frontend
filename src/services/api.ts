"use client";

import type {
  ApiEnvelope,
  AdminMessageRow,
  AdminEventRow,
  AdminOverview,
  AdminPaymentRow,
  AdminReportRow,
  AdminSupportTicketRow,
  AdminUserRow,
  AdminVerificationRow,
  AuthResponse,
  Conversation,
  DiscoveryPreference,
  EventInvitation,
  EventItem,
  Match,
  LikeItem,
  Message,
  NotificationItem,
  Paginated,
  Plan,
  Profile,
  Photo,
  SupportTicket,
  University,
  User,
  VerificationRequest,
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "us_auth_token";
const USER_KEY = "us_auth_user";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  idempotencyKey?: string;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function storeSession(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  let requestBody: BodyInit | undefined;
  headers.set("Accept", "application/json");

  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  if (options.body !== undefined) {
    requestBody = isFormData ? (options.body as FormData) : JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: requestBody,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? "Le serveur US ne repond pas correctement.",
      response.status,
      payload?.errors,
    );
  }

  return payload.data;
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: { ...body, device_name: "frontend-web" },
    }),
  register: (body: {
    email: string;
    password: string;
    first_name: string;
    birth_date: string;
    gender: string;
    university_id?: number | null;
    looking_for?: string | null;
    bio?: string | null;
    study_level?: string | null;
    languages?: string[];
    intentions?: string[];
    interests?: string[];
    photo_url?: string | null;
    min_age?: number;
    max_age?: number;
    radius_km?: number;
    preferred_gender?: string | null;
    same_university_only?: boolean;
  }) =>
    request<AuthResponse>("/v1/auth/register", {
      method: "POST",
      body: { ...body, device_name: "frontend-web" },
    }),
  google: (id_token: string) =>
    request<AuthResponse>("/v1/auth/google", {
      method: "POST",
      body: { id_token, device_name: "frontend-web-google" },
    }),
  forgotPassword: (email: string) =>
    request<{ email: string; expires_in_minutes: number; otp_debug?: { code: string } | null }>(
      "/v1/auth/forgot-password",
      { method: "POST", body: { email } },
    ),
  resetPassword: (body: {
    email: string;
    code: string;
    password: string;
    password_confirmation: string;
  }) => request<null>("/v1/auth/reset-password", { method: "POST", body }),
  verifyEmail: (code: string) =>
    request<User>("/v1/auth/email/verify", { method: "POST", body: { code } }),
  resendEmailOtp: () =>
    request<{ email: string; expires_in_minutes: number; otp_debug?: { code: string } | null }>(
      "/v1/auth/email/otp",
      { method: "POST" },
    ),
  me: () => request<User>("/v1/auth/me"),
  updateStatus: (status: "active" | "paused" | "deleted") =>
    request<User>("/v1/auth/status", { method: "PATCH", body: { status } }),
  logout: () => request<null>("/v1/auth/logout", { method: "POST" }),
  universities: (q = "") =>
    request<Paginated<University>>(`/v1/universities?per_page=80${q ? `&q=${encodeURIComponent(q)}` : ""}`),
  profile: () => request<Profile>("/v1/profile"),
  updateProfile: (body: Partial<Profile> & { university_id?: number | null }) =>
    request<Profile>("/v1/profile", { method: "PATCH", body }),
  addPhoto: (body: { url: string; is_primary?: boolean; sort_order?: number }) =>
    request<Photo>("/v1/profile/photos", { method: "POST", body }),
  uploadPhoto: (file: File, options: { is_primary?: boolean; sort_order?: number } = {}) => {
    const body = new FormData();
    body.set("photo", file);
    if (options.is_primary !== undefined) body.set("is_primary", options.is_primary ? "1" : "0");
    if (options.sort_order !== undefined) body.set("sort_order", String(options.sort_order));
    return request<Photo>("/v1/profile/photos", { method: "POST", body });
  },
  uploadPhotos: (files: File[], options: { is_primary?: boolean; sort_order?: number } = {}) => {
    const body = new FormData();
    files.forEach((file) => body.append("photos[]", file));
    if (options.is_primary !== undefined) body.set("is_primary", options.is_primary ? "1" : "0");
    if (options.sort_order !== undefined) body.set("sort_order", String(options.sort_order));
    return request<Photo[]>("/v1/profile/photos", { method: "POST", body });
  },
  updateLocation: (body: { latitude: number; longitude: number; accuracy_meters?: number }) =>
    request<null>("/v1/profile/location", { method: "PUT", body }),
  updatePreferences: (body: DiscoveryPreference) =>
    request<DiscoveryPreference>("/v1/profile/preferences", { method: "PUT", body }),
  discovery: (query = "") => request<Paginated<Profile>>(`/v1/discovery${query ? `?${query}` : ""}`),
  likesList: (direction: "received" | "sent" = "received") => request<Paginated<LikeItem>>(`/v1/likes?direction=${direction}`),
  like: (receiver_id: number, type: "like" | "super_like" = "like") =>
    request<{ like: unknown; match: Match | null }>("/v1/likes", {
      method: "POST",
      body: { receiver_id, type },
    }),
  matches: () => request<Paginated<Match>>("/v1/matches"),
  unmatch: (matchId: number) => request<null>(`/v1/matches/${matchId}`, { method: "DELETE" }),
  conversations: () => request<Paginated<Conversation>>("/v1/conversations"),
  unreadMessages: () => request<{ count: number }>("/v1/conversations/unread-count"),
  messages: (conversationId: number) =>
    request<Paginated<Message>>(`/v1/conversations/${conversationId}/messages`),
  sendMessage: (
    conversationId: number,
    payload: { type?: "text" | "image" | "sticker"; body?: string | null; attachment_url?: string | null; sticker_code?: string | null; reply_to_message_id?: number | null },
  ) =>
    request<Message>(`/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      body: payload,
    }),
  markConversationRead: (conversationId: number) =>
    request<null>(`/v1/conversations/${conversationId}/read`, { method: "POST" }),
  notifications: () => request<Paginated<NotificationItem>>("/v1/notifications"),
  unreadNotifications: () => request<{ count: number }>("/v1/notifications/unread-count"),
  readNotification: (id: number) =>
    request<NotificationItem>(`/v1/notifications/${id}/read`, { method: "POST" }),
  readAllNotifications: () => request<null>("/v1/notifications/read-all", { method: "POST" }),
  pushPublicKey: () => request<{ public_key: string | null }>("/v1/push/public-key"),
  subscribePush: (subscription: PushSubscriptionJSON & { content_encoding?: string }) =>
    request<unknown>("/v1/push/subscriptions", { method: "POST", body: subscription }),
  unsubscribePush: (endpoint: string) =>
    request<null>("/v1/push/subscriptions", { method: "DELETE", body: { endpoint } }),
  testPush: () => request<NotificationItem>("/v1/push/test", { method: "POST" }),
  verificationStatus: () => request<VerificationRequest[]>("/v1/verification/status"),
  submitSelfie: (file: File) => {
    const body = new FormData();
    body.set("selfie", file);
    body.set("consent", "1");
    return request<VerificationRequest>("/v1/verification/selfie", { method: "POST", body });
  },
  plans: () => request<Plan[]>("/v1/premium/plans"),
  subscription: () => request<unknown>("/v1/premium/subscription"),
  events: () => request<Paginated<EventItem>>("/v1/events"),
  event: (eventId: number) => request<EventItem>(`/v1/events/${eventId}`),
  eventInvitations: () => request<Paginated<EventInvitation>>("/v1/event-invitations"),
  respondInvitation: (invitationId: number, status: "accepted" | "declined") =>
    request<EventInvitation>(`/v1/event-invitations/${invitationId}`, {
      method: "PATCH",
      body: { status },
    }),
  ticket: (invitationId: number) =>
    request<EventInvitation>(`/v1/event-invitations/${invitationId}/ticket`),
  paymentIntent: (plan_id: number, phone: string) =>
    request<unknown>("/v1/payments/mobile-money/intents", {
      method: "POST",
      body: { plan_id, phone },
      idempotencyKey: crypto.randomUUID(),
    }),
  supportTickets: () => request<Paginated<SupportTicket>>("/v1/support/tickets"),
  createSupportTicket: (body: FormData) =>
    request<SupportTicket>("/v1/support/tickets", { method: "POST", body }),
  adminOverview: () => request<AdminOverview>("/v1/admin/overview"),
  adminUsers: (query = "") => request<Paginated<AdminUserRow>>(`/v1/admin/users${query ? `?${query}` : ""}`),
  adminUser: (id: number) => request<AdminUserRow>(`/v1/admin/users/${id}`),
  adminUpdateUserStatus: (id: number, body: { status: "active" | "paused" | "suspended" | "banned"; reason?: string }) =>
    request<AdminUserRow>(`/v1/admin/users/${id}/status`, { method: "PATCH", body }),
  adminReports: (query = "") => request<Paginated<AdminReportRow>>(`/v1/admin/reports${query ? `?${query}` : ""}`),
  adminUpdateReport: (id: number, body: { status: "open" | "reviewing" | "resolved" | "dismissed"; priority?: number; reason?: string }) =>
    request<AdminReportRow>(`/v1/admin/reports/${id}`, { method: "PATCH", body }),
  adminPayments: (query = "") => request<Paginated<AdminPaymentRow>>(`/v1/admin/payments${query ? `?${query}` : ""}`),
  adminMessages: (query = "") => request<Paginated<AdminMessageRow>>(`/v1/admin/messages${query ? `?${query}` : ""}`),
  adminEvents: (query = "") => request<Paginated<AdminEventRow>>(`/v1/admin/events${query ? `?${query}` : ""}`),
  adminCreateEvent: (body: Partial<AdminEventRow> | FormData) =>
    request<AdminEventRow>("/v1/admin/events", { method: "POST", body }),
  adminUpdateEvent: (id: number, body: Partial<AdminEventRow> | FormData) =>
    request<AdminEventRow>(`/v1/admin/events/${id}`, { method: body instanceof FormData ? "POST" : "PATCH", body }),
  adminVerifications: (query = "") => request<Paginated<AdminVerificationRow>>(`/v1/admin/verifications${query ? `?${query}` : ""}`),
  adminUpdateVerification: (id: number, body: { status: "approved" | "rejected"; rejection_reason?: string }) =>
    request<AdminVerificationRow>(`/v1/admin/verifications/${id}`, { method: "PATCH", body }),
  adminCertifications: (query = "") => request<Paginated<AdminUserRow>>(`/v1/admin/certifications${query ? `?${query}` : ""}`),
  adminCertifyUser: (id: number, reason?: string) =>
    request<AdminUserRow>(`/v1/admin/users/${id}/certify`, { method: "POST", body: { reason } }),
  adminSupportTickets: (query = "") => request<Paginated<AdminSupportTicketRow>>(`/v1/admin/support${query ? `?${query}` : ""}`),
  adminUpdateSupportTicket: (id: number, body: { status?: string; priority?: string; admin_note?: string }) =>
    request<AdminSupportTicketRow>(`/v1/admin/support/${id}`, { method: "PATCH", body }),
};
