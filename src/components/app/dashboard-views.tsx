"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  Check,
  Crown,
  Eye,
  GraduationCap,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Navigation,
  Reply,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Smile,
  Star,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError, getStoredUser } from "@/services/api";
import type { Conversation, DiscoveryPreference, LikeItem, Match, Message, NotificationItem, Photo, Plan, Profile, University } from "@/types/api";
import { Button, EmptyState, Field, Notice, Select, Spinner, TextArea, TextInput, Toggle } from "@/components/ui/primitives";
import {
  DiscoverySkeleton,
  LikesSkeleton,
  MatchesSkeleton,
  MessagesSkeleton,
  NotificationsSkeleton,
  PremiumSkeleton,
  ProfileSkeleton,
} from "@/components/ui/skeletons";

function PageHeader({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-4 sm:mb-6 sm:rounded-[24px] sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">US Nous</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">{title}</h1>
          {body ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{body}</p> : null}
        </div>
        {action ? <div className="shrink-0 [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">{action}</div> : null}
      </div>
    </div>
  );
}

function getPrimaryPhoto(profile: Profile) {
  const photos = getProfilePhotos(profile);
  return photos.find((photo) => photo.is_primary)?.url ?? photos[0]?.url ?? null;
}

function getProfilePhotos(profile: Profile) {
  return [...(profile.photos ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

const PROFILE_PHOTO_LIMIT = 10;

function VerifiedBadge({ profile, compact = false }: { profile?: Profile | null; compact?: boolean }) {
  if (profile?.is_certified) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-[#d4af37]/45 bg-[#d4af37]/20 font-black text-[#ffe088] shadow-[0_0_18px_rgba(212,175,55,.18)] ${compact ? "px-2 py-1 text-[10px]" : "px-3 py-1 text-xs"}`}>
        <Crown size={compact ? 13 : 15} /> Certifie
      </span>
    );
  }
  if (!profile?.is_verified) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/15 font-black text-[#ffe088] ${compact ? "px-2 py-1 text-[10px]" : "px-3 py-1 text-xs"}`}>
      <BadgeCheck size={compact ? 13 : 15} /> Verifie
    </span>
  );
}

function PhotoLightbox({ photos, index, name, onIndexChange, onClose }: { photos: Photo[]; index: number; name: string; onIndexChange: (index: number) => void; onClose: () => void }) {
  const current = photos[index];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/88 p-2 sm:p-4 backdrop-blur-xl">
      <button type="button" onClick={onClose} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4 sm:top-4" aria-label="Fermer l'image">
        <X size={22} />
      </button>
      {photos.length > 1 ? (
        <button type="button" onClick={() => onIndexChange(index === 0 ? photos.length - 1 : index - 1)} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12" aria-label="Image precedente">
          <ChevronLeft size={26} />
        </button>
      ) : null}
      <div className="relative h-[78dvh] w-full max-w-5xl overflow-hidden rounded-[22px] border border-white/10 bg-[#100c1a] sm:h-[82dvh] sm:rounded-[28px]">
        <Image src={current.url} alt={`${name} photo ${index + 1}`} fill sizes="100vw" className="object-contain" priority />
      </div>
      {photos.length > 1 ? (
        <button type="button" onClick={() => onIndexChange((index + 1) % photos.length)} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12" aria-label="Image suivante">
          <ChevronRight size={26} />
        </button>
      ) : null}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
        {index + 1}/{photos.length}
      </div>
    </div>
  );
}

function ProfilePhotoStrip({ profile, name, limit = PROFILE_PHOTO_LIMIT }: { profile: Profile; name: string; limit?: number }) {
  const photos = getProfilePhotos(profile);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (photos.length === 0) return null;
  const visiblePhotos = photos.slice(0, limit);

  return (
    <>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {visiblePhotos.map((photo, index) => (
        <button key={photo.id} type="button" onClick={() => setOpenIndex(index)} className="group relative aspect-square overflow-hidden rounded-2xl bg-white/10">
          <Image src={photo.url} alt={`${name} photo ${index + 1}`} fill sizes="96px" className="object-cover" />
          {photo.is_primary ? <span className="absolute left-1 top-1 rounded-full bg-black/45 px-1.5 py-0.5 text-[9px] font-black text-white">1</span> : null}
          <span className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex"><Maximize2 size={18} /></span>
        </button>
        ))}
      </div>
      {openIndex !== null ? <PhotoLightbox photos={visiblePhotos} index={openIndex} name={name} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} /> : null}
    </>
  );
}

function dataOf<T>(result: { data: T[] } | null | undefined) {
  return result?.data ?? [];
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Impossible de charger les donnees depuis la base.";
}

export function DiscoveryView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const current = profiles[index];
  const currentPhotos = current ? getProfilePhotos(current) : [];
  const activePhoto = currentPhotos[photoIndex]?.url ?? (current ? getPrimaryPhoto(current) : null);

  useEffect(() => {
    api.discovery()
      .then((res) => setProfiles(dataOf(res)))
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function react(type: "like" | "super_like" | "skip") {
    if (!current) return;
    if (type !== "skip") {
      const res = await api.like(current.user_id, type).catch((err) => {
        setNotice(errorMessage(err));
        return null;
      });
      if (res?.match) setNotice("Match cree. Vous pouvez demarrer la conversation.");
    }
    setPhotoIndex(0);
    setLightboxOpen(false);
    setOverviewOpen(false);
    setIndex((value) => Math.min(value + 1, profiles.length));
  }

  function previousPhoto() {
    if (currentPhotos.length < 2) return;
    setPhotoIndex((value) => (value === 0 ? currentPhotos.length - 1 : value - 1));
  }

  function nextPhoto() {
    if (currentPhotos.length < 2) return;
    setPhotoIndex((value) => (value + 1) % currentPhotos.length);
  }

  if (loading) return <DiscoverySkeleton />;

  return (
    <section>
      <PageHeader
        title="Decouverte"
        body="Des profils universitaires proches, sans jamais afficher leur position exacte."
        action={
          <Link href="/dashboard/filters" className="glass inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-white">
            <SlidersHorizontal size={18} /> Ajuster
          </Link>
        }
      />
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {!current ? (
        <EmptyState title="Aucun profil en base" body="La decouverte affichera les profils lorsque la base de donnees contiendra des candidats compatibles." action={<Link href="/dashboard/filters"><Button variant="secondary">Ouvrir les filtres</Button></Link>} />
      ) : (
        <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 xl:grid-cols-[1fr_320px]">
          <article className="relative min-h-[calc(100dvh-210px)] overflow-hidden rounded-[24px] border border-white/10 bg-[#221d2d] shadow-2xl sm:min-h-[620px] sm:rounded-[28px]">
            {activePhoto ? (
              <Image src={activePhoto} alt={current.first_name} fill sizes="(max-width: 1024px) 100vw, 700px" className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5"><Camera className="text-white/25" size={96} /></div>
            )}
            {activePhoto ? (
              <button type="button" onClick={() => setLightboxOpen(true)} className="absolute right-3 top-12 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 sm:right-4 sm:top-14 sm:h-11 sm:w-11" aria-label="Agrandir l'image">
                <Maximize2 size={20} />
              </button>
            ) : null}
            {currentPhotos.length > 1 ? (
              <>
                <button type="button" onClick={previousPhoto} className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 sm:left-4 sm:h-11 sm:w-11" aria-label="Photo precedente">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={nextPhoto} className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 sm:right-4 sm:h-11 sm:w-11" aria-label="Photo suivante">
                  <ChevronRight size={22} />
                </button>
                <div className="absolute inset-x-3 top-3 z-10 flex gap-1.5 sm:inset-x-4 sm:top-4">
                  {currentPhotos.map((photo, idx) => (
                    <button key={photo.id} type="button" onClick={() => setPhotoIndex(idx)} className={`h-1.5 flex-1 rounded-full ${idx === photoIndex ? "bg-white" : "bg-white/35"}`} aria-label={`Afficher photo ${idx + 1}`} />
                  ))}
                </div>
              </>
            ) : null}
            {lightboxOpen ? <PhotoLightbox photos={currentPhotos} index={photoIndex} name={current.first_name} onIndexChange={setPhotoIndex} onClose={() => setLightboxOpen(false)} /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#100c1a] via-[#100c1a]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 sm:space-y-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-[#ffe088]"><ShieldCheck size={15} /> Communaute universitaire</span>
                <span className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-[var(--secondary-soft)]"><MapPin size={15} /> Meme zone</span>
                <VerifiedBadge profile={current} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{current.first_name}, {current.age ?? "18+"}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                  <GraduationCap size={17} /> {current.university?.name ?? "Universite non renseignee"} · {current.study_level ?? "Niveau non renseigne"}
                </p>
                {current.bio ? <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-white/90 sm:mt-4 sm:text-base sm:leading-7">{current.bio}</p> : null}
              </div>
              <div className="flex max-h-20 flex-wrap gap-2 overflow-hidden sm:max-h-none">
                {(current.interests ?? []).map((interest) => (
                  <span key={interest} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">{interest}</span>
                ))}
              </div>
            </div>
          </article>
          <aside className="glass flex flex-col justify-between rounded-[24px] p-4 sm:rounded-[28px] sm:p-5">
            <div>
              <p className="text-lg font-black text-white">Completion</p>
              <div className="mt-4 rounded-2xl bg-white/8 p-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-[var(--muted)]">Score profil</span>
                  <b className="text-3xl text-white">{current.completion_score ?? 0}%</b>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[var(--gold)]" style={{ width: `${current.completion_score ?? 0}%` }} />
                </div>
              </div>
              <button type="button" onClick={() => setOverviewOpen((open) => !open)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-black text-white transition hover:bg-white/12">
                <Eye size={18} /> Vue generale du profil
              </button>
              {overviewOpen ? (
                <div className="mt-4 space-y-4 rounded-[24px] border border-white/10 bg-[#15101f]/70 p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">Bio</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{current.bio ?? "Bio non renseignee."}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">Recherche</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{current.looking_for ?? "Non renseigne"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">Interets</p>
                    <div className="mt-2 flex flex-wrap gap-2">{(current.interests ?? []).map((interest) => <span key={interest} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{interest}</span>)}</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">Photos</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{currentPhotos.length} photo(s) disponibles.</p>
                    <ProfilePhotoStrip profile={current} name={current.first_name} />
                  </div>
                </div>
              ) : null}
            </div>
            <div className="sticky bottom-0 z-10 mt-5 flex items-center justify-center gap-4 rounded-[24px] bg-[#15101f]/75 py-3 backdrop-blur-xl xl:static xl:bg-transparent xl:py-0">
              <button onClick={() => react("skip")} className="glass flex h-14 w-14 items-center justify-center rounded-full text-[var(--muted)]"><X size={26} /></button>
              <button onClick={() => react("super_like")} className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-[#241a00]"><Star size={28} fill="currentColor" /></button>
              <button onClick={() => react("like")} className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white"><Heart size={26} fill="currentColor" /></button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export function FiltersView() {
  const [form, setForm] = useState<DiscoveryPreference>({ min_age: 18, max_age: 35, radius_km: 25, gender: null, same_university_only: false });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const res = await api.updatePreferences(form).catch((err) => {
      setMessage(errorMessage(err));
      return null;
    });
    if (res) setMessage("Preferences de decouverte mises a jour.");
    setLoading(false);
  }

  return (
    <section>
      <PageHeader title="Filtres avances" body="Gardez une recherche proche du campus, sans exposer de coordonnees exactes." />
      <form onSubmit={submit} className="glass max-w-2xl space-y-4 rounded-[28px] p-5">
        {message ? <Notice kind={message.includes("jour") ? "success" : "error"}>{message}</Notice> : null}
        {loading ? <Spinner label="Enregistrement des preferences..." /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Age minimum"><TextInput type="number" min={18} value={form.min_age ?? ""} onChange={(e) => setForm({ ...form, min_age: Number(e.target.value) })} /></Field>
          <Field label="Age maximum"><TextInput type="number" min={18} value={form.max_age ?? ""} onChange={(e) => setForm({ ...form, max_age: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Rayon floute"><TextInput type="number" min={1} max={500} value={form.radius_km ?? ""} onChange={(e) => setForm({ ...form, radius_km: Number(e.target.value) })} /></Field>
        <Notice>Les profils affiches sont automatiquement du sexe oppose: hommes vers femmes, femmes vers hommes.</Notice>
        <Toggle checked={!!form.same_university_only} onChange={(checked) => setForm({ ...form, same_university_only: checked })} label="Meme universite uniquement" />
        <Button type="submit" disabled={loading}>Enregistrer les filtres</Button>
      </form>
    </section>
  );
}

export function LikesView() {
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [items, setItems] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.likesList(tab)
      .then((res) => setItems(dataOf(res)))
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <section>
      <PageHeader
        title="Likes"
        body="Suivez les profils qui vous apprecient et ceux que vous avez deja likes."
        action={<Link href="/dashboard/premium"><Button variant="premium"><Crown size={18} /> Voir qui vous aime</Button></Link>}
      />
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      <div className="mb-5 flex gap-2">
        <Button variant={tab === "received" ? "primary" : "secondary"} onClick={() => { setLoading(true); setTab("received"); }}>Recus</Button>
        <Button variant={tab === "sent" ? "primary" : "secondary"} onClick={() => { setLoading(true); setTab("sent"); }}>Envoyes</Button>
      </div>
      {loading ? <LikesSkeleton /> : items.length === 0 ? (
        <EmptyState title="Aucun like a afficher" body={tab === "received" ? "Les likes recus apparaitront ici." : "Les profils que vous aimez apparaitront ici."} action={<Link href="/dashboard/discovery"><Button>Continuer a decouvrir</Button></Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const profile = item.other_user?.profile;
            const photo = profile ? getPrimaryPhoto(profile) : null;
            return (
              <article key={item.id} className="glass overflow-hidden rounded-[24px]">
                <div className="relative h-72 bg-white/5">
                  {photo ? <Image src={photo} alt={profile?.first_name ?? "Profil"} fill sizes="320px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Camera className="text-white/25" size={64} /></div>}
                  <div className="absolute left-3 top-3 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-black text-white">{item.type === "super_like" ? "Super Like" : "Like"}</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-black text-white">{profile?.first_name ?? item.other_user?.name ?? "Profil"}, {profile?.age ?? "18+"}</h2>
                    <VerifiedBadge profile={profile} compact />
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{profile?.university?.name ?? "Universite non renseignee"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{(profile?.interests ?? []).slice(0, 3).map((interest) => <span key={interest} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{interest}</span>)}</div>
                  {profile ? <ProfilePhotoStrip profile={profile} name={profile.first_name ?? "Profil"} /> : null}
                  {tab === "received" ? <Button className="mt-4 w-full" onClick={() => profile?.user_id && api.like(profile.user_id)}>Apprecier aussi</Button> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function MatchesView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [active, setActive] = useState<Match | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.matches()
      .then((res) => {
        const items = dataOf(res);
        setMatches(items);
        setActive(items[0] ?? null);
      })
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function closeMatch(match: Match) {
    const ok = window.confirm("Fermer ce match ? La conversation sera archivee.");
    if (!ok) return;
    await api.unmatch(match.id).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    setMatches((items) => items.filter((item) => item.id !== match.id));
    setActive((current) => current?.id === match.id ? matches.find((item) => item.id !== match.id) ?? null : current);
  }

  if (loading) return <MatchesSkeleton />;

  const profile = active?.matched_user?.profile ?? null;
  const primaryPhoto = profile ? getPrimaryPhoto(profile) : null;
  const photos = profile ? getProfilePhotos(profile) : [];

  return (
    <section>
      <PageHeader title="Matches" body="Profils avances, compatibilite et conversation creee automatiquement apres like reciproque." />
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {matches.length === 0 ? (
        <EmptyState title="Aucun match en base" body="Continuez la decouverte pour creer de nouvelles conversations." action={<Link href="/dashboard/discovery"><Button>Decouvrir</Button></Link>} />
      ) : (
        <div className="grid gap-4 sm:gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 xl:mx-0 xl:block xl:space-y-3 xl:overflow-visible xl:px-0 xl:pb-0">
            {matches.map((match) => {
              const itemProfile = match.matched_user?.profile;
              const photo = itemProfile ? getPrimaryPhoto(itemProfile) : null;
              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setActive(match)}
                  className={`flex min-w-[260px] gap-3 rounded-[24px] border p-3 text-left transition xl:w-full xl:min-w-0 ${active?.id === match.id ? "border-[var(--primary)] bg-white/10" : "border-white/10 bg-white/[0.04] hover:bg-white/8"}`}
                >
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                    {photo ? <Image src={photo} alt={itemProfile?.first_name ?? "Match"} fill sizes="64px" className="object-cover" /> : <span className="flex h-full items-center justify-center"><Camera className="text-white/25" /></span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <b className="block truncate text-white">{itemProfile?.first_name ?? match.matched_user?.name ?? "Profil"}</b>
                      <VerifiedBadge profile={itemProfile} compact />
                    </span>
                    <small className="mt-1 block truncate text-[var(--muted)]">{itemProfile?.university?.name ?? "Universite non renseignee"}</small>
                    <span className="mt-2 inline-flex rounded-full bg-[#22c55e]/10 px-2 py-1 text-xs font-bold text-[#bbf7d0]">
                      {match.compatibility?.score ?? 55}% compatible
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          <article className="glass overflow-hidden rounded-[28px]">
            {!active || !profile ? (
              <EmptyState title="Profil match introuvable" body="Le match existe mais le profil associe n'a pas ete retourne par l'API." />
            ) : (
              <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="relative min-h-[430px] bg-white/5 sm:min-h-[520px]">
                  {primaryPhoto ? <Image src={primaryPhoto} alt={profile.first_name} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Camera className="text-white/25" size={76} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100c1a] via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="glass rounded-full px-3 py-1 text-xs font-bold text-[#ffe088]"><ShieldCheck size={14} className="inline" /> Match confirme</span>
                      {active.compatibility?.same_university ? <span className="glass rounded-full px-3 py-1 text-xs font-bold text-[var(--secondary-soft)]">Meme universite</span> : null}
                      <VerifiedBadge profile={profile} />
                    </div>
                    <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">{profile.first_name}, {profile.age ?? "18+"}</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">{profile.university?.name ?? "Universite non renseignee"} · {profile.study_level ?? "Niveau non renseigne"}</p>
                  </div>
                </div>
                <div className="space-y-5 p-5">
                  <div className="rounded-[24px] bg-white/5 p-4">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold text-[var(--muted)]">Compatibilite indicative</span>
                      <b className="text-4xl text-white">{active.compatibility?.score ?? 55}%</b>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full primary-gradient" style={{ width: `${active.compatibility?.score ?? 55}%` }} /></div>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{active.compatibility?.explanation}</p>
                  </div>
                  {profile.bio ? <section><h3 className="font-black text-white">Bio</h3><p className="mt-2 text-sm leading-7 text-[var(--muted)]">{profile.bio}</p></section> : null}
                  <section>
                    <h3 className="font-black text-white">Intentions</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">{profile.looking_for ?? "Non renseigne"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">{(profile.intentions ?? []).map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{item}</span>)}</div>
                  </section>
                  <section>
                    <h3 className="font-black text-white">Centres d&apos;interet</h3>
                    <div className="mt-3 flex flex-wrap gap-2">{(profile.interests ?? []).map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{item}</span>)}</div>
                    {(active.compatibility?.shared_interests ?? []).length ? <p className="mt-3 text-xs text-[#bbf7d0]">{active.compatibility?.shared_interests?.join(", ")} en commun.</p> : null}
                  </section>
                  {photos.length > 1 ? (
                    <section>
                      <h3 className="font-black text-white">Galerie</h3>
                      <ProfilePhotoStrip profile={profile} name={profile.first_name} />
                    </section>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2 [&_a]:w-full [&_button]:w-full">
                    <Link href={`/dashboard/messages?conversation=${active.conversation?.id ?? ""}`}><Button className="w-full"><MessageCircle size={18} /> Envoyer un message</Button></Link>
                    <Button type="button" variant="danger" onClick={() => closeMatch(active)}><X size={18} /> Fermer le match</Button>
                  </div>
                </div>
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}

const stickerPacks = [
  { code: "campus-heart", label: "💖", name: "Campus love" },
  { code: "study-mode", label: "📚", name: "Study mode" },
  { code: "coffee-date", label: "☕", name: "Cafe date" },
  { code: "gold-star", label: "⭐", name: "Gold star" },
  { code: "party-campus", label: "🎉", name: "Campus party" },
  { code: "shy-wave", label: "👋", name: "Petit coucou" },
  { code: "late-revision", label: "📝", name: "Revision tardive" },
  { code: "library-crush", label: "🏛️", name: "Library crush" },
  { code: "good-vibes", label: "✨", name: "Good vibes" },
  { code: "movie-night", label: "🎬", name: "Movie night" },
  { code: "food-date", label: "🍜", name: "Food date" },
  { code: "safe-heart", label: "🫶", name: "Coeur safe" },
  { code: "smart-look", label: "🤓", name: "Smart look" },
  { code: "laugh-burst", label: "😂", name: "Fou rire" },
  { code: "campus-walk", label: "🚶", name: "Campus walk" },
  { code: "premium-spark", label: "💫", name: "Premium spark" },
];

const emojiPickerStyle = {
  "--epr-bg-color": "#15101f",
  "--epr-category-label-bg-color": "#15101f",
  "--epr-text-color": "#ffffff",
  "--epr-search-input-bg-color": "rgba(255,255,255,0.08)",
  "--epr-search-input-text-color": "#ffffff",
  "--epr-picker-border-color": "rgba(255,255,255,0.12)",
  "--epr-hover-bg-color": "rgba(255,255,255,0.12)",
  "--epr-highlight-color": "#d7263d",
  border: "0",
  backgroundColor: "transparent",
} as React.CSSProperties;

function getMessagePreview(message: Pick<Message, "type" | "body" | "attachment_url" | "sticker_code">, fallback = "Message") {
  if (message.type === "sticker") {
    const sticker = stickerPacks.find((item) => item.code === message.sticker_code);
    return `${sticker?.label ?? "🏷️"} Sticker`;
  }
  if (message.type === "image") return "Image";
  return message.body?.trim() || fallback;
}

export function MessagesView() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showExtras, setShowExtras] = useState<"emoji" | "sticker" | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const optimisticIdRef = useRef(-1);
  const me = getStoredUser();

  function refreshConversationsSilently() {
    api.conversations()
      .then((res) => {
        const list = dataOf(res);
        setConversations(list);
        setActive((current) => current ? list.find((conversation) => conversation.id === current.id) ?? current : list[0] ?? null);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    api.conversations()
      .then((res) => {
        const list = dataOf(res);
        const requestedId = Number(searchParams.get("conversation"));
        const requested = list.find((conversation) => conversation.id === requestedId);
        setConversations(list);
        const shouldAutoOpen = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
        const nextActive = requested ?? (shouldAutoOpen ? list[0] : null) ?? null;
        if (nextActive) setMessageLoading(true);
        setActive(nextActive);
      })
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!active?.id) {
      return;
    }
    api.messages(active.id)
      .then((res) => setMessages(dataOf(res).reverse()))
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setMessageLoading(false));
    api.markConversationRead(active.id).catch(() => undefined);
    const timer = window.setInterval(() => {
      api.messages(active.id)
        .then((res) => setMessages(dataOf(res).reverse()))
        .catch(() => undefined);
      refreshConversationsSilently();
    }, 6000);
    return () => window.clearInterval(timer);
  }, [active]);

  async function send(event: { preventDefault: () => void }, stickerCode?: string) {
    event.preventDefault();
    if ((!draft.trim() && !stickerCode) || !active) return;
    const body = draft.trim();
    const sticker = stickerPacks.find((item) => item.code === stickerCode);
    const optimistic: Message = {
      id: optimisticIdRef.current--,
      conversation_id: active.id,
      sender_id: me?.id ?? 0,
      type: stickerCode ? "sticker" : "text",
      body: stickerCode ? sticker?.name ?? "Sticker" : body,
      sticker_code: stickerCode ?? null,
      reply_to_message_id: replyTo?.id && replyTo.id > 0 ? replyTo.id : null,
      reply_to_message: replyTo ? {
        id: replyTo.id,
        sender_id: replyTo.sender_id,
        type: replyTo.type,
        body: replyTo.body,
        attachment_url: replyTo.attachment_url,
        sticker_code: replyTo.sticker_code,
      } : null,
      created_at: new Date().toISOString(),
    };
    setMessages((items) => [...items, optimistic]);
    setConversations((items) => items.map((conversation) => conversation.id === active.id ? { ...conversation, latest_message: optimistic, last_message_at: optimistic.created_at } : conversation));
    setDraft("");
    setReplyTo(null);
    setShowExtras(null);
    const sent = await api.sendMessage(active.id, {
      type: optimistic.type,
      body: optimistic.body,
      sticker_code: optimistic.sticker_code,
      reply_to_message_id: optimistic.reply_to_message_id,
    }).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (sent) {
      setMessages((items) => items.map((message) => message.id === optimistic.id ? sent : message));
      refreshConversationsSilently();
    } else {
      setMessages((items) => items.filter((message) => message.id !== optimistic.id));
    }
  }

  function addEmoji(emojiData: EmojiClickData) {
    setDraft((value) => `${value}${emojiData.emoji}`);
  }

  if (loading) return <MessagesSkeleton />;

  return (
    <section className="min-w-0">
      <div className="hidden sm:block">
        <PageHeader title="Messages" />
      </div>
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {conversations.length === 0 ? <EmptyState title="Aucune conversation en base" body="Les conversations apparaissent apres un match mutuel." /> : (
        <div className="grid h-[calc(100dvh-128px)] min-h-[480px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] sm:h-[calc(100vh-150px)] sm:min-h-[560px] sm:rounded-[28px] lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <aside className={`${active ? "hidden lg:block" : "block"} min-w-0 overflow-y-auto border-b border-white/10 p-2 sm:p-3 lg:border-b-0 lg:border-r`}>
            {conversations.map((conversation) => {
              const profile = conversation.matched_user?.profile;
              const photo = profile ? getPrimaryPhoto(profile) : null;
              return (
              <button key={conversation.id} onClick={() => { setMessageLoading(true); setActive(conversation); }} className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-left ${active?.id === conversation.id ? "bg-white/12" : "hover:bg-white/8"}`}>
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--primary)] text-white">
                  {photo ? <Image src={photo} alt={profile?.first_name ?? "Conversation"} fill sizes="48px" className="object-cover" /> : <span className="flex h-full items-center justify-center"><MessageCircle size={18} /></span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <b className="block truncate text-sm text-white">{profile?.first_name ?? conversation.matched_user?.name ?? "Conversation"}</b>
                    <VerifiedBadge profile={profile} compact />
                  </span>
                  <small className="block truncate text-[var(--muted)]">{conversation.latest_message ? getMessagePreview(conversation.latest_message) : "Aucun message"}</small>
                </span>
                {(conversation.unread_count ?? 0) > 0 ? <span className="rounded-full bg-[var(--primary)] px-2 py-1 text-xs font-black text-white">{conversation.unread_count}</span> : null}
              </button>
            );})}
          </aside>
          <div className={`${active ? "flex" : "hidden lg:flex"} min-w-0 flex-col`}>
            <div className="flex items-center gap-3 border-b border-white/10 p-3 sm:p-4">
              <button type="button" onClick={() => setActive(null)} className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white lg:hidden" aria-label="Retour aux conversations"><ArrowLeft size={18} /></button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-white">{active?.matched_user?.profile?.first_name ?? active?.matched_user?.name ?? "Conversation active"}</p>
                  <VerifiedBadge profile={active?.matched_user?.profile} compact />
                </div>
                <p className="truncate text-xs text-[var(--muted)]">Free: 15 messages. Premium: illimite.</p>
              </div>
            </div>
            <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
              {messageLoading ? <Spinner label="Chargement des messages..." /> : null}
              {!messageLoading && messages.length === 0 ? <EmptyState title="Aucun message" body="Envoyez le premier message de cette conversation." /> : null}
              {messages.map((message) => {
                const mine = message.sender_id === me?.id;
                const sticker = stickerPacks.find((item) => item.code === message.sticker_code);
                return (
                  <div key={message.id} className={`group flex items-end gap-1.5 sm:gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                    {!mine ? (
                      <button type="button" onClick={() => setReplyTo(message)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-[var(--muted)] opacity-80 transition hover:bg-white/14 hover:text-white md:opacity-0 md:group-hover:opacity-100" aria-label="Repondre a ce message">
                        <Reply size={14} />
                      </button>
                    ) : null}
                    <div className={`max-w-[82%] rounded-3xl px-3 py-2.5 text-sm leading-6 sm:max-w-[78%] sm:px-4 sm:py-3 ${mine ? "primary-gradient text-white" : "bg-[#15101f] text-[var(--muted)]"} ${message.type === "sticker" ? "min-w-20 text-center sm:min-w-24" : ""}`}>
                      {message.reply_to_message ? (
                        <div className={`mb-2 rounded-2xl border-l-2 px-3 py-2 text-xs leading-5 ${mine ? "border-white/60 bg-white/15 text-white/85" : "border-[var(--primary)] bg-white/6 text-white/70"}`}>
                          <p className="font-bold">{message.reply_to_message.sender_id === me?.id ? "Vous" : active?.matched_user?.profile?.first_name ?? active?.matched_user?.name ?? "Message"}</p>
                          <p className="line-clamp-2">{getMessagePreview(message.reply_to_message)}</p>
                        </div>
                      ) : null}
                      {message.type === "sticker" ? (
                        <span className="block text-5xl leading-none" aria-label={sticker?.name ?? "Sticker"}>{sticker?.label ?? "🏷️"}</span>
                      ) : (
                        message.body
                      )}
                    </div>
                    {mine ? <span className="ml-2 self-end text-[10px] text-[var(--muted)]">{message.read_at ? "Lu" : "Envoye"}</span> : null}
                    {mine ? (
                      <button type="button" onClick={() => setReplyTo(message)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-[var(--muted)] opacity-80 transition hover:bg-white/14 hover:text-white md:opacity-0 md:group-hover:opacity-100" aria-label="Repondre a ce message">
                        <Reply size={14} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <form onSubmit={(event) => send(event)} className="relative border-t border-white/10 p-3 sm:p-4">
              {replyTo ? (
                <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-2">
                  <Reply size={16} className="shrink-0 text-[var(--gold)]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white">Reponse a {replyTo.sender_id === me?.id ? "vous" : active?.matched_user?.profile?.first_name ?? active?.matched_user?.name ?? "ce message"}</p>
                    <p className="truncate text-xs text-[var(--muted)]">{getMessagePreview(replyTo)}</p>
                  </div>
                  <button type="button" onClick={() => setReplyTo(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] hover:bg-white/10 hover:text-white" aria-label="Annuler la reponse">
                    <X size={16} />
                  </button>
                </div>
              ) : null}
              {showExtras ? (
                <div className="absolute bottom-[76px] left-2 right-2 z-30 rounded-[22px] border border-white/12 bg-[#15101f]/98 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:bottom-[86px] sm:left-4 sm:right-4 sm:rounded-[26px] sm:p-3">
                  <div className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 border-b border-r border-white/12 bg-[#15101f]" />
                  <div className="absolute -top-3 left-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#24182f] px-3 py-1 text-[11px] font-black uppercase tracking-[0.05em] text-white shadow-lg">
                    {showExtras === "emoji" ? <Smile size={13} className="text-[var(--gold)]" /> : <MessageCircle size={13} className="text-[var(--gold)]" />}
                    {showExtras === "emoji" ? "Emoji" : "Stickers"}
                  </div>
                  {showExtras === "emoji" ? (
                    <div className="overflow-hidden rounded-[18px] pt-2 sm:rounded-[20px]">
                      <EmojiPicker
                        height={280}
                        width="100%"
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.NATIVE}
                        lazyLoadEmojis
                        searchPlaceHolder="Rechercher un emoji"
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled
                        style={emojiPickerStyle}
                        onEmojiClick={addEmoji}
                      />
                    </div>
                  ) : (
                    <div className="max-h-[280px] overflow-y-auto px-1 pt-2">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.05em] text-[var(--gold)]">Stickers US</p>
                        <span className="text-xs text-[var(--muted)]">{stickerPacks.length} stickers</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {stickerPacks.map((stickerItem) => (
                        <button key={stickerItem.code} type="button" onClick={(event) => send(event, stickerItem.code)} className="flex min-h-18 flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/6 p-2 transition hover:bg-white/12 sm:min-h-20 sm:gap-2 sm:p-3">
                          <span className="text-3xl leading-none sm:text-4xl">{stickerItem.label}</span>
                          <span className="text-[10px] font-bold text-[var(--muted)]">{stickerItem.name}</span>
                        </button>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              <div className="flex items-center gap-2 sm:gap-3">
                <button type="button" onClick={() => setShowExtras((value) => value === "emoji" ? null : "emoji")} className={`glass relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-12 ${showExtras === "emoji" ? "border-[var(--gold)] bg-white/12" : ""}`} aria-label="Afficher les emojis">
                  {showExtras === "emoji" ? <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--gold)] shadow-[0_0_0_3px_#15101f]" /> : null}
                  <Smile size={18} />
                </button>
                <button type="button" onClick={() => setShowExtras((value) => value === "sticker" ? null : "sticker")} className={`glass relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-12 ${showExtras === "sticker" ? "border-[var(--gold)] bg-white/12" : ""}`} aria-label="Afficher les stickers">
                  {showExtras === "sticker" ? <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--gold)] shadow-[0_0_0_3px_#15101f]" /> : null}
                  <MessageCircle size={18} />
                </button>
                <span className="glass flex min-h-11 min-w-0 flex-1 items-center rounded-2xl px-3 sm:min-h-12 sm:px-4">
                  <TextInput value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={replyTo ? "Repondre..." : "Votre message..."} />
                </span>
                <Button type="submit" className="min-h-11 px-3 sm:min-h-12 sm:px-4"><Send size={18} /></Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export function NotificationsView() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    api.notifications().then((res) => setItems(dataOf(res))).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);
  async function readAll() {
    await api.readAllNotifications().catch((err) => setNotice(errorMessage(err)));
    setItems((list) => list.map((item) => ({ ...item, read_at: new Date().toISOString() })));
  }

  async function openNotification(item: NotificationItem) {
    if (!item.read_at) {
      const updated = await api.readNotification(item.id).catch(() => null);
      if (updated) setItems((list) => list.map((entry) => entry.id === item.id ? updated : entry));
    }
  }

  if (loading) return <NotificationsSkeleton />;
  const unread = items.filter((item) => !item.read_at).length;
  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category)))];
  const visibleItems = category === "all" ? items : items.filter((item) => item.category === category);
  return (
    <section>
      <PageHeader title="Centre de notifications" body="Toutes les alertes importantes du dashboard, avec liens directs vers l'action." action={<Button variant="secondary" onClick={readAll}><Check size={18} /> Tout lire</Button>} />
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-[220px_1fr]">
        <div className="glass rounded-[22px] p-4">
          <p className="text-xs font-black uppercase tracking-[0.05em] text-[var(--muted)]">Non lues</p>
          <p className="mt-2 text-3xl font-black text-white">{unread}</p>
        </div>
        <div className="glass flex flex-wrap items-center gap-2 rounded-[22px] p-3">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3 py-2 text-xs font-black transition ${category === item ? "bg-[var(--primary)] text-white" : "bg-white/8 text-[var(--muted)] hover:bg-white/12 hover:text-white"}`}>
              {item === "all" ? "Toutes" : item}
            </button>
          ))}
        </div>
      </div>
      {visibleItems.length === 0 ? <EmptyState title="Aucune notification en base" body="Votre flux apparaitra ici lorsqu'une action sera creee par le backend." /> : (
        <div className="space-y-3">
          {visibleItems.map((item) => (
            <Link href={item.action_url ?? "/dashboard/notifications"} onClick={() => openNotification(item)} key={item.id} className="glass flex gap-4 rounded-[22px] p-4 transition hover:bg-white/10">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.read_at ? "bg-white/10" : "bg-[var(--primary)]"}`}><Bell size={18} /></span>
              <div className="flex-1"><p className="font-bold text-white">{item.title}</p><p className="mt-1 text-sm text-[var(--muted)]">{item.body}</p><p className="mt-2 text-xs text-[var(--gold)]">Ouvrir l&apos;action</p></div>
              {!item.read_at ? <span className="mt-2 h-2 w-2 rounded-full bg-[var(--primary)]" /> : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [profileLightboxIndex, setProfileLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.profile().then(setProfile),
      api.universities().then((res) => setUniversities(dataOf(res))),
    ])
      .catch((err) => setMessage(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function choosePhotos(files: FileList | null) {
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    const availableSlots = Math.max(0, PROFILE_PHOTO_LIMIT - (profile?.photos?.length ?? 0));
    if (availableSlots === 0) {
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setMessage(`Votre galerie contient deja ${PROFILE_PHOTO_LIMIT} photos.`);
      return;
    }
    const images = Array.from(files ?? []).slice(0, availableSlots);
    setSelectedPhotos(images);
    setPhotoPreviews(images.map((file) => URL.createObjectURL(file)));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const res = await api.updateProfile({
      first_name: profile.first_name,
      bio: profile.bio,
      study_level: profile.study_level,
      looking_for: profile.looking_for,
      gender: profile.gender,
      languages: profile.languages ?? [],
      intentions: profile.intentions ?? [],
      university_id: profile.university?.id ?? null,
      interests: profile.interests ?? [],
    }).catch((err) => {
      setMessage(errorMessage(err));
      return null;
    });
    if (res) {
      setProfile(res);
      setMessage("Profil mis a jour.");
    }
  }

  function locate() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        api.updateLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_meters: Math.round(pos.coords.accuracy),
        }).then(() => setMessage("Position floutee mise a jour.")).catch((err) => setMessage(errorMessage(err)));
      },
      () => setMessage("Geolocalisation refusee par le navigateur."),
    );
  }

  async function addPhoto() {
    if (!profile) return;
    const currentPhotos = getProfilePhotos(profile);
    if (selectedPhotos.length === 0) {
      setMessage("Choisissez au moins une photo depuis votre appareil avant de continuer.");
      return;
    }
    if (currentPhotos.length + selectedPhotos.length > PROFILE_PHOTO_LIMIT) {
      setMessage(`Votre galerie est limitee a ${PROFILE_PHOTO_LIMIT} photos.`);
      return;
    }
    setSavingPhoto(true);
    const photos = await api.uploadPhotos(selectedPhotos, { is_primary: !getPrimaryPhoto(profile) }).catch((err) => {
      setMessage(errorMessage(err));
      return null;
    });
    if (photos) {
      const refreshed = await api.profile().catch(() => null);
      if (refreshed) setProfile(refreshed);
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setMessage(photos.length > 1 ? "Photos ajoutees." : "Photo ajoutee.");
    }
    setSavingPhoto(false);
  }

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <EmptyState title="Profil introuvable" body="Aucun profil n'a ete retourne par la base de donnees." />;
  const profilePhotos = getProfilePhotos(profile);

  return (
    <section>
      <PageHeader title="Profil" body="Completez les informations visibles dans la decouverte." action={<Button variant="secondary" onClick={locate}><Navigation size={18} /> Actualiser la zone</Button>} />
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="glass rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.05em] text-[var(--muted)]">Statut profil</p>
              <p className="mt-1 font-black text-white">{profile.first_name}</p>
            </div>
            <VerifiedBadge profile={profile} />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-white/10">
            {photoPreviews[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreviews[0]} alt="Apercu photo profil" className="h-full w-full object-cover" />
            ) : getPrimaryPhoto(profile) ? <Image src={getPrimaryPhoto(profile)!} alt={profile.first_name} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Camera className="text-white/25" size={72} /></div>}
          </div>
          {photoPreviews.length > 1 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photoPreviews.slice(1).map((preview, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={preview} src={preview} alt={`Apercu photo ${index + 2}`} className="aspect-square rounded-2xl object-cover" />
              ))}
            </div>
          ) : null}
          {profilePhotos.length > 0 ? (
            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.05em] text-[var(--gold)]">Galerie</p>
                <span className="text-xs font-bold text-[var(--muted)]">{profilePhotos.length}/{PROFILE_PHOTO_LIMIT} photos</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {profilePhotos.map((photo, index) => (
                  <button key={photo.id} type="button" onClick={() => setProfileLightboxIndex(index)} className="group relative aspect-square overflow-hidden rounded-2xl bg-white/10">
                    <Image src={photo.url} alt={`${profile.first_name} photo ${index + 1}`} fill sizes="96px" className="object-cover" />
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex"><Maximize2 size={18} /></span>
                    {photo.is_primary ? <span className="absolute left-1 top-1 rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[9px] font-black text-white">Principale</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {profileLightboxIndex !== null ? <PhotoLightbox photos={profilePhotos} index={profileLightboxIndex} name={profile.first_name} onIndexChange={setProfileLightboxIndex} onClose={() => setProfileLightboxIndex(null)} /> : null}
          {profilePhotos.length < 2 ? <div className="mt-3"><Notice kind="error">Ajoutez au moins 2 photos pour un profil complet.</Notice></div> : null}
          <Field label="Photos locales" icon={<Camera size={18} />}>
            <TextInput type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => choosePhotos(e.target.files)} />
          </Field>
          <Button type="button" className="mt-4 w-full" disabled={savingPhoto} onClick={addPhoto}>
            {savingPhoto ? <Spinner label="Ajout..." /> : <><Camera size={18} /> Ajouter les photos</>}
          </Button>
        </aside>
        <div className="glass space-y-4 rounded-[28px] p-5">
          {message ? <Notice kind={message.includes("jour") || message.includes("ajoutee") ? "success" : "error"}>{message}</Notice> : null}
          <Field label="Prenom"><TextInput value={profile.first_name ?? ""} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} /></Field>
          <Field label="Universite"><Select value={profile.university?.id ?? ""} onChange={(e) => setProfile({ ...profile, university: universities.find((u) => u.id === Number(e.target.value)) ?? null })}>{universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
          <Field label="Niveau d'etudes"><TextInput value={profile.study_level ?? ""} onChange={(e) => setProfile({ ...profile, study_level: e.target.value })} /></Field>
          <Field label="Intention"><TextInput value={profile.looking_for ?? ""} onChange={(e) => setProfile({ ...profile, looking_for: e.target.value })} /></Field>
          <Field label="Langues"><TextInput value={(profile.languages ?? []).join(", ")} onChange={(e) => setProfile({ ...profile, languages: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
          <Field label="Intentions detaillees"><TextInput value={(profile.intentions ?? []).join(", ")} onChange={(e) => setProfile({ ...profile, intentions: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
          <Field label="Bio"><TextArea value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></Field>
          <Field label="Centres d'interet"><TextInput value={(profile.interests ?? []).join(", ")} onChange={(e) => setProfile({ ...profile, interests: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
          <Button type="submit">Enregistrer le profil</Button>
        </div>
      </form>
    </section>
  );
}

export function PremiumView() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.plans().then(setPlans).catch((err) => setMessage(errorMessage(err))).finally(() => setLoading(false));
  }, []);
  async function pay(plan: Plan) {
    if (!phone) {
      setMessage("Entrez un numero Mobile Money avant de continuer.");
      return;
    }
    const res = await api.paymentIntent(plan.id, phone).catch((err) => {
      setMessage(errorMessage(err));
      return null;
    });
    if (res) setMessage("Intention de paiement creee. Validez sur votre telephone.");
  }
  if (loading) return <PremiumSkeleton />;
  return (
    <section>
      <PageHeader title="Premium" body="Mobile Money, boosts, Super Likes et controle avance de la visibilite." />
      {message ? <div className="mb-4"><Notice>{message}</Notice></div> : null}
      <Field label="Numero MTN ou Orange Money"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237 6.." /></Field>
      {plans.length === 0 ? <div className="mt-5"><EmptyState title="Aucun plan en base" body="Ajoutez des plans actifs dans la base pour afficher les abonnements." /></div> : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.id} className="glass flex flex-col rounded-[28px] p-6">
              <Crown className="text-[var(--gold)]" size={28} />
              <h2 className="mt-4 text-2xl font-black text-white">{plan.name}</h2>
              <p className="mt-2 text-3xl font-black text-gradient">{(plan.price_cents / 100).toLocaleString("fr-FR")} {plan.currency ?? "XAF"}</p>
              <ul className="mt-5 flex-1 space-y-3 text-sm text-[var(--muted)]">{(plan.features ?? []).map((feature) => <li key={feature} className="flex gap-2"><Check size={17} className="text-[var(--gold)]" /> {feature}</li>)}</ul>
              <Button variant="premium" className="mt-6" onClick={() => pay(plan)}>Activer avec Mobile Money</Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function OnboardingView() {
  const steps = [
    ["Bienvenue", "US privilegie la communaute universitaire et la moderation, sans verification etudiante active dans le MVP.", "/onboarding/welcome"],
    ["Centres d'interet", "Ajoutez ce qui rend vos conversations naturelles.", "/onboarding/interests"],
    ["Photos", "Une photo claire augmente la confiance et la qualite des matches.", "/onboarding/photos"],
  ];
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <PageHeader title="Onboarding US" body="Finalisez votre premiere experience avant la decouverte." />
      <div className="space-y-4">
        {steps.map(([title, body, href], idx) => (
          <Link href={href} key={title} className="glass flex gap-4 rounded-[24px] p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)] font-black text-white">{idx + 1}</span>
            <div><h2 className="font-black text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{body}</p></div>
          </Link>
        ))}
      </div>
      <Link href="/dashboard/discovery" className="mt-6 inline-flex"><Button>Entrer dans US</Button></Link>
    </main>
  );
}

export function SettingsView() {
  const [status, setStatus] = useState<"active" | "paused" | "deleted">("active");
  const [preferences, setPreferences] = useState<DiscoveryPreference>({ min_age: 18, max_age: 35, radius_km: 25, gender: null, same_university_only: false });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function update() {
    setLoading(true);
    const res = await api.updateStatus(status).catch((err) => {
      setMessage(errorMessage(err));
      return null;
    });
    if (res) setMessage("Statut du compte mis a jour.");
    setLoading(false);
  }

  async function updateDiscoveryPreferences() {
    setLoading(true);
    const res = await api.updatePreferences({ ...preferences, gender: null }).catch((err) => {
      setMessage(errorMessage(err));
      return null;
    });
    if (res) setMessage("Preferences de decouverte mises a jour.");
    setLoading(false);
  }

  const settingsSections = [
    { title: "Notifications", body: "Push, messages, matchs et alertes de securite.", href: "/dashboard/notifications", icon: Bell },
    { title: "Paiement", body: "Plans Premium, Mobile Money et historique de paiement.", href: "/dashboard/premium", icon: Crown },
    { title: "Verification", body: "Selfie, documents et badge de confiance.", href: "/dashboard/verification", icon: ShieldCheck },
    { title: "Certification", body: "Badge dore, score de confiance et validation finale.", href: "/dashboard/certified", icon: Crown },
    { title: "Support", body: "Aide, contact et signalements.", href: "/dashboard/support/contact", icon: MessageCircle },
    { title: "Reglages premium", body: "Mode invisible et options reservees aux abonnes.", href: "/dashboard/settings/premium", icon: Star },
    { title: "Personnalisation", body: "Affichage du dashboard, densite, badges et animations.", href: "/dashboard/settings/personalize", icon: SlidersHorizontal },
  ];

  return (
    <section>
      <PageHeader title="Reglages" body="Controlez votre compte, vos preferences, vos notifications et vos paiements." />
      {message ? <div className="mb-4"><Notice kind={message.includes("jour") ? "success" : "error"}>{message}</Notice></div> : null}
      {loading ? <div className="mb-4"><Spinner label="Mise a jour..." /></div> : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="glass rounded-[28px] p-5">
            <h2 className="text-xl font-black text-white">Preferences de decouverte</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Le sexe affiche est automatique: Homme vers Femme, Femme vers Homme.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field label="Age min"><TextInput type="number" min={18} value={preferences.min_age ?? ""} onChange={(e) => setPreferences({ ...preferences, min_age: Number(e.target.value) })} /></Field>
              <Field label="Age max"><TextInput type="number" min={18} value={preferences.max_age ?? ""} onChange={(e) => setPreferences({ ...preferences, max_age: Number(e.target.value) })} /></Field>
              <Field label="Rayon km"><TextInput type="number" min={1} max={500} value={preferences.radius_km ?? ""} onChange={(e) => setPreferences({ ...preferences, radius_km: Number(e.target.value) })} /></Field>
            </div>
            <div className="mt-4">
              <Toggle checked={!!preferences.same_university_only} onChange={(checked) => setPreferences({ ...preferences, same_university_only: checked })} label="Meme universite uniquement" />
            </div>
            <Button className="mt-5" onClick={updateDiscoveryPreferences} disabled={loading}>Enregistrer les preferences</Button>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.href} href={section.href} className="glass rounded-[24px] p-5 text-white transition hover:bg-white/10">
                  <Icon className="text-[var(--gold)]" size={24} />
                  <h2 className="mt-4 font-black">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{section.body}</p>
                </Link>
              );
            })}
          </section>
        </div>

        <aside className="glass h-max rounded-[28px] p-5">
          <h2 className="text-xl font-black text-white">Compte</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Mettez votre profil en pause ou supprimez l&apos;acces si necessaire.</p>
          <Field label="Statut du compte">
            <Select value={status} onChange={(e) => setStatus(e.target.value as "active" | "paused" | "deleted")}>
              <option value="active">Actif</option>
              <option value="paused">En pause</option>
              <option value="deleted">Supprime</option>
            </Select>
          </Field>
          <Button className="mt-4 w-full" onClick={update} disabled={loading}>Mettre a jour</Button>
          <div className="mt-5 space-y-3">
            <Link href="/dashboard/profile" className="block rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-white">Modifier le profil</Link>
            <Link href="/dashboard/messages" className="block rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-white">Messages et limites</Link>
            <Link href="/dashboard/premium" className="block rounded-2xl bg-[#d4af37]/10 px-4 py-3 text-sm font-bold text-[#ffe6a3]">Details de paiement</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function DashboardPersonalizationView() {
  const [settings, setSettings] = useState(() => {
    const defaults = {
      compactMode: false,
      animatedCharts: true,
      showProfileBadges: true,
      showCounters: true,
      quietNotifications: false,
    };
    if (typeof window === "undefined") return defaults;
    const raw = localStorage.getItem("us_dashboard_personalization");
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  });
  const [message, setMessage] = useState("");

  function update(key: keyof typeof settings, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("us_dashboard_personalization", JSON.stringify(next));
    setMessage("Preferences personnalisees enregistrees sur ce navigateur.");
  }

  return (
    <section>
      <PageHeader title="Personnalisation" body="Ajustez l'experience du dashboard pour votre maniere de travailler." />
      {message ? <div className="mb-4"><Notice kind="success">{message}</Notice></div> : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="glass rounded-[28px] p-5">
          <h2 className="text-xl font-black text-white">Affichage du dashboard</h2>
          <div className="mt-5 space-y-3">
            <Toggle checked={settings.compactMode} onChange={(checked) => update("compactMode", checked)} label="Mode compact pour afficher plus de donnees" />
            <Toggle checked={settings.animatedCharts} onChange={(checked) => update("animatedCharts", checked)} label="Graphiques animes dans les vues statistiques" />
            <Toggle checked={settings.showProfileBadges} onChange={(checked) => update("showProfileBadges", checked)} label="Afficher les badges Verifie et Certifie" />
            <Toggle checked={settings.showCounters} onChange={(checked) => update("showCounters", checked)} label="Afficher les compteurs messages et notifications" />
            <Toggle checked={settings.quietNotifications} onChange={(checked) => update("quietNotifications", checked)} label="Mode discret pour les notifications visuelles" />
          </div>
        </section>
        <aside className="glass h-max rounded-[28px] p-5">
          <SlidersHorizontal className="text-[var(--gold)]" size={28} />
          <h2 className="mt-4 text-xl font-black text-white">Profil d&apos;affichage</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ces reglages sont gardes localement pour ce navigateur et peuvent etre synchronises plus tard avec l&apos;API.</p>
          <Link href="/dashboard/settings" className="mt-5 inline-flex"><Button variant="secondary">Retour parametres</Button></Link>
        </aside>
      </div>
    </section>
  );
}

export function CertifiedProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.profile().then(setProfile).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <ProfileSkeleton />;

  const score = profile?.certification_score ?? 0;
  return (
    <section>
      <PageHeader title="Certification" body="Suivez votre progression vers le badge certifie dore." />
      {notice ? <Notice kind="error">{notice}</Notice> : null}
      {!profile ? <EmptyState title="Profil introuvable" body="Impossible de charger le statut de certification." /> : (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <article className="glass rounded-[28px] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <VerifiedBadge profile={profile} />
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-black text-[var(--muted)]">{profile.certification_status ?? "not_eligible"}</span>
                </div>
                <h1 className="mt-5 text-3xl font-black text-white">{profile.first_name}</h1>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">A 100%, votre profil devient eligible pour l&apos;activation du badge dore.</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-black text-white">{score}%</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">Score</p>
              </div>
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#d4af37]" style={{ width: `${score}%` }} />
            </div>
          </article>
          <aside className="glass h-max rounded-[28px] p-5">
            <Crown className="text-[var(--gold)]" size={32} />
            <h2 className="mt-4 text-xl font-black text-white">Badge dore</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {profile.is_certified ? "Votre badge certifie est actif sur les pages profil, matches, likes et messages." : score >= 100 ? "Votre profil est eligible et attend la validation finale." : "Completez votre profil, verifiez votre compte et interagissez sainement pour atteindre 100%."}
            </p>
            <Link href="/dashboard/verification" className="mt-5 inline-flex"><Button variant="secondary">Voir verification</Button></Link>
          </aside>
        </div>
      )}
    </section>
  );
}
