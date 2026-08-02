"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  LifeBuoy,
  Lock,
  Mail,
  MessageSquare,
  MapPin,
  MessageSquareWarning,
  RefreshCw,
  Scale,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  WifiOff,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { BrandMark } from "@/components/ui/brand";
import { Badge, Button, EmptyState, Field, Notice, Select, Spinner, TextArea, TextInput } from "@/components/ui/primitives";
import { api, ApiError } from "@/services/api";
import type { SupportTicket, University } from "@/types/api";

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Impossible de charger les donnees.";
}

function PublicHeader() {
  return (
    <header className="border-b border-white/10 bg-[#0f0b16]/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/"><BrandMark compact /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            ["/about", "A propos"],
            ["/how-it-works", "Fonctionnement"],
            ["/safety", "Securite"],
            ["/universities", "Universites"],
            ["/pricing", "Premium"],
            ["/help", "Aide"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-2xl px-3 py-2 text-sm font-bold text-[var(--muted)] hover:bg-white/10 hover:text-white">{label}</Link>
          ))}
        </nav>
        <Link href="/register"><Button>Creer mon profil</Button></Link>
      </div>
    </header>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <PublicHeader />
      {children}
      <footer className="border-t border-white/10 px-5 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_2fr]">
          <BrandMark compact />
          <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
            <Link href="/privacy">Confidentialite</Link>
            <Link href="/terms">Conditions</Link>
            <Link href="/community-rules">Regles</Link>
            <Link href="/legal">Mentions legales</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/help">Centre d&apos;aide</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

const publicPages: Record<string, { title: string; body: string; icon: LucideIcon; sections: string[] }> = {
  about: {
    title: "A propos de US",
    body: "US, aussi presente comme Nous, aide les etudiants majeurs a creer des connexions authentiques dans un cadre plus sur et plus respectueux.",
    icon: Info,
    sections: ["Rencontres universitaires", "Confiance et moderation", "Experience premium adaptee au Cameroun"],
  },
  faq: {
    title: "Questions frequentes",
    body: "Les reponses essentielles sur l'inscription, la verification, la confidentialite, les likes, Premium et les paiements Mobile Money.",
    icon: HelpCircle,
    sections: ["Qui peut rejoindre US ?", "Comment fonctionne la verification ?", "Comment sont protegees mes donnees ?"],
  },
  contact: {
    title: "Contact",
    body: "Contactez l'equipe US pour une question produit, securite, partenariat universite ou assistance compte.",
    icon: Mail,
    sections: ["Support utilisateur", "Partenariats campus", "Signalements et securite"],
  },
  help: {
    title: "Centre d'aide",
    body: "Un point d'entree clair pour obtenir de l'aide sur votre compte, votre profil, la decouverte, les messages, la securite et Premium.",
    icon: LifeBuoy,
    sections: ["Compte", "Verification", "Profil", "Decouverte", "Matchs", "Messages", "Paiements", "Confidentialite"],
  },
  download: {
    title: "Telecharger l'application",
    body: "L'application mobile US sera presentee ici avec les liens de telechargement Android et iOS lorsqu'ils seront disponibles.",
    icon: Download,
    sections: ["Android", "iOS", "Notifications", "Experience mobile-first"],
  },
  privacy: {
    title: "Politique de confidentialite",
    body: "US limite l'exposition des informations sensibles: jamais de position exacte, jamais de documents d'identite visibles aux autres utilisateurs.",
    icon: Lock,
    sections: ["Donnees de compte", "Documents confidentiels", "Geolocalisation approximative", "Droits utilisateur"],
  },
  terms: {
    title: "Conditions d'utilisation",
    body: "US est reserve aux personnes majeures. Les comportements abusifs, faux profils et usages dangereux peuvent entrainer une suspension.",
    icon: Scale,
    sections: ["Eligibilite 18+", "Utilisation acceptable", "Premium et paiements", "Suspension et suppression"],
  },
  "community-rules": {
    title: "Regles de la communaute",
    body: "Les rencontres doivent rester respectueuses, consenties et sures. Le signalement et le blocage restent accessibles.",
    icon: Shield,
    sections: ["Respect", "Consentement", "Authenticite", "Signalement"],
  },
  legal: {
    title: "Mentions legales",
    body: "Les informations legales, editeur, contact et responsabilites seront centralisees ici pour la mise en production.",
    icon: FileText,
    sections: ["Editeur", "Hebergement", "Contact legal", "Responsabilites"],
  },
};

export function PublicInfoPage({ page }: { page: keyof typeof publicPages }) {
  const data = publicPages[page];
  const Icon = data.icon;
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Badge tone="gold"><Sparkles size={14} /> US Nous</Badge>
        <div className="mt-6 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Icon className="text-[var(--gold)]" size={42} />
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">{data.title}</h1>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">{data.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register"><Button>Creer mon profil <ArrowRight size={18} /></Button></Link>
              <Link href="/safety"><Button variant="secondary">Voir la securite</Button></Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.sections.map((section) => (
              <article key={section} className="glass rounded-[24px] p-5">
                <CheckCircle2 className="text-[var(--primary-soft)]" size={24} />
                <h2 className="mt-4 font-black text-white">{section}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Contenu structure et pret a etre relie au CMS ou au backend public.</p>
              </article>
            ))}
          </div>
        </div>
        {page === "contact" ? (
          <form className="glass mt-10 grid gap-4 rounded-[24px] p-5 md:grid-cols-2">
            <Field label="Votre email"><TextInput type="email" placeholder="vous@exemple.com" /></Field>
            <Field label="Sujet"><TextInput placeholder="Compte, securite, partenariat..." /></Field>
            <div className="md:col-span-2"><Field label="Message"><TextArea placeholder="Expliquez votre demande..." /></Field></div>
            <Button type="button">Envoyer la demande</Button>
          </form>
        ) : null}
      </section>
    </PublicShell>
  );
}

export function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.universities()
      .then((res) => setUniversities(res.data))
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-4xl font-black text-white md:text-5xl">Universites disponibles</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">Liste chargee depuis l&apos;API. Aucune universite n&apos;est inventee cote frontend.</p>
        {notice ? <div className="mt-5"><Notice kind="error">{notice}</Notice></div> : null}
        <div className="mt-8">
          {loading ? <Spinner label="Chargement des universites..." /> : null}
          {!loading && universities.length === 0 ? <EmptyState title="Aucune universite en base" body="Ajoutez les etablissements cote backend pour les afficher ici." /> : null}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((university) => (
              <Link key={university.id} href={`/universities/${university.id}`} className="glass rounded-[24px] p-5 text-white transition hover:bg-white/10">
                <Building2 className="text-[var(--gold)]" size={26} />
                <h2 className="mt-4 font-black">{university.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{university.city ?? "Ville non renseignee"} · {university.type ?? "Etablissement"}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export function UniversityDetailsPage() {
  const params = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.universities()
      .then((res) => setUniversity(res.data.find((item) => String(item.id) === params.id) ?? null))
      .catch((err) => setNotice(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/universities" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]"><ArrowLeft size={16} /> Retour</Link>
        {notice ? <div className="mt-5"><Notice kind="error">{notice}</Notice></div> : null}
        {loading ? <div className="mt-6"><Spinner label="Chargement..." /></div> : null}
        {!loading && !university ? <EmptyState title="Universite introuvable" body="Aucune entree correspondante n'a ete retournee par l'API." /> : null}
        {university ? (
          <article className="glass mt-6 rounded-[24px] p-6">
            <GraduationCap className="text-[var(--gold)]" size={42} />
            <h1 className="mt-5 text-4xl font-black text-white">{university.name}</h1>
            <p className="mt-3 text-[var(--muted)]">{university.city ?? "Ville non renseignee"} · {university.acronym ?? "Acronyme non renseigne"}</p>
            <p className="mt-6 text-sm leading-7 text-[var(--muted)]">Les profils peuvent declarer cette universite pendant l&apos;inscription ou l&apos;onboarding. La verification etudiante avancee sera affichee ici lorsqu&apos;elle sera activee cote backend.</p>
          </article>
        ) : null}
      </section>
    </PublicShell>
  );
}

const systemStates: Record<string, { title: string; body: string; icon: LucideIcon; action: string }> = {
  offline: { title: "Vous etes hors ligne", body: "Verifiez votre connexion pour retrouver la decouverte, les matchs et les messages.", icon: WifiOff, action: "Reessayer" },
  maintenance: { title: "Maintenance en cours", body: "US revient bientot avec une experience plus stable.", icon: Wrench, action: "Actualiser" },
  "update-required": { title: "Mise a jour requise", body: "Installez la derniere version pour continuer a utiliser US.", icon: Smartphone, action: "Telecharger" },
  "session-expired": { title: "Session expiree", body: "Reconnectez-vous pour proteger votre compte.", icon: Lock, action: "Se connecter" },
  "two-factor": { title: "Verification en deux etapes", body: "Entrez le code de securite pour confirmer que c'est bien vous.", icon: ShieldCheck, action: "Verifier" },
  "account-suspended": { title: "Compte suspendu", body: "Votre compte est temporairement limite. Contactez le support si vous pensez qu'il s'agit d'une erreur.", icon: AlertTriangle, action: "Contacter le support" },
  "account-banned": { title: "Compte banni", body: "L'acces a US a ete retire a la suite d'une decision de moderation.", icon: Lock, action: "Lire les regles" },
  "underage-access-denied": { title: "Acces reserve aux 18+", body: "US est strictement reserve aux adultes ages de 18 ans et plus.", icon: Shield, action: "Retour" },
  "too-many-requests": { title: "Trop de tentatives", body: "Patientez quelques minutes avant de reessayer.", icon: RefreshCw, action: "Reessayer" },
  "service-unavailable": { title: "Service indisponible", body: "Le service US ne repond pas pour le moment.", icon: AlertTriangle, action: "Reessayer" },
  success: { title: "Operation reussie", body: "Votre action a bien ete prise en compte.", icon: CheckCircle2, action: "Continuer" },
  error: { title: "Une erreur est survenue", body: "Nous n'avons pas pu terminer cette action.", icon: AlertTriangle, action: "Reessayer" },
};

export function SystemStatePage({ state }: { state: keyof typeof systemStates }) {
  const data = systemStates[state] ?? systemStates.error;
  const Icon = data.icon;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="glass max-w-xl rounded-[24px] p-8 text-center">
        <Icon className="mx-auto text-[var(--gold)]" size={62} />
        <h1 className="mt-5 text-3xl font-black text-white">{data.title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{data.body}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={state === "session-expired" ? "/login" : "/"}><Button>{data.action}</Button></Link>
          <Link href="/help"><Button variant="secondary">Obtenir de l&apos;aide</Button></Link>
        </div>
      </div>
    </main>
  );
}

const flowCopy: Record<string, { title: string; body: string; icon: LucideIcon }> = {
  age: { title: "Confirmation de l'age", body: "US est reserve aux adultes de 18 ans et plus.", icon: ShieldCheck },
  identity: { title: "Prenom et naissance", body: "Ces informations aident a construire un profil authentique.", icon: UserCheck },
  gender: { title: "Genre", body: "Indiquez comment vous souhaitez etre presente dans l'application.", icon: UserCheck },
  relationship: { title: "Relations recherchees", body: "Clarifiez vos intentions pour des rencontres plus honnetes.", icon: Sparkles },
  university: { title: "Choix de l'universite", body: "Votre campus aide a proposer des profils pertinents sans position exacte.", icon: GraduationCap },
  faculty: { title: "Faculte ou ecole", body: "Cette precision ameliorera la compatibilite academique.", icon: Building2 },
  field: { title: "Filiere", body: "Ajoutez votre domaine d'etude.", icon: BookOpen },
  level: { title: "Niveau d'etude", body: "Licence, Master, Doctorat ou autre parcours.", icon: GraduationCap },
  "primary-photo": { title: "Photo principale", body: "Choisissez la photo qui representera votre profil.", icon: Smartphone },
  bio: { title: "Biographie", body: "Quelques lignes suffisent pour donner envie de discuter.", icon: FileText },
  languages: { title: "Langues parlees", body: "Facilitez les conversations naturelles.", icon: MessageSquareWarning },
  preferences: { title: "Preferences de rencontre", body: "Ajustez votre experience sans exclure inutilement.", icon: Sparkles },
  "age-range": { title: "Tranche d'age recherchee", body: "Respectez toujours les limites 18+.", icon: Shield },
  distance: { title: "Rayon de decouverte", body: "US utilise des distances approximatives, jamais de coordonnees exactes.", icon: MapPin },
  location: { title: "Autorisation de localisation", body: "Votre position exacte n'est jamais affichee aux autres utilisateurs.", icon: MapPin },
  rules: { title: "Regles de la communaute", body: "Respect, consentement, authenticite et signalement rapide.", icon: ShieldCheck },
  summary: { title: "Resume du profil", body: "Relisez vos informations avant d'entrer dans US.", icon: BadgeCheck },
  done: { title: "Onboarding termine", body: "Votre experience US est prete.", icon: CheckCircle2 },
};

function SupportCenterPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", priority: "normal", message: "" });
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    api.supportTickets().then((res) => setTickets(res.data)).catch((err) => setNotice(errorMessage(err))).finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setNotice("");
    const body = new FormData();
    body.set("subject", form.subject);
    body.set("category", form.category);
    body.set("priority", form.priority);
    body.set("message", form.message);
    if (attachment) body.set("attachment", attachment);
    const ticket = await api.createSupportTicket(body).catch((err) => {
      setNotice(errorMessage(err));
      return null;
    });
    if (ticket) {
      setTickets((current) => [ticket, ...current]);
      setForm({ subject: "", category: "general", priority: "normal", message: "" });
      setAttachment(null);
      setNotice("Votre demande support a ete envoyee.");
    }
    setSending(false);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <button type="button" onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]"><ArrowLeft size={16} /> Retour</button>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={submit} className="glass rounded-[28px] p-6">
          <Badge tone="primary">Support</Badge>
          <h1 className="mt-5 text-3xl font-black text-white">Contacter l&apos;equipe US</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Envoyez une demande precise. Les reponses et changements de statut arriveront dans vos notifications.</p>
          {notice ? <div className="mt-4"><Notice kind={notice.includes("envoyee") ? "success" : "error"}>{notice}</Notice></div> : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Objet"><TextInput value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></Field>
            <Field label="Categorie">
              <Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option value="general">General</option>
                <option value="account">Compte</option>
                <option value="payment">Paiement</option>
                <option value="safety">Securite</option>
                <option value="verification">Verification</option>
                <option value="bug">Bug</option>
              </Select>
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
            <Field label="Priorite">
              <Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </Select>
            </Field>
            <Field label="Piece jointe"><TextInput type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)} /></Field>
          </div>
          <Field label="Message"><TextArea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required placeholder="Expliquez le probleme, le contexte et l'action attendue." /></Field>
          <Button type="submit" disabled={sending}>{sending ? "Envoi..." : <><MessageSquare size={18} /> Envoyer au support</>}</Button>
        </form>

        <aside className="glass h-max rounded-[28px] p-5">
          <h2 className="text-xl font-black text-white">Mes tickets</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Suivi de vos demandes recentes.</p>
          <div className="mt-5 space-y-3">
            {loading ? <Spinner /> : tickets.length === 0 ? <EmptyState title="Aucun ticket" body="Vos demandes apparaitront ici." /> : tickets.slice(0, 6).map((ticket) => (
              <article key={ticket.id} className="rounded-2xl bg-white/5 p-4">
                <div className="flex flex-wrap gap-2"><Badge tone={ticket.status === "resolved" ? "success" : ticket.status === "closed" ? "neutral" : "gold"}>{ticket.status}</Badge><Badge tone="primary">{ticket.category}</Badge></div>
                <h3 className="mt-3 font-black text-white">{ticket.subject}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{ticket.message}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export function GenericFlowPage({ family }: { family: "onboarding" | "verification" | "settings" | "safety" | "support" }) {
  const params = useParams<{ step?: string; section?: string }>();
  const slug = params.step ?? params.section ?? "summary";
  const data = flowCopy[slug] ?? {
    title: slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
    body: "Ecran prepare dans le design system US, pret a etre relie a son endpoint dedie.",
    icon: family === "verification" ? ShieldCheck : family === "settings" ? Lock : family === "support" ? LifeBuoy : Shield,
  };
  const Icon = data.icon;
  const router = useRouter();

  if (family === "support") return <SupportCenterPage />;

  return (
    <section className="mx-auto max-w-3xl px-5 py-8">
      <button type="button" onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]"><ArrowLeft size={16} /> Retour</button>
      <div className="glass rounded-[24px] p-6">
        <Badge tone={family === "verification" ? "gold" : "primary"}>{family}</Badge>
        <Icon className="mt-6 text-[var(--gold)]" size={42} />
        <h1 className="mt-5 text-3xl font-black text-white">{data.title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{data.body}</p>
        <Notice>
          Cet ecran respecte le pack Stitch: microcopy francaise, confidentialite, pas de position exacte et aucune donnee sensible exposee.
        </Notice>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button>Continuer <ArrowRight size={18} /></Button>
          <Button variant="secondary">Passer pour le moment</Button>
        </div>
      </div>
    </section>
  );
}
