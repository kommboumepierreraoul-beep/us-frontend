import { BrandMark } from "@/components/ui/brand";

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/10 ${className}`} />;
}

function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        <Pulse className="h-4 w-24 rounded-full" />
        <Pulse className="h-10 w-64" />
        <Pulse className="h-5 w-full max-w-xl" />
      </div>
      {withAction ? <Pulse className="h-12 w-36" /> : null}
    </div>
  );
}

export function DiscoverySkeleton() {
  return (
    <section>
      <PageHeaderSkeleton withAction />
      <div className="mx-auto grid max-w-5xl gap-6 xl:grid-cols-[1fr_320px]">
        <div className="relative min-h-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <Pulse className="absolute inset-0 h-full w-full rounded-[28px]" />
          <div className="absolute inset-x-6 bottom-6 space-y-4">
            <div className="flex gap-2">
              <Pulse className="h-8 w-40 rounded-full" />
              <Pulse className="h-8 w-28 rounded-full" />
            </div>
            <Pulse className="h-12 w-72" />
            <Pulse className="h-5 w-96 max-w-full" />
            <Pulse className="h-20 w-full max-w-xl" />
          </div>
        </div>
        <aside className="glass flex flex-col justify-between rounded-[28px] p-5">
          <div className="space-y-4">
            <Pulse className="h-7 w-32" />
            <Pulse className="h-32 w-full rounded-[24px]" />
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Pulse className="h-14 w-14 rounded-full" />
            <Pulse className="h-16 w-16 rounded-full" />
            <Pulse className="h-14 w-14 rounded-full" />
          </div>
        </aside>
      </div>
    </section>
  );
}

export function LikesSkeleton() {
  return (
    <section>
      <PageHeaderSkeleton withAction />
      <div className="mb-5 flex gap-2">
        <Pulse className="h-12 w-24" />
        <Pulse className="h-12 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="glass overflow-hidden rounded-[24px]">
            <Pulse className="h-72 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Pulse className="h-7 w-40" />
              <Pulse className="h-4 w-52" />
              <div className="flex gap-2">
                <Pulse className="h-7 w-20 rounded-full" />
                <Pulse className="h-7 w-24 rounded-full" />
                <Pulse className="h-7 w-16 rounded-full" />
              </div>
              <Pulse className="h-12 w-full" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MatchesSkeleton() {
  return (
    <section>
      <PageHeaderSkeleton />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
              <Pulse className="h-20 w-16 shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <Pulse className="h-5 w-32" />
                <Pulse className="h-4 w-full" />
                <Pulse className="h-7 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </aside>
        <article className="glass overflow-hidden rounded-[28px]">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <Pulse className="min-h-[520px] rounded-none" />
            <div className="space-y-5 p-5">
              <Pulse className="h-36 w-full rounded-[24px]" />
              <Pulse className="h-28 w-full" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, index) => <Pulse key={index} className="h-7 w-24 rounded-full" />)}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, index) => <Pulse key={index} className="aspect-square w-full" />)}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function MessagesSkeleton() {
  return (
    <section>
      <div className="hidden sm:block">
        <PageHeaderSkeleton />
      </div>
      <div className="grid h-[calc(100dvh-150px)] min-h-[500px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] sm:h-[calc(100vh-150px)] sm:min-h-[560px] sm:rounded-[28px] lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <aside className="border-b border-white/10 p-2 sm:p-3 lg:border-b-0 lg:border-r">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="mb-2 flex items-center gap-3 rounded-2xl p-3">
              <Pulse className="h-12 w-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-4 w-28" />
                <Pulse className="h-3 w-full" />
              </div>
              {index < 2 ? <Pulse className="h-6 w-8 rounded-full" /> : null}
            </div>
          ))}
        </aside>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 p-3 sm:p-4">
            <Pulse className="h-10 w-10 rounded-2xl lg:hidden" />
            <div className="space-y-2">
              <Pulse className="h-5 w-36" />
              <Pulse className="h-3 w-64 max-w-full" />
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-4 p-3 sm:p-4">
            <Pulse className="h-12 w-2/3" />
            <Pulse className="ml-auto h-12 w-1/2" />
            <Pulse className="h-20 w-3/4" />
            <Pulse className="ml-auto h-12 w-2/5" />
            <Pulse className="h-12 w-1/2" />
          </div>
          <div className="flex gap-2 border-t border-white/10 p-3 sm:gap-3 sm:p-4">
            <Pulse className="h-11 w-11" />
            <Pulse className="h-11 w-11" />
            <Pulse className="h-11 flex-1" />
            <Pulse className="h-11 w-12" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function NotificationsSkeleton() {
  return (
    <section>
      <PageHeaderSkeleton withAction />
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="glass flex gap-4 rounded-[22px] p-4">
            <Pulse className="h-11 w-11 shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-5 w-48" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-3 w-24" />
            </div>
            {index < 3 ? <Pulse className="mt-2 h-2 w-2 rounded-full" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileSkeleton() {
  return (
    <section>
      <PageHeaderSkeleton withAction />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="glass rounded-[28px] p-5">
          <Pulse className="aspect-[3/4] w-full rounded-[24px]" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Pulse className="aspect-square w-full" />
            <Pulse className="aspect-square w-full" />
            <Pulse className="aspect-square w-full" />
          </div>
          <Pulse className="mt-4 h-[54px] w-full" />
          <Pulse className="mt-4 h-12 w-full" />
        </aside>
        <div className="glass space-y-4 rounded-[28px] p-5">
          {Array.from({ length: 8 }).map((_, index) => <Pulse key={index} className={index === 6 ? "h-28 w-full" : "h-[54px] w-full"} />)}
          <Pulse className="h-12 w-44" />
        </div>
      </div>
    </section>
  );
}

export function PremiumSkeleton() {
  return (
    <section>
      <PageHeaderSkeleton />
      <Pulse className="h-[54px] w-full max-w-xl" />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="glass rounded-[28px] p-6">
            <Pulse className="h-8 w-8" />
            <Pulse className="mt-4 h-8 w-44" />
            <Pulse className="mt-2 h-10 w-40" />
            <div className="mt-5 space-y-3">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-5/6" />
              <Pulse className="h-4 w-2/3" />
            </div>
            <Pulse className="mt-6 h-12 w-full" />
          </article>
        ))}
      </div>
    </section>
  );
}

export function OnboardingStepSkeleton() {
  return (
    <main className="min-h-screen pb-12">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#100c1a]/75 px-5 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Pulse className="h-11 w-11" />
          <Pulse className="h-6 w-32" />
          <Pulse className="h-11 w-11" />
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="glass mx-auto max-w-3xl rounded-[28px] p-6">
          <Pulse className="h-10 w-10" />
          <Pulse className="mt-5 h-10 w-64" />
          <Pulse className="mt-3 h-5 w-full" />
          <Pulse className="mt-2 h-5 w-5/6" />
          <div className="mt-6 space-y-4">
            <Pulse className="h-[54px] w-full" />
            <Pulse className="h-[54px] w-full" />
            <Pulse className="h-28 w-full" />
            <Pulse className="h-12 w-56" />
          </div>
        </div>
      </section>
    </main>
  );
}

export function EventsSkeleton() {
  return (
    <section>
      <Pulse className="mb-10 min-h-[420px] w-full rounded-[32px]" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="glass overflow-hidden rounded-[24px]">
            <Pulse className="h-48 w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Pulse className="h-3 w-24" />
              <Pulse className="h-6 w-40" />
              <Pulse className="h-4 w-48" />
              <Pulse className="h-4 w-36" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EventDetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <article className="glass overflow-hidden rounded-[28px]">
        <Pulse className="h-80 w-full rounded-none" />
        <div className="space-y-4 p-6">
          <Pulse className="h-9 w-72 max-w-full" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-11/12" />
          <Pulse className="h-4 w-4/5" />
        </div>
      </article>
      <aside className="glass h-max rounded-[28px] p-6">
        <Pulse className="h-6 w-32" />
        <Pulse className="mt-3 h-4 w-full" />
        <Pulse className="mt-2 h-4 w-4/5" />
        <Pulse className="mt-6 h-12 w-full" />
      </aside>
    </div>
  );
}

export function InvitationsSkeleton() {
  return (
    <div className="space-y-8">
      <section>
        <Pulse className="mb-4 h-7 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={index} className="glass flex gap-4 rounded-[24px] p-4">
              <Pulse className="h-16 w-16 shrink-0" />
              <div className="flex-1 space-y-3">
                <Pulse className="h-5 w-48" />
                <Pulse className="h-4 w-64 max-w-full" />
                <div className="flex gap-2">
                  <Pulse className="h-10 w-24" />
                  <Pulse className="h-10 w-24" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <Pulse className="mb-4 h-7 w-32" />
        <Pulse className="h-16 w-full rounded-[24px]" />
      </section>
    </div>
  );
}

export function TicketSkeleton() {
  return (
    <article className="glass mx-auto max-w-xl overflow-hidden rounded-[32px]">
      <Pulse className="h-56 w-full rounded-none" />
      <div className="p-6">
        <Pulse className="h-8 w-64 max-w-full" />
        <Pulse className="mt-2 h-4 w-80 max-w-full" />
        <Pulse className="mt-6 aspect-square w-full rounded-[28px]" />
      </div>
    </article>
  );
}

export function CompactPlanSkeleton() {
  return (
    <article className="glass mx-auto max-w-xl rounded-[32px] p-6">
      <Pulse className="h-10 w-10" />
      <Pulse className="mt-4 h-10 w-56" />
      <Pulse className="mt-2 h-12 w-44" />
      <div className="mt-6 space-y-3">
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-5/6" />
        <Pulse className="h-4 w-2/3" />
      </div>
      <Pulse className="mt-6 h-12 w-full" />
    </article>
  );
}

export function PublicPageSkeleton() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <BrandMark compact />
        <Pulse className="h-12 w-32" />
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <Pulse className="h-10 w-64 rounded-full" />
          <Pulse className="h-16 w-full max-w-3xl" />
          <Pulse className="h-16 w-5/6 max-w-2xl" />
          <Pulse className="h-24 w-full max-w-xl" />
          <div className="flex gap-3">
            <Pulse className="h-12 w-40" />
            <Pulse className="h-12 w-40" />
          </div>
        </div>
        <Pulse className="mx-auto aspect-[4/5] w-full max-w-md rounded-[32px]" />
      </section>
    </main>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <header className="flex flex-col items-center gap-5 py-8">
        <Pulse className="h-20 w-20 rounded-3xl" />
        <div className="w-full space-y-3">
          <Pulse className="mx-auto h-8 w-3/4" />
          <Pulse className="mx-auto h-5 w-5/6" />
        </div>
      </header>
      <section className="flex flex-1 flex-col justify-center space-y-4">
        <Pulse className="h-[54px] w-full" />
        <Pulse className="h-[54px] w-full" />
        <Pulse className="h-5 w-40 self-end" />
        <Pulse className="h-12 w-full" />
        <Pulse className="h-12 w-full" />
      </section>
    </main>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#100c1a]/70 px-5 py-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandMark compact />
          <div className="hidden gap-2 lg:flex">
            <Pulse className="h-11 w-28" />
            <Pulse className="h-11 w-28" />
            <Pulse className="h-11 w-11" />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-3 lg:block">
          <div className="space-y-2">
            <Pulse className="h-12 w-full" />
            <Pulse className="h-12 w-full" />
            <Pulse className="h-12 w-full" />
            <Pulse className="h-12 w-full" />
            <Pulse className="h-12 w-full" />
          </div>
        </aside>
        <main>
          <div className="mb-6 space-y-3">
            <Pulse className="h-4 w-28" />
            <Pulse className="h-10 w-72" />
            <Pulse className="h-5 w-full max-w-xl" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <Pulse className="min-h-[620px] rounded-[28px]" />
            <div className="space-y-4">
              <Pulse className="h-40 rounded-[28px]" />
              <Pulse className="h-20 rounded-[28px]" />
              <Pulse className="h-20 rounded-[28px]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
