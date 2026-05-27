'use client';
import type { Apartment } from '@/lib/types';

interface Props {
  apartment: Apartment | null;
  x: number;
  y: number;
}

const val = (v: unknown) => (v == null || v === '' ? '—' : String(v));

export function HoverCard({ apartment, x, y }: Props) {
  if (!apartment) return null;
  const status = apartment.status || 'unknown';
  return (
    <div id="card" className="show" style={{ left: x + 18, top: y + 18 }}>
      <div className="nr">{apartment.number}</div>
      <div className={`badge ${status}`}>{status === 'unknown' ? 'Available' : status}</div>
      <div className="rows">
        <div className="r"><span>Floor</span><span>{val(apartment.floor)}</span></div>
        <div className="r"><span>Rooms</span><span>{val(apartment.rooms_count)}</span></div>
        <div className="r"><span>Size</span><span>{val(apartment.area_size)}</span></div>
      </div>
      <div className="price" dangerouslySetInnerHTML={{ __html: apartment.price_formatted ?? '—' }} />
    </div>
  );
}
