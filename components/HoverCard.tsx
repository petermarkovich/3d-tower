'use client';
import type { Apartment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  apartment: Apartment | null;
  x: number;
  y: number;
}

const val = (v: unknown) => (v == null || v === '' ? '—' : String(v));

const badgeColor: Record<string, string> = {
  available: 'bg-primary',
  booked: 'bg-booked',
  sold: 'bg-sold',
  unknown: 'bg-ink-mute',
};

export function HoverCard({ apartment, x, y }: Props) {
  if (!apartment) return null;
  const status = apartment.status || 'unknown';
  return (
    <div
      className="fixed z-20 w-[220px] rounded-md border border-border bg-card p-4 text-card-foreground shadow-[0_12px_40px_rgba(0,0,0,0.12)] pointer-events-none"
      style={{ left: x + 18, top: y + 18 }}
    >
      <div className="font-serif text-[22px] font-semibold">{apartment.number}</div>
      <span
        className={cn(
          'mt-1 inline-block rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white',
          badgeColor[status] ?? badgeColor.unknown,
        )}
      >
        {status === 'unknown' ? 'Available' : status}
      </span>
      <div className="mt-2.5 border-t border-border pt-2">
        <Row label="Floor" value={val(apartment.floor)} />
        <Row label="Rooms" value={val(apartment.rooms_count)} />
        <Row label="Size" value={val(apartment.area_size)} />
      </div>
      <div
        className="mt-2 font-serif text-lg text-foreground"
        dangerouslySetInnerHTML={{ __html: apartment.price_formatted ?? '—' }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5 text-xs">
      <span className="text-ink-soft">{label}</span>
      <span>{value}</span>
    </div>
  );
}
