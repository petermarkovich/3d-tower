'use client';
import { useMemo } from 'react';
import type { Apartment } from '@/lib/types';
import { passesFilter, type Filters } from '@/lib/useApartments';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Props {
  apartments: Apartment[];
  filters: Filters;
  favorites?: Set<number>;
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

export function ApartmentTable({ apartments, filters, favorites, hoveredId, onHover, onClick }: Props) {
  const rows = useMemo(() => {
    const sorted = [...apartments].sort((a, b) => parseFloat(a.number_num) - parseFloat(b.number_num));
    return sorted.filter((a) => passesFilter(a, filters, favorites));
  }, [apartments, filters, favorites]);

  return (
    <aside className="fixed right-0 top-16 bottom-0 z-10 flex w-[400px] flex-col border-l border-border bg-card">
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-10 bg-card hover:bg-card">
              {['Nr', 'Flr', 'Rms', 'Size', 'Balc', 'Price'].map((h) => (
                <TableHead
                  key={h}
                  className="h-auto py-3 text-[10px] uppercase tracking-wider text-ink-mute"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => {
              const dim = a.status === 'sold' || a.status === 'booked';
              return (
                <TableRow
                  key={a.id}
                  onMouseEnter={() => onHover(a.id)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onClick(a)}
                  className={cn(
                    'cursor-pointer border-line-soft text-[13px]',
                    dim && 'text-ink-mute',
                    a.id === hoveredId && 'bg-accent',
                  )}
                >
                  <TableCell className={cn('py-2.5 font-semibold', dim ? 'text-ink-mute' : 'text-foreground')}>
                    {a.number ?? '-'}
                  </TableCell>
                  <TableCell className="py-2.5">{a.floor ?? '-'}</TableCell>
                  <TableCell className="py-2.5">{a.rooms_count ?? '-'}</TableCell>
                  <TableCell className="py-2.5">{fmtSize(a.area_size)}</TableCell>
                  <TableCell className="py-2.5">{fmtSize(a.balcony_size)}</TableCell>
                  <TableCell
                    className="py-2.5"
                    dangerouslySetInnerHTML={{ __html: fmtPrice(a) }}
                  />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </aside>
  );
}
