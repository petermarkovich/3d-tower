'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Apartment } from './types';
import { HOUSE_ID } from './constants';

export interface Filters {
  available: boolean;
  units: 'all' | 'apartments' | 'commercial';
  rooms: 'all' | string;
  floorMin: number;
  floorMax: number;
}

export const DEFAULT_FILTERS: Filters = {
  available: false, units: 'all', rooms: 'all', floorMin: 1, floorMax: 12,
};

export function passesFilter(a: Apartment, f: Filters): boolean {
  if (f.available && a.status !== 'available') return false;
  if (f.rooms !== 'all' && String(a.rooms_count ?? '') !== f.rooms) return false;
  const fl = parseInt(String(a.floor ?? 0), 10);
  if (fl && (fl < f.floorMin || fl > f.floorMax)) return false;
  return true;
}

export function useApartments() {
  const [all, setAll] = useState<Apartment[]>([]);
  useEffect(() => {
    fetch('/apartments.json')
      .then((r) => r.json())
      .then((data: Apartment[]) => setAll(data))
      .catch(() => setAll([]));
  }, []);

  const apartments = useMemo(
    () => all.filter((a) => a.house && a.house.id === HOUSE_ID),
    [all]
  );
  return apartments;
}

export function findApartmentForMesh(name: string, apartments: Apartment[]): Apartment | null {
  if (!name) return null;
  const parts = name.split('_');
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1];
  const lastFloat = parseFloat(last);
  return apartments.find((a) =>
    (a.number_num != null && parseFloat(a.number_num) === lastFloat) ||
    String(a.number).toLowerCase() === last.toLowerCase() ||
    String(a.id) === last
  ) || null;
}
