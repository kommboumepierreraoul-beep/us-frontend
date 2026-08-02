import Image from "next/image";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={compact ? "relative h-10 w-10 overflow-hidden rounded-full" : "relative h-14 w-14 overflow-hidden rounded-2xl"}>
        <Image src="/us-logo.png" alt="US Nous" fill sizes="56px" className="object-cover" priority />
      </div>
      <div>
        <p className="text-lg font-black leading-none tracking-tight text-white">US</p>
        <p className="text-xs font-semibold uppercase text-[var(--muted)]">Nous</p>
      </div>
    </div>
  );
}
