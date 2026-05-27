'use client';
import type { Filters } from '@/lib/useApartments';

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
}

export function FiltersPanel({ filters, setFilters }: Props) {
  const setPart = (p: Partial<Filters>) => setFilters({ ...filters, ...p });

  return (
    <aside className="filters">
      <div className="group">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.available}
            onChange={(e) => setPart({ available: e.target.checked })}
          />
          Only available units
        </label>
      </div>

      <div className="group">
        <div className="label">Units</div>
        <div className="pill-group">
          {(['all', 'apartments', 'commercial'] as const).map((v) => (
            <div
              key={v}
              className={`pill${filters.units === v ? ' active' : ''}`}
              onClick={() => setPart({ units: v })}
            >
              {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="label">Rooms</div>
        <div className="pill-group">
          {(['all', '1', '2', '3', '4', '5'] as const).map((v) => (
            <div
              key={v}
              className={`pill${filters.rooms === v ? ' active' : ''}`}
              onClick={() => setPart({ rooms: v })}
            >
              {v === 'all' ? 'All' : v}
            </div>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="label">Floors</div>
        <div className="range">
          <input
            type="range" min={1} max={12} value={filters.floorMin}
            onChange={(e) => setPart({ floorMin: Math.min(+e.target.value, filters.floorMax) })}
          />
          <input
            type="range" min={1} max={12} value={filters.floorMax}
            onChange={(e) => setPart({ floorMax: Math.max(+e.target.value, filters.floorMin) })}
          />
          <div className="vals"><span>{filters.floorMin}</span><span>{filters.floorMax}</span></div>
        </div>
      </div>
    </aside>
  );
}
