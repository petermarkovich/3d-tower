'use client';
import { Star } from 'lucide-react';
import { type Filters, type RangeBounds, VIEW_OPTIONS } from '@/lib/useApartments';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  bounds: RangeBounds;
}

const UNITS = ['all', 'apartments', 'commercial'] as const;
const ROOMS = ['all', '1', '2', '3', '4', '5'] as const;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtPrice = (n: number) => `${n.toLocaleString('fr-FR').replace(/ /g, ' ')} €`;

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2.5 text-[10px] uppercase tracking-[0.15em] text-ink-mute">{children}</div>;
}

const pillCls =
  'rounded border border-border bg-card px-3.5 text-[11px] data-[state=on]:bg-ink data-[state=on]:text-background';
const sliderCls =
  '[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:rounded-md [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-ink [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-border';

export function FiltersPanel({ filters, setFilters, bounds }: Props) {
  const setPart = (p: Partial<Filters>) => setFilters({ ...filters, ...p });

  const sizeVal: [number, number] = [filters.sizeMin ?? bounds.sizeMin, filters.sizeMax ?? bounds.sizeMax];
  const priceVal: [number, number] = [filters.priceMin ?? bounds.priceMin, filters.priceMax ?? bounds.priceMax];

  return (
    <aside className="fixed left-6 top-20 z-10 max-h-[calc(100vh-7rem)] w-[260px] overflow-y-auto pr-1 text-foreground">
      <div className="mb-6">
        <label className="flex cursor-pointer items-center gap-2.5 text-xs">
          <Checkbox checked={filters.available} onCheckedChange={(v) => setPart({ available: v === true })} />
          Only available units
        </label>
      </div>

      <div className="mb-6">
        <Label>Units</Label>
        <ToggleGroup
          type="single"
          value={filters.units}
          onValueChange={(v) => v && setPart({ units: v as Filters['units'] })}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {UNITS.map((v) => (
            <ToggleGroupItem key={v} value={v} className={pillCls}>
              {v === 'all' ? 'All' : cap(v)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mb-6">
        <Label>Rooms</Label>
        <ToggleGroup
          type="single"
          value={filters.rooms}
          onValueChange={(v) => v && setPart({ rooms: v })}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {ROOMS.map((v) => (
            <ToggleGroupItem key={v} value={v} className={pillCls}>
              {v === 'all' ? 'All' : v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mb-6">
        <Label>Floors</Label>
        <Slider
          className={sliderCls}
          min={1}
          max={12}
          step={1}
          value={[filters.floorMin, filters.floorMax]}
          onValueChange={([min, max]) => setPart({ floorMin: min, floorMax: max })}
        />
        <div className="mt-2 flex items-center justify-between text-[12px] text-ink-soft">
          <span>{filters.floorMin}</span>
          <span className="text-ink-mute">–</span>
          <span>{filters.floorMax}</span>
        </div>
      </div>

      <div className="mb-6">
        <Label>Size</Label>
        <Slider
          className={sliderCls}
          min={bounds.sizeMin}
          max={bounds.sizeMax}
          step={1}
          value={sizeVal}
          onValueChange={([min, max]) => setPart({ sizeMin: min, sizeMax: max })}
        />
        <div className="mt-2 flex items-center justify-between text-[12px] text-ink-soft">
          <span>{sizeVal[0]} m²</span>
          <span className="text-ink-mute">–</span>
          <span>{sizeVal[1]} m²</span>
        </div>
      </div>

      <div className="mb-6">
        <Label>Price</Label>
        <Slider
          className={sliderCls}
          min={bounds.priceMin}
          max={bounds.priceMax}
          step={100}
          value={priceVal}
          onValueChange={([min, max]) => setPart({ priceMin: min, priceMax: max })}
        />
        <div className="mt-2 flex items-center justify-between text-[12px] text-ink-soft">
          <span>{fmtPrice(priceVal[0])}</span>
          <span className="text-ink-mute">–</span>
          <span>{fmtPrice(priceVal[1])}</span>
        </div>
      </div>

      <div className="mb-6">
        <Label>View from window</Label>
        <ToggleGroup
          type="single"
          value={filters.view}
          onValueChange={(v) => v && setPart({ view: v })}
          className="flex flex-wrap justify-start gap-1.5"
        >
          {VIEW_OPTIONS.map((o) => (
            <ToggleGroupItem key={o.value} value={o.value} className={pillCls}>
              {o.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mb-2">
        <label className="flex cursor-pointer items-center gap-2.5 text-xs">
          <Checkbox checked={filters.favorites} onCheckedChange={(v) => setPart({ favorites: v === true })} />
          My favorites
          <Star className="size-3.5 fill-primary text-primary" />
        </label>
      </div>
    </aside>
  );
}
