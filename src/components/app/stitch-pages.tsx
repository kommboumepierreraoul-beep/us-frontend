"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Code2,
  Coffee,
  Crown,
  Dumbbell,
  FileText,
  Film,
  Gamepad2,
  GraduationCap,
  Heart,
  Lock,
  MapPin,
  Music,
  Palette,
  Plane,
  QrCode,
  Shield,
  Sparkles,
  Star,
  Ticket,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/services/api";
import type { EventInvitation, EventItem, Plan, Profile, University, VerificationRequest } from "@/types/api";
import { BrandMark } from "@/components/ui/brand";
import { Button, EmptyState, Field, Notice, Select, Spinner, TextArea, TextInput } from "@/components/ui/primitives";
import {
  CompactPlanSkeleton,
  EventDetailsSkeleton,
  EventsSkeleton,
  InvitationsSkeleton,
  OnboardingStepSkeleton,
  TicketSkeleton,
} from "@/components/ui/skeletons";

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Impossible de charger les donnees depuis la base.";
}

function dataOf<T>(result: { data: T[] } | null | undefined) {
  return result?.data ?? [];
}

function TopBar({ title, back = "/dashboard/discovery" }: { title: string; back?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#100c1a]/75 px-5 py-4 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href={back} className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--primary-soft)]">
          <ArrowLeft size={19} />
        </Link>
        <h1 className="text-lg font-black text-[var(--primary-soft)]">{title}</h1>
        <BrandMark compact />
      </div>
    </header>
  );
}

function PageShell({ title, children, back }: { title: string; children: React.ReactNode; back?: string }) {
  return (
    <main className="min-h-screen pb-12">
      <TopBar title={title} back={back} />
      <section className="mx-auto max-w-6xl px-5 py-8">{children}</section>
    </main>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <BrandMark compact />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-2xl px-4 py-3 text-sm font-bold text-[var(--muted)] hover:bg-white/10">Connexion</Link>
          <Link href="/register"><Button>S&apos;inscrire</Button></Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

function EventCover({ event }: { event: EventItem }) {
  if (event.cover_url) return <Image src={event.cover_url} alt={event.title} fill sizes="100vw" className="object-cover" />;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
      <CalendarDays className="text-white/25" size={72} />
    </div>
  );
}

function PlanCards({ plans }: { plans: Plan[] }) {
  if (plans.length === 0) return <EmptyState title="Aucun plan en base" body="Les plans seront affiches lorsque la base de donnees contiendra des abonnements actifs." />;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.id} className="glass flex min-h-96 flex-col rounded-[28px] p-6 text-left">
          <Crown className={plan.name.toLowerCase().includes("gold") ? "text-[var(--gold)]" : "text-[var(--primary-soft)]"} />
          <h2 className="mt-5 text-2xl font-black text-white">{plan.name}</h2>
          <p className="mt-2 text-3xl font-black text-gradient">
            {(plan.price_cents / 100).toLocaleString("fr-FR")} {plan.currency ?? "XAF"}
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--muted)]">
            {(plan.features ?? []).map((item) => <li key={item} className="flex gap-2"><Check size={17} /> {item}</li>)}
          </ul>
          <Link href="/register"><Button className="mt-6 w-full">Commencer</Button></Link>
        </article>
      ))}
    </div>
  );
}

export function HowItWorksPage() {
  const steps = [
    ["Creez votre profil", "Selectionnez votre universite et completez vos centres d'interet."],
    ["Decouvrez proche de vous", "US affiche des profils pertinents sans exposer les coordonnees exactes."],
    ["Matchez puis discutez", "La messagerie s'ouvre seulement apres un interet mutuel."],
  ];

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white">Comment fonctionne US</h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">Un parcours simple, pense pour la confiance universitaire et les rencontres de qualite.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(([title, body], index) => (
            <article key={title} className="glass rounded-[28px] p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] font-black text-white">{index + 1}</span>
              <h2 className="mt-5 text-xl font-black text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

export function SafetyPage() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--gold)]">Securite US</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white">Confiance sans fausse promesse</h1>
          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">En MVP, l&apos;universite est declarative. La securite repose sur la moderation, le blocage, le signalement et la protection de la geolocalisation.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Position exacte jamais affichee", "Signalement rapide", "Blocage utilisateur", "Verification future preparee"].map((item) => (
            <article key={item} className="glass rounded-[24px] p-5">
              <Shield className="text-[var(--primary-soft)]" />
              <p className="mt-4 font-bold text-white">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

export function PublicPricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.plans().then(setPlans).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-5 py-12 text-center">
        <h1 className="text-5xl font-black tracking-tight text-white">Elevez votre experience</h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">Plans charges depuis la base et payables via Mobile Money.</p>
        {notice ? <div className="mx-auto mt-6 max-w-xl"><Notice kind="error">{notice}</Notice></div> : null}
        <div className="mt-10">{loading ? <Spinner label="Chargement des plans..." /> : <PlanCards plans={plans} />}</div>
      </section>
    </PublicShell>
  );
}

export function AccessDeniedPage() {
  return (
    <PageShell title="Acces refuse" back="/">
      <EmptyState title="Acces non disponible" body="Cette zone demande une session active ou une fonctionnalite non incluse dans le MVP." action={<Link href="/login"><Button>Se connecter</Button></Link>} />
    </PageShell>
  );
}

export function StudentRegisterPage() {
  return (
    <PageShell title="Inscription etudiante" back="/register">
      <div className="glass mx-auto max-w-2xl rounded-[28px] p-6">
        <GraduationCap className="text-[var(--gold)]" size={34} />
        <h1 className="mt-4 text-3xl font-black text-white">Selection etablissement</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Cet ecran renvoie au formulaire principal, qui charge les universites depuis la base.</p>
        <Link href="/register" className="mt-6 inline-flex"><Button>Continuer l&apos;inscription</Button></Link>
      </div>
    </PageShell>
  );
}

type OnboardingStep = "welcome" | "interests" | "intentions" | "photos" | "complete";

const interestOptions: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "musique", label: "Musique", icon: Music },
  { value: "sport", label: "Sport", icon: Dumbbell },
  { value: "lecture", label: "Lecture", icon: FileText },
  { value: "tech", label: "Tech", icon: Code2 },
  { value: "cafe", label: "Cafe", icon: Coffee },
  { value: "cinema", label: "Cinema", icon: Film },
  { value: "cuisine", label: "Cuisine", icon: Utensils },
  { value: "art", label: "Art", icon: Palette },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "voyage", label: "Voyage", icon: Plane },
];
type OnboardingForm = {
  first_name: string;
  gender: string;
  university_id: string;
  study_level: string;
  looking_for: string;
  bio: string;
  languages: string;
  intentions: string;
  interests: string;
};

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function profileToForm(profile: Profile): OnboardingForm {
  return {
    first_name: profile.first_name ?? "",
    gender: profile.gender ?? "",
    university_id: profile.university?.id ? String(profile.university.id) : "",
    study_level: profile.study_level ?? "",
    looking_for: profile.looking_for ?? "",
    bio: profile.bio ?? "",
    languages: (profile.languages ?? []).join(", "),
    intentions: (profile.intentions ?? []).join(", "),
    interests: (profile.interests ?? []).join(", "),
  };
}

export function OnboardingStepPage({ step }: { step: OnboardingStep }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState<OnboardingForm>({
    first_name: "",
    gender: "",
    university_id: "",
    study_level: "",
    looking_for: "",
    bio: "",
    languages: "",
    intentions: "",
    interests: "",
  });
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const steps: Record<OnboardingStep, { title: string; body: string; icon: LucideIcon }> = {
    welcome: { title: "Completez votre profil", body: "Renseignez les informations de base visibles dans la decouverte.", icon: GraduationCap },
    interests: { title: "Centres d'interet", body: "Ajoutez les sujets qui rendront vos conversations naturelles.", icon: Heart },
    intentions: { title: "Intentions", body: "Indiquez ce que vous recherchez et les langues que vous utilisez.", icon: Sparkles },
    photos: { title: "Ajoutez une photo", body: "La photo principale est enregistree cote backend et apparait dans la decouverte.", icon: Camera },
    complete: { title: "Profil pret", body: "Verifiez votre score de completion avant d'entrer dans US.", icon: BadgeCheck },
  };
  const data = steps[step];
  const Icon = data.icon;
  const profilePhotos = [...(profile?.photos ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const primaryPhoto = profilePhotos.find((photo) => photo.is_primary)?.url ?? profilePhotos[0]?.url ?? null;

  useEffect(() => {
    Promise.all([
      api.profile(),
      api.universities().then((res) => dataOf(res)),
    ])
      .then(([loadedProfile, loadedUniversities]) => {
        setProfile(loadedProfile);
        setForm(profileToForm(loadedProfile));
        setUniversities(loadedUniversities);
      })
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function choosePhotos(files: FileList | null) {
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    const images = Array.from(files ?? []).slice(0, 6);
    setSelectedPhotos(images);
    setPhotoPreviews(images.map((file) => URL.createObjectURL(file)));
  }

  function toggleInterest(value: string) {
    const current = splitList(form.interests);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setForm({ ...form, interests: next.join(", ") });
  }

  async function saveProfile(nextHref?: string) {
    setSaving(true);
    setNotice("");
    const updated = await api.updateProfile({
      first_name: form.first_name,
      gender: form.gender,
      university_id: form.university_id ? Number(form.university_id) : null,
      study_level: form.study_level || null,
      looking_for: form.looking_for || null,
      bio: form.bio || null,
      languages: splitList(form.languages),
      intentions: splitList(form.intentions),
      interests: splitList(form.interests),
    }).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (updated) {
      setProfile(updated);
      setForm(profileToForm(updated));
      if (nextHref) router.push(nextHref);
      else setNotice("Profil mis a jour.");
    }
    setSaving(false);
  }

  async function savePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profilePhotos.length + selectedPhotos.length < 2) {
      setNotice("Ajoutez au moins 2 photos pour activer la decouverte.");
      return;
    }
    setSaving(true);
    setNotice("");
    const photos = await api.uploadPhotos(selectedPhotos, { is_primary: !primaryPhoto }).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (photos) {
      const refreshed = await api.profile().catch(() => null);
      if (refreshed) setProfile(refreshed);
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setNotice(photos.length > 1 ? "Photos ajoutees." : "Photo ajoutee.");
    }
    setSaving(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<OnboardingStep, string> = {
      welcome: "/onboarding/interests",
      interests: "/onboarding/intentions",
      intentions: "/onboarding/photos",
      photos: "/onboarding/complete",
      complete: "/dashboard/discovery",
    };
    if (step === "photos" || step === "complete") {
      router.push(next[step]);
      return;
    }
    await saveProfile(next[step]);
  }

  if (loading) return <OnboardingStepSkeleton />;

  return (
    <PageShell title="Onboarding" back="/onboarding">
      <div className="glass mx-auto max-w-3xl rounded-[28px] p-6">
        <Icon className="text-[var(--gold)]" size={36} />
        <h1 className="mt-5 text-3xl font-black text-white">{data.title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{data.body}</p>
        {notice ? <div className="mt-4"><Notice kind={notice.includes("jour") || notice.includes("ajoutee") ? "success" : "error"}>{notice}</Notice></div> : null}
        {saving ? <div className="mt-4"><Spinner label="Enregistrement..." /></div> : null}

        {step === "photos" ? (
          <form onSubmit={savePhoto} className="mt-6 grid gap-5 md:grid-cols-[240px_1fr]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-white/10">
              {photoPreviews[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreviews[0]} alt="Apercu photo profil" className="h-full w-full object-cover" />
              ) : primaryPhoto ? <Image src={primaryPhoto} alt={profile?.first_name ?? "Photo profil"} fill sizes="240px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Camera className="text-white/25" size={62} /></div>}
            </div>
            <div className="space-y-4">
              {photoPreviews.length > 1 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.slice(1).map((preview, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={preview} src={preview} alt={`Apercu photo ${index + 2}`} className="aspect-square rounded-2xl object-cover" />
                  ))}
                </div>
              ) : null}
              {profilePhotos.length > 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.05em] text-[var(--gold)]">Photos existantes</p>
                    <span className="text-xs text-[var(--muted)]">{profilePhotos.length}/6</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {profilePhotos.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl bg-white/10">
                        <Image src={photo.url} alt={`Photo profil ${index + 1}`} fill sizes="80px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <Field label="Photos locales"><TextInput type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => choosePhotos(e.target.files)} /></Field>
              <Button type="submit" disabled={saving}><Camera size={18} /> Ajouter les photos</Button>
              <Button type="button" variant="secondary" onClick={() => {
                if (profilePhotos.length < 2) {
                  setNotice("Ajoutez au moins 2 photos pour continuer.");
                  return;
                }
                router.push("/onboarding/complete");
              }}>Continuer <ArrowRight size={18} /></Button>
            </div>
          </form>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {step === "welcome" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Prenom"><TextInput value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
                  <Field label="Genre"><Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">Selectionner</option><option value="femme">Femme</option><option value="homme">Homme</option></Select></Field>
                </div>
                <Field label="Universite"><Select value={form.university_id} onChange={(e) => setForm({ ...form, university_id: e.target.value })}><option value="">Selectionner</option>{universities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}</Select></Field>
                <Field label="Niveau d'etudes"><TextInput value={form.study_level} onChange={(e) => setForm({ ...form, study_level: e.target.value })} placeholder="Licence 3, Master 1..." /></Field>
                <Field label="Bio"><TextArea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Quelques lignes sur vous..." /></Field>
              </>
            ) : null}
            {step === "interests" ? (
              <div>
                <p className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">Centres d&apos;interet</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {interestOptions.map((interest) => {
                    const Icon = interest.icon;
                    const active = splitList(form.interests).includes(interest.value);
                    return (
                      <button key={interest.value} type="button" onClick={() => toggleInterest(interest.value)} className={`flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-bold transition ${active ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-white/10 bg-white/5 text-[var(--muted)] hover:bg-white/10 hover:text-white"}`}>
                        <Icon size={17} /> {interest.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {step === "intentions" ? (
              <>
                <Field label="Ce que vous recherchez"><TextInput value={form.looking_for} onChange={(e) => setForm({ ...form, looking_for: e.target.value })} placeholder="Relation serieuse, amitie, sorties..." /></Field>
                <Field label="Intentions"><TextInput value={form.intentions} onChange={(e) => setForm({ ...form, intentions: e.target.value })} placeholder="Prendre le temps, discuter, rencontrer..." /></Field>
                <Field label="Langues"><TextInput value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="fr, en..." /></Field>
              </>
            ) : null}
            {step === "complete" ? (
              <div className="rounded-[24px] bg-white/5 p-5">
                <p className="text-sm font-bold text-[var(--muted)]">Score profil</p>
                <p className="mt-2 text-5xl font-black text-white">{profile?.completion_score ?? 0}%</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[var(--gold)]" style={{ width: `${profile?.completion_score ?? 0}%` }} />
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">{profilePhotos.length} photo(s), {(profile?.interests ?? []).length} centre(s) d&apos;interet.</p>
              </div>
            ) : null}
            <Button type="submit" disabled={saving}>{step === "complete" ? "Entrer dans US" : "Enregistrer et continuer"} <ArrowRight size={18} /></Button>
          </form>
        )}
      </div>
    </PageShell>
  );
}

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.events().then((res) => setEvents(dataOf(res))).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageShell title="Evenements"><EventsSkeleton /></PageShell>;

  const featured = events[0];

  return (
    <PageShell title="Evenements">
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {!featured ? <EmptyState title="Aucun evenement en base" body="Les evenements apparaitront ici lorsqu'ils seront crees dans la base de donnees." /> : (
        <section className="relative mb-10 min-h-[420px] overflow-hidden rounded-[32px] border border-white/10">
          <EventCover event={featured} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100c1a] via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <span className="glass rounded-full px-4 py-2 text-xs font-bold uppercase text-[var(--gold)]">{featured.status}</span>
            <h1 className="mt-5 text-4xl font-black text-white">{featured.title}</h1>
            <p className="mt-2 text-[var(--muted)]">{featured.venue ?? "Lieu a definir"} · {featured.city ?? "Ville a definir"}</p>
            <Link href="/dashboard/events/details" className="mt-6 inline-flex"><Button>Voir les details</Button></Link>
          </div>
        </section>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <article key={event.id} className="glass overflow-hidden rounded-[24px]">
            <div className="relative h-48"><EventCover event={event} /></div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase text-[var(--gold)]">{event.category}</p>
              <h2 className="mt-2 font-black text-white">{event.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]"><CalendarDays size={16} /> {event.starts_at ? new Date(event.starts_at).toLocaleString("fr-FR") : "Date a definir"}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]"><MapPin size={16} /> {event.venue ?? "Lieu a definir"}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function EventDetailsPage() {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.events().then((res) => setEvent(dataOf(res)[0] ?? null)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageShell title="Details evenement" back="/dashboard/events"><EventDetailsSkeleton /></PageShell>;

  return (
    <PageShell title="Details evenement" back="/dashboard/events">
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {!event ? <EmptyState title="Aucun evenement en base" body="Creez un evenement cote backend pour afficher cette page." /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="glass overflow-hidden rounded-[28px]">
            <div className="relative h-80"><EventCover event={event} /></div>
            <div className="p-6">
              <h1 className="text-3xl font-black text-white">{event.title}</h1>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{event.description ?? "Aucune description renseignee en base."}</p>
            </div>
          </article>
          <aside className="glass h-max rounded-[28px] p-6">
            <p className="font-black text-white">Votre acces</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Places limitees. Les invitations confirmees generent un pass digital.</p>
            <Link href="/dashboard/invitations" className="mt-6 inline-flex w-full"><Button className="w-full">Mes invitations</Button></Link>
          </aside>
        </div>
      )}
    </PageShell>
  );
}

export function InvitationsPage() {
  const [items, setItems] = useState<EventInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.eventInvitations().then((res) => setItems(dataOf(res))).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  async function respond(invitation: EventInvitation, status: "accepted" | "declined") {
    const updated = await api.respondInvitation(invitation.id, status).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (updated) setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
  }

  if (loading) return <PageShell title="Invitations" back="/dashboard/events"><InvitationsSkeleton /></PageShell>;

  const pending = items.filter((item) => item.status === "pending");
  const confirmed = items.filter((item) => item.status === "accepted");

  return (
    <PageShell title="Invitations" back="/dashboard/events">
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-black text-white">En attente</h2>
          {pending.length === 0 ? <EmptyState title="Aucune invitation en attente" body="Les invitations viendront de la base de donnees." /> : null}
          <div className="space-y-4">
            {pending.map((invitation) => (
              <article key={invitation.id} className="glass flex gap-4 rounded-[24px] p-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white"><Ticket /></span>
                <div className="flex-1">
                  <h3 className="font-black text-white">{invitation.event?.title ?? "Evenement"}</h3>
                  <p className="text-sm text-[var(--muted)]">{invitation.event?.venue ?? "Lieu a definir"}</p>
                  <div className="mt-3 flex gap-2">
                    <Button className="min-h-10 px-4" onClick={() => respond(invitation, "accepted")}>Accepter</Button>
                    <Button variant="secondary" className="min-h-10 px-4" onClick={() => respond(invitation, "declined")}>Decliner</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-xl font-black text-white">Confirmees</h2>
          {confirmed.length === 0 ? <EmptyState title="Aucun billet confirme" body="Acceptez une invitation pour generer un pass digital." /> : confirmed.map((invitation) => (
            <Link key={invitation.id} href="/dashboard/ticket" className="glass mb-3 flex items-center justify-between rounded-[24px] p-5 text-white">
              <span className="flex items-center gap-3"><Ticket className="text-[var(--gold)]" /> {invitation.event?.title ?? "Evenement confirme"}</span>
              <ChevronRight />
            </Link>
          ))}
        </section>
      </div>
    </PageShell>
  );
}

export function TicketPage() {
  const [ticket, setTicket] = useState<EventInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.eventInvitations()
      .then((res) => setTicket(dataOf(res).find((item) => item.status === "accepted") ?? null))
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageShell title="Billet evenement" back="/dashboard/invitations"><TicketSkeleton /></PageShell>;

  return (
    <PageShell title="Billet evenement" back="/dashboard/invitations">
      {notice ? <div className="mb-4"><Notice kind="error">{notice}</Notice></div> : null}
      {!ticket ? <EmptyState title="Aucun billet en base" body="Un billet apparaitra ici apres acceptation d'une invitation." /> : (
        <article className="glass mx-auto max-w-xl overflow-hidden rounded-[32px]">
          <div className="relative h-56">{ticket.event ? <EventCover event={ticket.event} /> : null}</div>
          <div className="p-6">
            <h1 className="text-2xl font-black text-white">{ticket.event?.title ?? "Pass Digital US"}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">ID: {ticket.ticket_code ?? "Non genere"} · {ticket.event?.venue ?? "Lieu a definir"}</p>
            <div className="mt-6 flex aspect-square items-center justify-center rounded-[28px] bg-white p-8 text-[#100c1a]">
              <QrCode size={180} />
            </div>
          </div>
        </article>
      )}
    </PageShell>
  );
}

export function ClubPage() {
  return (
    <PageShell title="Club prive US">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <Crown className="text-[var(--gold)]" size={42} />
          <h1 className="mt-4 text-4xl font-black text-white">Avantages Club Prive</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Les avantages sont debloques par les plans premium stockes en base.</p>
          <Link href="/dashboard/premium" className="mt-6 inline-flex"><Button variant="premium">Voir les plans</Button></Link>
        </div>
        <div className="grid gap-4">
          {["Invitations exclusives", "Badge prestige", "Boosts prioritaires", "Filtres avances"].map((item) => (
            <article key={item} className="glass rounded-[24px] p-5"><Star className="text-[var(--gold)]" /><p className="mt-3 font-black text-white">{item}</p></article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function PremiumLitePage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.plans().then((plans) => setPlan(plans.find((item) => item.name.toLowerCase().includes("lite")) ?? plans[0] ?? null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageShell title="Abonnement Lite" back="/dashboard/premium"><CompactPlanSkeleton /></PageShell>;

  return (
    <PageShell title="Abonnement Lite" back="/dashboard/premium">
      {!plan ? <EmptyState title="Aucun plan en base" body="Ajoutez un plan actif pour afficher cet abonnement." /> : (
        <article className="glass mx-auto max-w-xl rounded-[32px] p-6">
          <Crown className="text-[var(--primary-soft)]" size={36} />
          <h1 className="mt-4 text-3xl font-black text-white">{plan.name}</h1>
          <p className="mt-2 text-4xl font-black text-gradient">{(plan.price_cents / 100).toLocaleString("fr-FR")} {plan.currency ?? "XAF"}</p>
          <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
            {(plan.features ?? []).map((item) => <li key={item} className="flex gap-2"><Check size={17} /> {item}</li>)}
          </ul>
          <Link href="/dashboard/premium" className="mt-6 inline-flex w-full"><Button className="w-full">Continuer vers paiement</Button></Link>
        </article>
      )}
    </PageShell>
  );
}

export function VerificationCenterPage() {
  const [items, setItems] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const selfie = items.find((item) => item.type === "selfie");

  useEffect(() => {
    api.verificationStatus()
      .then(setItems)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Verification">
      <Notice>Les documents et selfies sont confidentiels. Les autres utilisateurs ne voient jamais ces fichiers.</Notice>
      {loading ? <div className="mt-4"><Spinner label="Chargement du statut..." /></div> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/verification/selfie" className="glass rounded-[24px] p-6 text-white"><Camera className="text-[var(--primary-soft)]" /><h2 className="mt-4 font-black">Selfie de verification</h2><p className="mt-2 text-sm text-[var(--muted)]">{selfie ? `Statut: ${selfie.status}` : "Capture faciale guidee."}</p></Link>
        <Link href="/dashboard/verification/document" className="glass rounded-[24px] p-6 text-white"><FileText className="text-[var(--gold)]" /><h2 className="mt-4 font-black">Choix du document</h2><p className="mt-2 text-sm text-[var(--muted)]">Carte nationale, passeport ou carte etudiante.</p></Link>
      </div>
    </PageShell>
  );
}

export function VerificationSelfiePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function startCamera() {
    setNotice("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setNotice("Impossible d'acceder a la camera. Verifiez les permissions du navigateur.");
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (preview) URL.revokeObjectURL(preview);
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      setSelfieFile(file);
      setPreview(URL.createObjectURL(file));
    }, "image/jpeg", 0.92);
  }

  async function submit() {
    if (!selfieFile) {
      setNotice("Capturez un selfie avant d'envoyer la verification.");
      return;
    }
    if (!consent) {
      setNotice("Confirmez le consentement avant l'envoi.");
      return;
    }
    setLoading(true);
    setNotice("");
    const response = await api.submitSelfie(selfieFile).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (response) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setNotice("Selfie envoye. Statut: en attente de moderation.");
    }
    setLoading(false);
  }

  return (
    <PageShell title="Selfie" back="/dashboard/verification">
      <div className="glass mx-auto max-w-2xl rounded-[32px] p-6">
        <h1 className="text-2xl font-black text-white">Selfie de verification</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Votre selfie sert uniquement a verifier que le compte represente une personne reelle. Il n&apos;est pas visible par les autres utilisateurs.</p>
        {notice ? <div className="mt-4"><Notice kind={notice.includes("envoye") ? "success" : "error"}>{notice}</Notice></div> : null}
        <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selfie capture" className="aspect-[4/5] w-full object-cover" />
          ) : (
            <video ref={videoRef} playsInline muted className="aspect-[4/5] w-full bg-[#0f0b16] object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <label className="mt-5 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-[var(--muted)]">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-[#d7263d]" />
          J&apos;accepte que ce selfie soit envoye a US pour verification confidentielle. Les autres utilisateurs ne pourront pas le consulter.
        </label>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Button type="button" variant="secondary" onClick={startCamera}>Ouvrir camera</Button>
          <Button type="button" variant="secondary" onClick={capture}>Capturer</Button>
          <Button type="button" disabled={loading} onClick={submit}>{loading ? "Envoi..." : "Envoyer"}</Button>
        </div>
      </div>
    </PageShell>
  );
}

export function VerificationDocumentPage() {
  return (
    <PageShell title="Choix du document" back="/dashboard/verification">
      <div className="grid gap-4 md:grid-cols-3">
        {["Carte nationale", "Passeport", "Carte etudiante"].map((doc) => (
          <article key={doc} className="glass rounded-[24px] p-6">
            <FileText className="text-[var(--gold)]" />
            <h2 className="mt-4 font-black text-white">{doc}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Upload prepare pour une version future.</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function VerificationApprovedPage() {
  return (
    <PageShell title="Verification approuvee" back="/dashboard/verification">
      <div className="glass mx-auto max-w-xl rounded-[32px] p-8 text-center">
        <BadgeCheck className="mx-auto text-[var(--gold)]" size={72} />
        <h1 className="mt-5 text-3xl font-black text-white">Verification en attente</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Votre demande est envoyee et attend une moderation. Le badge approuve sera active apres validation.</p>
        <Link href="/dashboard/profile" className="mt-6 inline-flex"><Button>Retour profil</Button></Link>
      </div>
    </PageShell>
  );
}

export function SettingsPremiumPage() {
  return (
    <PageShell title="Reglages premium" back="/dashboard/settings">
      <div className="glass max-w-2xl rounded-[28px] p-6">
        <h1 className="text-2xl font-black text-white">Controle premium</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Ces options seront synchronisees avec les abonnements presents en base.</p>
        <div className="mt-6 space-y-3">
          {["Mode invisible", "Masquer la distance floutee", "Recevoir les invitations club"].map((item) => (
            <label key={item} className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-sm font-bold text-white">
              {item}
              <input type="checkbox" className="h-5 w-5 accent-[#d7263d]" />
            </label>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function AccessRefusalInAppPage() {
  return (
    <PageShell title="Acces refuse">
      <div className="glass mx-auto max-w-xl rounded-[28px] p-8 text-center">
        <Lock className="mx-auto text-[#ffb4ab]" size={62} />
        <h1 className="mt-4 text-3xl font-black text-white">Acces restreint</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Votre session ne permet pas d&apos;acceder a cet espace pour le moment.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard/premium"><Button variant="premium">Voir Premium</Button></Link>
          <Link href="/dashboard/discovery"><Button variant="secondary">Retour</Button></Link>
        </div>
      </div>
    </PageShell>
  );
}
