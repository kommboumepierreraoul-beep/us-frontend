export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
};

export type Paginated<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

export type University = {
  id: number;
  name: string;
  acronym?: string | null;
  city?: string | null;
  type?: string | null;
};

export type Photo = {
  id: number;
  url: string;
  is_primary?: boolean;
  moderation_status?: string;
};

export type Profile = {
  id: number;
  user_id: number;
  first_name: string;
  age?: number | null;
  gender?: string | null;
  looking_for?: string | null;
  bio?: string | null;
  study_level?: string | null;
  languages?: string[];
  intentions?: string[];
  visibility?: "visible" | "hidden";
  completion_score?: number;
  university?: University | null;
  interests?: string[];
  photos?: Photo[];
};

export type User = {
  id: number;
  name: string;
  email: string;
  status?: string;
  email_verified_at?: string | null;
  profile?: Profile | null;
  photos?: Photo[];
  discovery_preference?: DiscoveryPreference;
};

export type AuthResponse = {
  user: User;
  token: string;
  email_verification_required?: boolean;
  requires_profile?: boolean;
  otp_debug?: { code: string } | null;
};

export type DiscoveryPreference = {
  min_age?: number | null;
  max_age?: number | null;
  radius_km?: number | null;
  gender?: string | null;
  same_university_only?: boolean;
};

export type Match = {
  id: number;
  user_one_id: number;
  user_two_id: number;
  status?: string;
  matched_at?: string;
  conversation?: Conversation | null;
  matched_user?: {
    id: number;
    name: string;
    status?: string;
    last_seen_at?: string | null;
    profile?: Profile | null;
  } | null;
  compatibility?: {
    shared_interests?: string[];
    shared_interests_count?: number;
    same_university?: boolean;
    score?: number;
    explanation?: string;
  };
};

export type Conversation = {
  id: number;
  match_id?: number | null;
  status: string;
  last_message_at?: string | null;
  unread_count?: number;
  latest_message?: Message | null;
  matched_user?: {
    id: number;
    name: string;
    profile?: Profile | null;
  } | null;
  participants?: { user_id: number; last_read_at?: string | null }[];
};

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  type: "text" | "image" | "sticker";
  body?: string | null;
  attachment_url?: string | null;
  sticker_code?: string | null;
  reply_to_message_id?: number | null;
  reply_to_message?: Pick<Message, "id" | "sender_id" | "type" | "body" | "attachment_url" | "sticker_code"> | null;
  read_at?: string | null;
  created_at?: string;
};

export type NotificationItem = {
  id: number;
  category: string;
  title: string;
  body?: string | null;
  read_at?: string | null;
  created_at?: string;
  data?: Record<string, unknown>;
  action_url?: string;
};

export type LikeItem = {
  id: number;
  sender_id: number;
  receiver_id: number;
  type: "like" | "super_like";
  status: string;
  created_at?: string;
  other_user?: {
    id: number;
    name: string;
    profile?: Profile | null;
  } | null;
};

export type Plan = {
  id: number;
  name: string;
  code?: string;
  price_cents: number;
  currency?: string;
  duration_days?: number;
  features?: string[];
  daily_likes?: number;
  super_likes?: number;
};

export type EventItem = {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  status: string;
  venue?: string | null;
  city?: string | null;
  starts_at?: string | null;
  capacity?: number | null;
  cover_url?: string | null;
  is_premium?: boolean;
  confirmed_count?: number;
};

export type EventInvitation = {
  id: number;
  event_id: number;
  user_id: number;
  status: "pending" | "accepted" | "declined";
  ticket_code?: string | null;
  responded_at?: string | null;
  event?: EventItem;
};

export type VerificationRequest = {
  id: number;
  user_id: number;
  type: "selfie" | "identity" | "student";
  status: "pending" | "approved" | "rejected";
  image_url?: string;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
};
