export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="h-28 animate-pulse rounded-[28px] bg-white/8" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-[24px] bg-white/8" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-[24px] bg-white/8" />)}
        </div>
      </div>
    </main>
  );
}
