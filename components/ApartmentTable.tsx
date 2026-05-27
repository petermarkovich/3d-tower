'use client';
import { useMemo } from 'react';
import type { Apartment } from '@/lib/types';
import { passesFilter, type Filters } from '@/lib/useApartments';

interface Props {
  apartments: Apartment[];
  filters: Filters;
  hoveredId: number | null;
  onHover: (id: number | null) => void;
  onClick: (apt: Apartment) => void;
}

function fmtSize(s?: string | null) {
  if (!s) return '-';
  return String(s).replace(/\s*m²?\s*$/i, '').trim();
}
function fmtPrice(a: Apartment) {
  const p = a.price_formatted || '-';
  if (a.status === 'sold') return 'Sold';
  if (a.status === 'booked') return 'Booked';
  return p;
}

export function ApartmentTable({ apartments, filters, hoveredId, onHover, onClick }: Props) {
  const rows = useMemo(() => {
    const sorted = [...apartments].sort((a, b) => parseFloat(a.number_num) - parseFloat(b.number_num));
    return sorted.filter((a) => passesFilter(a, filters));
  }, [apartments, filters]);

  return (
    <aside className="table-panel">
      <div className="table-head">
        <span>Nr</span><span>Flr</span><span>Rms</span><span>Size</span><span>Balc</span><span>Price</span>
      </div>
      <div className="table-body">
        {rows.map((a) => {
          const cls = ['row',
            a.status === 'sold' ? 'sold' : '',
            a.status === 'booked' ? 'booked' : '',
            a.id === hoveredId ? 'hl' : '',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={a.id}
              className={cls}
              onMouseEnter={() => onHover(a.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(a)}
            >
              <span className="nr">{a.number ?? '-'}</span>
              <span>{a.floor ?? '-'}</span>
              <span>{a.rooms_count ?? '-'}</span>
              <span>{fmtSize(a.area_size)}</span>
              <span>{fmtSize(a.balcony_size)}</span>
              <span className="price" dangerouslySetInnerHTML={{ __html: fmtPrice(a) }} />
            </div>
          );
        })}
      </div>
    </aside>
  );
}
