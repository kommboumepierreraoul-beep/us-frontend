import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, BadgeCheck, GraduationCap, HeartHandshake, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/brand";
import { Button } from "@/components/ui/primitives";

const features = [
  { icon: GraduationCap, title: "Communaute universitaire", body: "Les membres declarent leur etablissement parmi les universites camerounaises disponibles." },
  { icon: ShieldCheck, title: "Securite MVP", body: "Signalement, blocage, moderation et geolocalisation floutee protegent l'experience." },
  { icon: HeartHandshake, title: "Matches utiles", body: "La messagerie s'ouvre apres affinite mutuelle pour garder des conversations qualifiees." },
  { icon: Bell, title: "Temps reel pret", body: "Notifications et messages sont structures pour Laravel Sanctum et Reverb." },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <BrandMark compact />
        <nav className="flex items-center gap-2">
          <Link href="/how-it-works" className="hidden rounded-2xl px-4 py-3 text-sm font-bold text-[var(--muted)] hover:bg-white/10 lg:inline-flex">
            Comment ca marche
          </Link>
          <Link href="/safety" className="hidden rounded-2xl px-4 py-3 text-sm font-bold text-[var(--muted)] hover:bg-white/10 lg:inline-flex">
            Securite
          </Link>
          <Link href="/pricing" className="hidden rounded-2xl px-4 py-3 text-sm font-bold text-[var(--muted)] hover:bg-white/10 lg:inline-flex">
            Tarifs
          </Link>
          <Link href="/login" className="hidden rounded-2xl px-4 py-3 text-sm font-bold text-[var(--muted)] hover:bg-white/10 sm:inline-flex">
            Connexion
          </Link>
          <Link href="/register">
            <Button>S&apos;inscrire</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-6 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e9c349]/25 bg-[#e9c349]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.05em] text-[#ffe088]">
            <Sparkles size={16} /> Plateforme premium universitaire
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white md:text-6xl">
            Des rencontres authentiques, dans votre universite
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
            US est une experience premium pour etudiants majeurs: profils authentiques, campus, proximite floutee, moderation et confiance au centre.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register">
              <Button className="w-full sm:w-auto">Creer mon profil <ArrowRight size={18} /></Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="secondary" className="w-full sm:w-auto">Decouvrir US</Button>
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="glass-strong relative aspect-[4/5] overflow-hidden rounded-[32px] p-4">
            <Image src="/us-logo.png" alt="US Nous" fill sizes="480px" className="object-cover opacity-85" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#100c1a] via-[#100c1a]/20 to-transparent" />
            <div className="absolute inset-x-4 bottom-4 rounded-[24px] border border-white/10 bg-[#100c1a]/70 p-5 backdrop-blur-xl">
              <p className="text-xl font-black text-white">Decouverte campus</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Profils, matchs, messages et Premium connectes a l&apos;API Laravel.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-10 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="glass rounded-[24px] p-5">
              <Icon className="text-[var(--gold)]" size={24} />
              <h2 className="mt-4 font-black text-white">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{feature.body}</p>
            </article>
          );
        })}
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-14 lg:grid-cols-3">
        {[
          { icon: UserCheck, title: "Verification d'identite", body: "Parcours prepare pour expliquer les donnees collectees, leur usage et leur protection." },
          { icon: GraduationCap, title: "Verification etudiante", body: "Universite, statut etudiant et confiance campus structurent l'experience." },
          { icon: BadgeCheck, title: "Premium sans pression", body: "Plus de controle, filtres avances, boosts et Super Likes, avec or reserve aux vrais avantages." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="glass rounded-[24px] p-6">
              <Icon className="text-[var(--gold)]" size={28} />
              <h2 className="mt-4 text-xl font-black text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.body}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
