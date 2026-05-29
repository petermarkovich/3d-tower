import Link from 'next/link';

export function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: 'site-header' }}
      className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6"
    >
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-ink-soft">
        <span>📞</span> Contact us
      </div>
      <Link href="/" className="text-center leading-none">
        <div className="text-[9px] uppercase tracking-[0.25em] text-ink-soft">Volta</div>
        <div className="font-serif text-2xl font-medium tracking-[0.3em] text-foreground">SKAI</div>
      </Link>
      <div className="text-[11px] uppercase tracking-[0.2em] text-ink-soft">Menu</div>
    </header>
  );
}
