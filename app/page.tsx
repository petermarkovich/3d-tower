'use client';
import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Apartment } from '@/lib/types';
import { useApartments, DEFAULT_FILTERS, type Filters } from '@/lib/useApartments';
import { FiltersPanel } from '@/components/FiltersPanel';
import { ApartmentTable } from '@/components/ApartmentTable';
import { HoverCard } from '@/components/HoverCard';
import { ApartmentModal } from '@/components/ApartmentModal';

// Three.js потрібен лише на клієнті
const BuildingScene = dynamic(
  () => import('@/components/BuildingScene').then((m) => m.BuildingScene),
  { ssr: false }
);

export default function Home() {
  const apartments = useApartments();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredApt, setHoveredApt] = useState<Apartment | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [modalApt, setModalApt] = useState<Apartment | null>(null);
  const [activeTab, setActiveTab] = useState<'360' | 'plans' | 'location'>('360');

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
      <header className="top">
        <div className="nav-left"><span>📞</span> Contact us</div>
        <div className="brand">
          <div className="small">Volta</div>
          <div className="big">SKAI</div>
        </div>
        <div className="nav-right">Menu</div>
      </header>

      <div className="title-wrap">
        <h1>Krulli 10</h1>
        <div className="tabs">
          <button className={activeTab === '360' ? 'active' : ''} onClick={() => setActiveTab('360')}>360 model</button>
          <button className={activeTab === 'plans' ? 'active' : ''} onClick={() => setActiveTab('plans')}>Floorplans</button>
          <button className={activeTab === 'location' ? 'active' : ''} onClick={() => setActiveTab('location')}>Location</button>
        </div>
      </div>

      <FiltersPanel filters={filters} setFilters={setFilters} />

      <BuildingScene
        apartments={apartments}
        hoveredId={hoveredApt?.id ?? null}
        onHoverApartment={onHover3D}
        onClickApartment={(apt) => setModalApt(apt)}
        paused={modalApt !== null}
      />

      <HoverCard apartment={hoveredApt} x={pointer.x} y={pointer.y} />

      <ApartmentTable
        apartments={apartments}
        filters={filters}
        hoveredId={hoveredApt?.id ?? null}
        onHover={onHoverTable}
        onClick={(apt) => setModalApt(apt)}
      />

      <div id="status-bar">{apartments.length} apartments</div>

      <ApartmentModal apartment={modalApt} onClose={() => setModalApt(null)} />
    </>
  );
}
