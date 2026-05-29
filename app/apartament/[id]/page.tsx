'use client';
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Heart, Mail } from 'lucide-react';
import { useApartments } from '@/lib/useApartments';
import { useFavorites } from '@/lib/useFavorites';
import { useDeferredMount } from '@/lib/useDeferredMount';
import { floorplanUrl } from '@/lib/constants';
import type { ApartmentSceneApi } from '@/components/ApartmentScene';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ApartmentScene = dynamic(
  () => import('@/components/ApartmentScene').then((m) => m.ApartmentScene),
  { ssr: false }
);

function decode(html?: string | null): string {
  if (!html) return '—';
  return html.replace(/&euro;/g, '€').replace(/&nbsp;/g, ' ');
}

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.15em] text-ink-mute">{label}</span>
      <b className="text-lg font-medium text-foreground">{value}</b>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <dt className="text-[10px] uppercase tracking-[0.15em] text-ink-mute">{label}</dt>
      <dd className="text-[15px] text-foreground">{value}</dd>
    </div>
  );
}

export default function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const apartments = useApartments();
  const favorites = useFavorites();
  const apt = apartments.find((a) => String(a.id) === id) || null;
  const isFav = apt ? favorites.has(apt.id) : false;

  const [tab, setTab] = useState<'360' | 'floorplan'>('360');
  // 3D-сцену монтуємо після завершення кросфейду, щоб не блокувати анімацію
  const sceneReady = useDeferredMount();
  const apiRef = useRef<ApartmentSceneApi | null>(null);
  const [walkActive, setWalkActive] = useState(false);
  const [iconPos, setIconPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && apiRef.current?.isWalkmode()) apiRef.current.exitWalkmode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!apartments.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center text-sm text-ink-soft">Loading…</div>
    );
  }
  if (!apt) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 text-sm text-ink-soft">
        <p>Apartment not found.</p>
        <Link href="/" className="text-primary underline">← All units</Link>
      </div>
    );
  }

  const tower = (apt.house as { identificator?: string })?.identificator ?? '—';

  return (
    <div className="fixed inset-0 bg-background">
      {/* верхні таби */}
      <div className="fixed left-1/2 top-20 z-20 -translate-x-1/2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="rounded-full bg-card p-1">
            <TabsTrigger value="360" className="rounded-full px-5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">360 model</TabsTrigger>
            <TabsTrigger value="floorplan" className="rounded-full px-5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Floorplan</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* сайдбар */}
      <aside className="fixed bottom-0 left-0 top-16 z-[15] flex w-[340px] flex-col overflow-y-auto px-10 py-7">
        <Link href="/" className="mb-8 text-sm text-ink-soft hover:text-foreground">‹ All units</Link>

        <div className="text-[11px] uppercase tracking-[0.2em] text-ink-mute">KRULLI 10</div>
        <div className="mb-6 mt-1 border-b border-border pb-5 font-serif text-[64px] font-normal leading-none text-foreground">
          {apt.number ?? '—'}
        </div>

        <div className="mb-[18px] flex gap-9">
          <Spec label="TOWER" value={tower} />
          <Spec label="FLOOR" value={apt.floor ?? '—'} />
          <Spec label="ROOMS" value={apt.rooms_count ?? '—'} />
        </div>
        <div className="mb-[18px] flex gap-9">
          <Spec label="SIZE" value={apt.area_size ? `${apt.area_size} m²` : '—'} />
          <Spec label="BALCONY" value={apt.balcony_size ? `${apt.balcony_size} m²` : '—'} />
        </div>

        <div className="mt-2 border-t border-border pt-[18px] text-[10px] uppercase tracking-[0.15em] text-ink-mute">PRICE</div>
        <div className="mb-[22px] mt-1 border-b border-border pb-5 font-serif text-3xl text-foreground">
          {decode(apt.price_formatted)}
        </div>

        <dl className="mb-[26px] flex flex-col gap-4">
          <Detail label="VIEW" value={(apt.view as string) || 'Sea'} />
          <Detail label="INTERIOR PACKAGE" value="Volta" />
          <Detail label="CEILING HEIGHT" value="2.9 m" />
          <Detail label="AIR CONDITIONING" value="Integrated" />
          <Detail label="WARRANTY" value="3 years" />
        </dl>

        <div className="mt-auto flex flex-col gap-2.5">
          <Button
            variant="outline"
            onClick={() => favorites.toggle(apt.id)}
            className={cn(
              'justify-start gap-2 text-[11px] uppercase tracking-wider',
              isFav ? 'border-primary text-primary' : 'text-ink-soft',
            )}
          >
            <Heart className={cn('size-4', isFav && 'fill-primary text-primary')} />
            {isFav ? 'In favorites' : 'Add to favorites'}
          </Button>
          <Button variant="outline" className="justify-start gap-2 text-[11px] uppercase tracking-wider text-ink-soft">
            <Mail className="size-4" /> Send to a friend
          </Button>
        </div>
      </aside>

      {/* головна область — обидва таби лишаються змонтованими для плавних переходів */}
      <main className="fixed bottom-0 left-[340px] right-0 top-16">
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            tab === '360' ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
          )}
        >
          <div className="relative h-full w-full">
            {sceneReady && (
              <ApartmentScene
                apiRef={apiRef}
                onWalkmodeChange={setWalkActive}
                onIconPos={setIconPos}
                paused={tab !== '360'}
              />
            )}
            {tab === '360' && sceneReady && iconPos?.visible && !walkActive && (
              <button
                className="absolute z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110"
                style={{ left: iconPos.x, top: iconPos.y }}
                title="Walk mode"
                onClick={() => apiRef.current?.enterWalkmode()}
              >
                <svg className="size-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13" cy="4" r="2" />
                  <path d="M7 22l3-8 4 1 3 5" />
                  <path d="M6 12l3-3 4 1 5-1" />
                </svg>
              </button>
            )}
            {tab === '360' && walkActive && (
              <>
                <button
                  className="absolute left-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-black/55 text-xl text-white"
                  onClick={() => apiRef.current?.exitWalkmode()}
                  title="Exit (Esc)"
                >
                  ×
                </button>
                <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-md bg-black/60 px-4 py-2 text-[11px] uppercase tracking-wider text-white">
                  Клік по підлозі — крок · Drag — огляд · Esc — вихід
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            tab === 'floorplan' ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
          )}
        >
          <div className="flex h-full w-full items-center justify-center p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={floorplanUrl(apt.number_num ?? apt.number)}
              alt={`Floorplan ${apt.number}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
