"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";
import {
  ArrowLeft,
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
import type { Conversation, DiscoveryPreference, LikeItem, Match, Message, NotificationItem, Plan, Profile, University } from "@/types/api";
import { Button, EmptyState, Field, Notice, Select, Spinner, TextArea, TextInput } from "@/components/ui/primitives";
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
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">US Nous</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h1>
        {body ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

function getPrimaryPhoto(profile: Profile) {
  return profile.photos?.find((photo) => photo.is_primary)?.url ?? profile.photos?.[0]?.url ?? null;
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
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const current = profiles[index];
  const currentPhotos = current?.photos ?? [];
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
        <div className="mx-auto grid max-w-5xl gap-6 xl:grid-cols-[1fr_320px]">
          <article className="relative min-h-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-[#221d2d] shadow-2xl">
            {activePhoto ? (
              <Image src={activePhoto} alt={current.first_name} fill sizes="(max-width: 1024px) 100vw, 700px" className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5"><Camera className="text-white/25" size={96} /></div>
            )}
            {currentPhotos.length > 1 ? (
              <>
                <button type="button" onClick={previousPhoto} className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55" aria-label="Photo precedente">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={nextPhoto} className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55" aria-label="Photo suivante">
                  <ChevronRight size={22} />
                </button>
                <div className="absolute inset-x-4 top-4 z-10 flex gap-1.5">
                  {currentPhotos.map((photo, idx) => (
                    <button key={photo.id} type="button" onClick={() => setPhotoIndex(idx)} className={`h-1.5 flex-1 rounded-full ${idx === photoIndex ? "bg-white" : "bg-white/35"}`} aria-label={`Afficher photo ${idx + 1}`} />
                  ))}
                </div>
              </>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#100c1a] via-[#100c1a]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-5 p-6">
              <div className="flex flex-wrap gap-2">
                <span className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-[#ffe088]"><ShieldCheck size={15} /> Communaute universitaire</span>
                <span className="glass inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-[var(--secondary-soft)]"><MapPin size={15} /> Meme zone</span>
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-4xl font-black tracking-tight text-white">
                  {current.first_name}, {current.age ?? "18+"}
                  <ShieldCheck size={24} className="text-[var(--gold)]" />
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                  <GraduationCap size={17} /> {current.university?.name ?? "Universite non renseignee"} · {current.study_level ?? "Niveau non renseigne"}
                </p>
                {current.bio ? <p className="mt-4 max-w-xl text-base leading-7 text-white/90">{current.bio}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {(current.interests ?? []).map((interest) => (
                  <span key={interest} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">{interest}</span>
                ))}
              </div>
            </div>
          </article>
          <aside className="glass flex flex-col justify-between rounded-[28px] p-5">
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
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
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
        <label className="glass flex items-center justify-between rounded-2xl p-4 text-sm font-bold text-white">
          Meme universite uniquement
          <input type="checkbox" checked={!!form.same_university_only} onChange={(e) => setForm({ ...form, same_university_only: e.target.checked })} className="h-5 w-5 accent-[#d7263d]" />
        </label>
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
                  <h2 className="text-xl font-black text-white">{profile?.first_name ?? item.other_user?.name ?? "Profil"}, {profile?.age ?? "18+"}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{profile?.university?.name ?? "Universite non renseignee"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{(profile?.interests ?? []).slice(0, 3).map((interest) => <span key={interest} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{interest}</span>)}</div>
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
  const photos = profile?.photos ?? [];

  return (
    <section>
      <PageHeader title="Matches" body="Profils avances, compatibilite et conversation creee automatiquement apres like reciproque." />
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {matches.length === 0 ? (
        <EmptyState title="Aucun match en base" body="Continuez la decouverte pour creer de nouvelles conversations." action={<Link href="/dashboard/discovery"><Button>Decouvrir</Button></Link>} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="space-y-3">
            {matches.map((match) => {
              const itemProfile = match.matched_user?.profile;
              const photo = itemProfile ? getPrimaryPhoto(itemProfile) : null;
              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => setActive(match)}
                  className={`flex w-full gap-3 rounded-[24px] border p-3 text-left transition ${active?.id === match.id ? "border-[var(--primary)] bg-white/10" : "border-white/10 bg-white/[0.04] hover:bg-white/8"}`}
                >
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                    {photo ? <Image src={photo} alt={itemProfile?.first_name ?? "Match"} fill sizes="64px" className="object-cover" /> : <span className="flex h-full items-center justify-center"><Camera className="text-white/25" /></span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-white">{itemProfile?.first_name ?? match.matched_user?.name ?? "Profil"}</b>
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
                <div className="relative min-h-[520px] bg-white/5">
                  {primaryPhoto ? <Image src={primaryPhoto} alt={profile.first_name} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Camera className="text-white/25" size={76} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100c1a] via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="glass rounded-full px-3 py-1 text-xs font-bold text-[#ffe088]"><ShieldCheck size={14} className="inline" /> Match confirme</span>
                      {active.compatibility?.same_university ? <span className="glass rounded-full px-3 py-1 text-xs font-bold text-[var(--secondary-soft)]">Meme universite</span> : null}
                    </div>
                    <h2 className="mt-4 text-4xl font-black text-white">{profile.first_name}, {profile.age ?? "18+"}</h2>
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
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {photos.slice(0, 8).map((photo) => <div key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl bg-white/10"><Image src={photo.url} alt={profile.first_name} fill sizes="80px" className="object-cover" /></div>)}
                      </div>
                    </section>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
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
        if (requested ?? list[0]) setMessageLoading(true);
        setActive(requested ?? list[0] ?? null);
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
        <div className="grid h-[calc(100dvh-150px)] min-h-[500px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] sm:h-[calc(100vh-150px)] sm:min-h-[560px] sm:rounded-[28px] lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
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
                  <b className="block truncate text-sm text-white">{profile?.first_name ?? conversation.matched_user?.name ?? "Conversation"}</b>
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
                <p className="truncate font-bold text-white">{active?.matched_user?.profile?.first_name ?? active?.matched_user?.name ?? "Conversation active"}</p>
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
  return (
    <section>
      <PageHeader title="Notifications" body="Matches, messages, premium et securite en un seul flux." action={<Button variant="secondary" onClick={readAll}><Check size={18} /> Tout lire</Button>} />
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {items.length === 0 ? <EmptyState title="Aucune notification en base" body="Votre flux apparaitra ici lorsqu'une action sera creee par le backend." /> : (
        <div className="space-y-3">
          {items.map((item) => (
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
    const images = Array.from(files ?? []).slice(0, 6);
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
    if (selectedPhotos.length === 0) {
      setMessage("Choisissez au moins une photo depuis votre appareil avant de continuer.");
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

  return (
    <section>
      <PageHeader title="Profil" body="Completez les informations visibles dans la decouverte." action={<Button variant="secondary" onClick={locate}><Navigation size={18} /> Actualiser la zone</Button>} />
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="glass rounded-[28px] p-5">
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
    { title: "Support", body: "Aide, contact et signalements.", href: "/dashboard/support/contact", icon: MessageCircle },
    { title: "Reglages premium", body: "Mode invisible et options reservees aux abonnes.", href: "/dashboard/settings/premium", icon: Star },
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
            <label className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-white">
              Meme universite uniquement
              <input type="checkbox" checked={!!preferences.same_university_only} onChange={(e) => setPreferences({ ...preferences, same_university_only: e.target.checked })} className="h-5 w-5 accent-[#d7263d]" />
            </label>
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
