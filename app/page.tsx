'use client';
import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Apartment } from '@/lib/types';
import { useApartments, DEFAULT_FILTERS, computeBounds, type Filters } from '@/lib/useApartments';
import { useFavorites } from '@/lib/useFavorites';
import { useDeferredMount } from '@/lib/useDeferredMount';
import { FiltersPanel } from '@/components/FiltersPanel';
import { ApartmentTable } from '@/components/ApartmentTable';
import { HoverCard } from '@/components/HoverCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Three.js потрібен лише на клієнті
const BuildingScene = dynamic(
  () => import('@/components/BuildingScene').then((m) => m.BuildingScene),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const apartments = useApartments();
  const favorites = useFavorites();
  const sceneReady = useDeferredMount();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const bounds = useMemo(() => computeBounds(apartments), [apartments]);
  const [hoveredApt, setHoveredApt] = useState<Apartment | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'360' | 'plans' | 'location'>('360');

  const openApartment = useCallback((apt: Apartment) => {
    router.push(`/apartament/${apt.id}`);
  }, [router]);

  const onHover3D = useCallback((apt: Apartment | null, x?: number, y?: number) => {
    setHoveredApt(apt);
    if (x != null && y != null) setPointer({ x, y });
  }, []);
  const onHoverTable = useCallback((id: number | null) => {
    const apt = id == null ? null : apartments.find((a) => a.id === id) || null;
    setHoveredApt(apt);
  }, [apartments]);

  return (
    <>
      <div className="fixed left-1/2 top-[88px] z-20 -translate-x-1/2 text-center">
        <h1 className="mb-3 font-serif text-[40px] font-normal text-foreground">Krulli 10</h1>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="rounded-full bg-card p-1">
            <TabsTrigger value="360" className="rounded-full px-5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">360 model</TabsTrigger>
            <TabsTrigger value="plans" className="rounded-full px-5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Floorplans</TabsTrigger>
            <TabsTrigger value="location" className="rounded-full px-5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Location</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FiltersPanel filters={filters} setFilters={setFilters} bounds={bounds} />

      {sceneReady && (
        <BuildingScene
          apartments={apartments}
          hoveredId={hoveredApt?.id ?? null}
          onHoverApartment={onHover3D}
          onClickApartment={openApartment}
        />
      )}

      <HoverCard apartment={hoveredApt} x={pointer.x} y={pointer.y} />

      <ApartmentTable
        apartments={apartments}
        filters={filters}
        favorites={favorites.set}
        hoveredId={hoveredApt?.id ?? null}
        onHover={onHoverTable}
        onClick={openApartment}
      />

      <div className="fixed bottom-[18px] left-6 z-10 text-[11px] text-ink-mute">
        {apartments.length} apartments
      </div>
    </>
  );
}
