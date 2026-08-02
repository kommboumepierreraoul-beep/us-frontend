"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Calendar, Camera, Code2, Coffee, Dumbbell, Film, Gamepad2, GraduationCap, Heart, KeyRound, Languages, Lock, Mail, Music, Palette, Plane, ShieldCheck, Sparkles, UserRound, Utensils, type LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError, storeSession } from "@/services/api";
import type { University } from "@/types/api";
import { BrandMark } from "@/components/ui/brand";
import { Button, Field, Notice, ProgressBar, Select, Spinner, TextArea, TextInput, Toggle } from "@/components/ui/primitives";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
let googleScriptPromise: Promise<void> | null = null;

const interestOptions: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "musique", label: "Musique", icon: Music },
  { value: "sport", label: "Sport", icon: Dumbbell },
  { value: "lecture", label: "Lecture", icon: BookOpen },
  { value: "tech", label: "Tech", icon: Code2 },
  { value: "cafe", label: "Cafe", icon: Coffee },
  { value: "cinema", label: "Cinema", icon: Film },
  { value: "cuisine", label: "Cuisine", icon: Utensils },
  { value: "art", label: "Art", icon: Palette },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "voyage", label: "Voyage", icon: Plane },
];

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Google indisponible cote serveur."));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Chargement Google impossible.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Chargement Google impossible."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <header className="flex flex-col items-center gap-5 py-8 text-center">
        <BrandMark />
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
        </div>
      </header>
      <section className="flex flex-1 flex-col justify-center">{children}</section>
    </main>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Impossible de joindre le backend Laravel pour le moment.";
}

function OtpInput({ value, onChange, label = "Code OTP" }: { value: string; onChange: (value: string) => void; label?: string }) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  function updateDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function pasteDigits(raw: string) {
    const pasted = raw.replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 6) - 1]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  }

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">{label}</p>
      <div className="grid grid-cols-6 gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onPaste={(event) => {
              event.preventDefault();
              pasteDigits(event.clipboardData.getData("text"));
            }}
            onKeyDown={(event) => handleKeyDown(index, event)}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            aria-label={`${label} chiffre ${index + 1}`}
            className="h-14 rounded-2xl border border-white/10 bg-white/8 text-center text-xl font-black text-white outline-none transition focus:border-[var(--primary-soft)] focus:bg-white/12"
          />
        ))}
      </div>
    </div>
  );
}

function GoogleAuthButton({ onError }: { onError: (message: string) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signIn() {
    onError("");

    if (!googleClientId) {
      onError("Configurez NEXT_PUBLIC_GOOGLE_CLIENT_ID dans frontend/.env.local.");
      return;
    }

    setLoading(true);
    try {
      await loadGoogleIdentityScript();
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        ux_mode: "popup",
        callback: async (response) => {
          if (!response.credential) {
            onError("Google n'a pas retourne de jeton d'identite.");
            setLoading(false);
            return;
          }

          try {
            const auth = await api.google(response.credential);
            storeSession(auth);
            router.push(auth.requires_profile ? "/onboarding" : auth.email_verification_required ? "/verify-email" : "/dashboard/discovery");
          } catch (err) {
            onError(errorMessage(err));
          } finally {
            setLoading(false);
          }
        },
      });
      window.google?.accounts.id.prompt();
    } catch (err) {
      onError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" className="mt-6 w-full" onClick={signIn} disabled={loading}>
      {loading ? "Connexion Google..." : "Continuer avec Google"}
    </Button>
  );
}

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = await api.login({ email, password });
      storeSession(auth);
      router.push(auth.email_verification_required ? "/verify-email" : "/dashboard/discovery");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame title="Ravi de vous revoir" subtitle="Entrez dans le cercle de l'excellence academique.">
      <form onSubmit={submit} className="space-y-4">
        {error ? <Notice kind="error">{error}</Notice> : null}
        <Field label="Email universitaire" icon={<GraduationCap size={20} />}>
          <TextInput name="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="nom.prenom@univ.cm" required />
        </Field>
        <Field label="Mot de passe" icon={<Lock size={20} />}>
          <TextInput name="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="........" required />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-bold text-[var(--primary-soft)] hover:text-white">
            Mot de passe oublie ?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"} <ArrowRight size={18} />
        </Button>
      </form>
      <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-[0.05em] text-white/35">
        <span className="h-px flex-1 bg-white/10" /> ou <span className="h-px flex-1 bg-white/10" />
      </div>
      <GoogleAuthButton onError={setError} />
      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Nouveau sur US ? <Link href="/register" className="font-bold text-[var(--primary-soft)]">Creer un compte</Link>
      </p>
    </AuthFrame>
  );
}

export function RegisterView() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(true);
  const [step, setStep] = useState<"account" | "email" | "profile" | "intentions" | "photos" | "safety">("account");
  const [otpCode, setOtpCode] = useState("");
  const [otpDebug, setOtpDebug] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    first_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    birth_date: "",
    gender: "",
    university_id: "",
    looking_for: "",
    bio: "",
    study_level: "",
    languages: "",
    intentions: "",
    interests: "",
    min_age: 18,
    max_age: 35,
    radius_km: 25,
    preferred_gender: "",
    same_university_only: false,
    age_confirmed: false,
    terms_accepted: false,
    authentic_profile: false,
    community_rules: false,
    private_documents: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.universities()
      .then((res) => setUniversities(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setUniversitiesLoading(false));
  }, []);

  function choosePhotos(files: FileList | null) {
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    const images = Array.from(files ?? []).slice(0, 6);
    setSelectedPhotos(images);
    setPhotoPreviews(images.map((file) => URL.createObjectURL(file)));
  }

  const steps = [
    { key: "account", label: "Compte" },
    { key: "email", label: "OTP" },
    { key: "profile", label: "Profil" },
    { key: "intentions", label: "Intentions" },
    { key: "photos", label: "Photos" },
    { key: "sûrete", label: "Surete" },
  ];
  const stepIndex = ["account", "email", "profile", "intentions", "photos", "safety"].indexOf(step);
  const progress = ((stepIndex + 1) / 6) * 100;

  function splitList(value: string) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function toggleInterest(value: string) {
    const current = splitList(form.interests);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setForm({ ...form, interests: next.join(", ") });
  }

  function isAdult(date: string) {
    if (!date) return false;
    const birthDate = new Date(date);
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() - 18);
    return birthDate <= limit;
  }

  function validateAccount() {
    setError("");
    if (!form.first_name || !form.email || !form.password || !form.birth_date || !form.gender) {
      setError("Completez toutes les informations de compte avant de continuer.");
      return false;
    }
    if (!isAdult(form.birth_date) || !form.age_confirmed) {
      setError("US est reserve aux adultes de 18 ans et plus.");
      return false;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return false;
    }
    if (form.password !== form.password_confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return false;
    }
    if (!form.terms_accepted) {
      setError("Acceptez les conditions d'utilisation pour creer votre compte.");
      return false;
    }
    return true;
  }

  async function createAccount(event: FormEvent) {
    event.preventDefault();
    if (!validateAccount()) return;
    setError("");
    setLoading(true);
    try {
      const auth = await api.register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        birth_date: form.birth_date,
        gender: form.gender,
      });
      storeSession(auth);
      setOtpDebug(auth.otp_debug?.code ?? "");
      setStep("email");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (otpCode.length !== 6) {
      setError("Entrez les 6 chiffres du code OTP.");
      return;
    }
    setLoading(true);
    try {
      await api.verifyEmail(otpCode);
      setStep("profile");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.university_id || !form.study_level || !form.bio) {
      setError("Completez votre universite, votre niveau et votre bio.");
      return;
    }
    setLoading(true);
    const updated = await api.updateProfile({
      first_name: form.first_name,
      gender: form.gender,
      university_id: Number(form.university_id),
      study_level: form.study_level,
      bio: form.bio,
    }).catch((err) => {
      setError(errorMessage(err));
      return null;
    });
    if (updated) setStep("intentions");
    setLoading(false);
  }

  async function saveIntentions(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.looking_for || !form.interests) {
      setError("Ajoutez au moins ce que vous recherchez et quelques centres d'interet.");
      return;
    }
    if (form.max_age < form.min_age) {
      setError("L'age maximum doit etre superieur ou egal a l'age minimum.");
      return;
    }
    setLoading(true);
    const profile = await api.updateProfile({
      looking_for: form.looking_for,
      languages: splitList(form.languages),
      intentions: splitList(form.intentions),
      interests: splitList(form.interests),
    }).catch((err) => {
      setError(errorMessage(err));
      return null;
    });
    const preferences = profile ? await api.updatePreferences({
      min_age: form.min_age,
      max_age: form.max_age,
      radius_km: form.radius_km,
      gender: null,
      same_university_only: form.same_university_only,
    }).catch((err) => {
      setError(errorMessage(err));
      return null;
    }) : null;
    if (profile && preferences) setStep("photos");
    setLoading(false);
  }

  async function savePhoto(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (selectedPhotos.length < 2) {
      setError("Ajoutez au moins 2 photos pour finaliser l'inscription.");
      return;
    }
    setLoading(true);
    const photos = await api.uploadPhotos(selectedPhotos, { is_primary: true }).catch((err) => {
      setError(errorMessage(err));
      return null;
    });
    if (photos) setStep("safety");
    setLoading(false);
  }

  function completeSafety(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.authentic_profile || !form.community_rules || !form.private_documents) {
      setError("Confirmez les trois engagements de securite pour terminer.");
      return;
    }
    router.push("/dashboard/verification");
  }

  function back() {
    setError("");
    const order = ["account", "email", "profile", "intentions", "photos", "safety"] as const;
    const previous = order[Math.max(0, stepIndex - 1)];
    setStep(previous);
  }

  const stepMeta = {
    account: {
      title: "Creons votre acces securise",
      body: "Comme les grandes apps de rencontre, on confirme d'abord votre age, vos conditions et votre compte.",
    },
    email: {
      title: "Verifiez votre email",
      body: "Entrez le code OTP recu. Votre profil ne s'ouvre qu'apres cette verification.",
    },
    profile: {
      title: "Votre profil campus",
      body: "Ajoutez les informations qui rendent votre profil credible et humain.",
    },
    intentions: {
      title: "Vos intentions",
      body: "Dites ce que vous cherchez pour ameliorer les recommandations.",
    },
    photos: {
      title: "Vos photos",
      body: "Ajoutez au moins 2 photos. Elles defileront en carrousel dans la decouverte.",
    },
    safety: {
      title: "Verification de confiance",
      body: "Derniere etape: engagements de securite et passage vers le centre de verification.",
    },
  }[step];

  return (
    <AuthFrame title={stepMeta.title} subtitle={stepMeta.body}>
      <div className="mb-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">
          <span>Etape {stepIndex + 1}/6</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
      <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {steps.map((item, index) => {
          const active = stepIndex >= index;
          return (
            <div key={item.label} className={`rounded-full px-2 py-2 text-center text-[10px] font-bold ${active ? "bg-[var(--primary)] text-white" : "bg-white/10 text-[var(--muted)]"}`}>
              {item.label}
            </div>
          );
        })}
      </div>

      <form onSubmit={
        step === "account" ? createAccount :
          step === "email" ? verify :
            step === "profile" ? saveProfile :
              step === "intentions" ? saveIntentions :
                step === "photos" ? savePhoto :
                  completeSafety
      } className="space-y-4">
        {error ? <Notice kind="error">{error}</Notice> : null}
        {loading ? <Spinner label="Enregistrement..." /> : null}

        {step === "account" ? (
          <>
            <Notice>US est reserve aux adultes de 18 ans et plus. Votre email devra etre verifie avant l&apos;acces au profil.</Notice>
            <Field label="Prenom" icon={<UserRound size={20} />}>
              <TextInput name="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Votre prenom" required />
            </Field>
            <Field label="Email" icon={<Mail size={20} />}>
              <TextInput name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="nom.prenom@univ.cm" required />
            </Field>
            <Field label="Date de naissance" icon={<Calendar size={20} />}>
              <TextInput name="birth_date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} type="date" required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Genre">
                <Select name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Choisir</option>
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                </Select>
              </Field>
              <Field label="Mot de passe" icon={<KeyRound size={20} />}>
                <TextInput name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" minLength={8} required />
              </Field>
            </div>
            <Field label="Confirmer le mot de passe" icon={<Lock size={20} />}>
              <TextInput name="password_confirmation" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} type="password" minLength={8} required />
            </Field>
            <Toggle checked={form.age_confirmed} onChange={(checked) => setForm({ ...form, age_confirmed: checked })} label="Je confirme avoir 18 ans ou plus" />
            <Toggle checked={form.terms_accepted} onChange={(checked) => setForm({ ...form, terms_accepted: checked })} label="J'accepte les conditions, la confidentialite et les regles US" />
          </>
        ) : null}

        {step === "email" ? (
          <>
            <Notice kind="success">
              Compte cree. Entrez le code OTP envoye a {form.email}.
              {otpDebug ? ` Code dev: ${otpDebug}` : ""}
            </Notice>
            <OtpInput value={otpCode} onChange={setOtpCode} />
          </>
        ) : null}

        {step === "profile" ? (
          <>
            {universitiesLoading ? <Spinner label="Chargement des universites..." /> : null}
            <Field label="Universite" icon={<GraduationCap size={20} />}>
              <Select name="university_id" value={form.university_id} onChange={(e) => setForm({ ...form, university_id: e.target.value })} disabled={universitiesLoading}>
                <option value="">{universities.length ? "Choisir" : "Aucune universite en base"}</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Niveau d'etudes" icon={<BookOpen size={20} />}>
              <TextInput name="study_level" value={form.study_level} onChange={(e) => setForm({ ...form, study_level: e.target.value })} placeholder="Licence 3, Master, Doctorat..." />
            </Field>
            <Field label="bio">
              <TextArea name="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Parlez de vous, votre campus, vos passions..." maxLength={500} />
            </Field>
          </>
        ) : null}

        {step === "intentions" ? (
          <>
            <Field label="Ce que vous recherchez" icon={<Heart size={20} />}>
              <Select name="looking_for" value={form.looking_for} onChange={(e) => setForm({ ...form, looking_for: e.target.value })}>
                <option value="">Choisir</option>
                <option value="serious">Relation serieuse</option>
                <option value="friends">Amitie</option>
                <option value="discover">Decouverte</option>
              </Select>
            </Field>
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
            <Field label="Intentions" icon={<Sparkles size={20} />}>
              <TextInput name="intentions" value={form.intentions} onChange={(e) => setForm({ ...form, intentions: e.target.value })} placeholder="prendre-le-temps, relation-serieuse" />
            </Field>
            <Field label="Langues" icon={<Languages size={20} />}>
              <TextInput name="languages" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="fr, en" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Min"><TextInput type="number" min={18} value={form.min_age} onChange={(e) => setForm({ ...form, min_age: Number(e.target.value) })} /></Field>
              <Field label="Max"><TextInput type="number" min={18} value={form.max_age} onChange={(e) => setForm({ ...form, max_age: Number(e.target.value) })} /></Field>
              <Field label="Km"><TextInput type="number" min={1} value={form.radius_km} onChange={(e) => setForm({ ...form, radius_km: Number(e.target.value) })} /></Field>
            </div>
            <Notice>La decouverte est automatique: les hommes voient les profils femmes, et les femmes voient les profils hommes.</Notice>
            <Toggle checked={form.same_university_only} onChange={(checked) => setForm({ ...form, same_university_only: checked })} label="Afficher en priorite les profils de ma communaute universitaire" />
          </>
        ) : null}

        {step === "photos" ? (
          <>
            <Notice>Ajoutez au moins 2 photos depuis votre appareil. Elles seront envoyees au backend et stockees sur Cloudinary.</Notice>
            {photoPreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {photoPreviews.map((preview, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={preview} src={preview} alt={`Apercu photo ${index + 1}`} className="aspect-[3/4] rounded-[18px] object-cover" />
                ))}
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-[24px] border border-dashed border-white/20 bg-white/5">
                <Camera className="text-white/30" size={54} />
              </div>
            )}
            <Field label="Photos de profil" icon={<Camera size={20} />}>
              <TextInput
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => choosePhotos(e.target.files)}
              />
            </Field>
            <p className="text-xs leading-5 text-[var(--muted)]">{selectedPhotos.length}/6 selectionnees. Minimum requis: 2 photos. La premiere sera la photo principale.</p>
          </>
        ) : null}

        {step === "safety" ? (
          <>
            <Notice kind="success">Email verifie, profil initialise. Pour terminer, confirmez les engagements de confiance avant le centre de verification.</Notice>
            <Toggle checked={form.authentic_profile} onChange={(checked) => setForm({ ...form, authentic_profile: checked })} label="Mon profil represente une personne reelle et majeure" />
            <Toggle checked={form.community_rules} onChange={(checked) => setForm({ ...form, community_rules: checked })} label="J'accepte les regles: respect, consentement, signalement" />
            <Toggle checked={form.private_documents} onChange={(checked) => setForm({ ...form, private_documents: checked })} label="Je comprends que les documents de verification restent confidentiels" />
          </>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-2">
          {step !== "account" && step !== "email" ? <Button variant="secondary" onClick={back}><ArrowLeft size={18} /> Retour</Button> : <span />}
          <Button type="submit" className="w-full" disabled={loading}>
            {step === "account" ? "Creer le compte" :
              step === "email" ? "Verifier l'email" :
              step === "photos" ? "Ajouter les photos" :
                  step === "safety" ? "Ouvrir la verification" :
                    "Continuer"} {step === "email" ? <ShieldCheck size={18} /> : step === "safety" ? <BadgeCheck size={18} /> : <ArrowRight size={18} />}
          </Button>
        </div>
      </form>
      {step === "account" ? (
        <>
          <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-[0.05em] text-white/35">
            <span className="h-px flex-1 bg-white/10" /> ou <span className="h-px flex-1 bg-white/10" />
          </div>
          <GoogleAuthButton onError={setError} />
        </>
      ) : null}
      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Deja membre ? <Link href="/login" className="font-bold text-[var(--primary-soft)]">Se connecter</Link>
      </p>
    </AuthFrame>
  );
}

export function VerifyEmailView() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Entrez les 6 chiffres du code OTP.");
      return;
    }
    try {
      await api.verifyEmail(code);
      router.push("/onboarding");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function resend() {
    setError("");
    const res = await api.resendEmailOtp().catch((err) => {
      setError(errorMessage(err));
      return null;
    });
    if (res) setMessage(`Code envoye.${res.otp_debug?.code ? ` Code dev: ${res.otp_debug.code}` : ""}`);
  }

  return (
    <AuthFrame title="Verification email" subtitle="Saisissez le code recu pour activer votre compte.">
      <form onSubmit={submit} className="space-y-4">
        {error ? <Notice kind="error">{error}</Notice> : null}
        {message ? <Notice kind="success">{message}</Notice> : null}
        <OtpInput value={code} onChange={setCode} />
        <Button type="submit" className="w-full">Verifier</Button>
        <Button variant="secondary" className="w-full" onClick={resend}>Renvoyer le code</Button>
      </form>
    </AuthFrame>
  );
}

export function ForgotPasswordView() {
  const [step, setStep] = useState<"email" | "code" | "password" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    await sendResetCode();
  }

  async function sendResetCode() {
    setError("");
    setMessage("");
    setLoading(true);
    const res = await api.forgotPassword(email).catch((err) => {
      setError(errorMessage(err));
      return null;
    });
    if (res) {
      setMessage(`Code envoye.${res.otp_debug?.code ? ` Code dev: ${res.otp_debug.code}` : ""}`);
      setStep("code");
    }
    setLoading(false);
  }

  function verifyCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Entrez les 6 chiffres du code.");
      return;
    }
    setStep("password");
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== passwordConfirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ email, code, password, password_confirmation: passwordConfirmation });
      setMessage("Mot de passe reinitialise. Vous pouvez vous connecter.");
      setStep("done");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const progress = step === "email" ? 25 : step === "code" ? 50 : step === "password" ? 75 : 100;

  return (
    <AuthFrame title="Reinitialisation" subtitle="Recuperez votre acces etape par etape avec un code securise.">
      <div className="mb-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.05em] text-[var(--muted)]">
          <span>{step === "email" ? "Email" : step === "code" ? "Code OTP" : step === "password" ? "Mot de passe" : "Termine"}</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {error ? <div className="mb-4"><Notice kind="error">{error}</Notice></div> : null}
      {message ? <div className="mb-4"><Notice kind="success">{message}</Notice></div> : null}
      {loading ? <div className="mb-4"><Spinner label="Verification..." /></div> : null}

      {step === "email" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <Field label="Email" icon={<Mail size={20} />}>
            <TextInput name="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Field>
          <Button type="submit" variant="secondary" className="w-full" disabled={loading}>Recevoir un code</Button>
        </form>
      ) : null}

      {step === "code" ? (
        <form onSubmit={verifyCode} className="space-y-4">
          <OtpInput value={code} onChange={setCode} />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setStep("email")}><ArrowLeft size={18} /> Retour</Button>
            <Button type="submit">Continuer <ArrowRight size={18} /></Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={sendResetCode}>Renvoyer le code</Button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={reset} className="space-y-4">
          <Field label="Nouveau mot de passe" icon={<Lock size={20} />}>
            <TextInput name="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required />
          </Field>
          <Field label="Confirmer le mot de passe" icon={<ShieldCheck size={20} />}>
            <TextInput name="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} type="password" minLength={8} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setStep("code")}><ArrowLeft size={18} /> Retour</Button>
            <Button type="submit" disabled={loading}>Changer</Button>
          </div>
        </form>
      ) : null}

      {step === "done" ? (
        <Link href="/login" className="block"><Button className="w-full">Retour connexion</Button></Link>
      ) : null}

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Mot de passe retrouve ? <Link href="/login" className="font-bold text-[var(--primary-soft)]">Retour connexion</Link>
      </p>
    </AuthFrame>
  );
}
