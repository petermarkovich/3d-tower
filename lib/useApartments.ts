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
  sizeMin: number | null;
  sizeMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  view: string; // 'all' або ключ із VIEW_OPTIONS
  favorites: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  available: false, units: 'all', rooms: 'all', floorMin: 1, floorMax: 12,
  sizeMin: null, sizeMax: null, priceMin: null, priceMax: null,
  view: 'all', favorites: false,
};

/* View from window — ключ + ярлик + естонське слово в полі `view` */
export const VIEW_OPTIONS: { value: string; label: string; match: string | null }[] = [
  { value: 'all', label: 'All', match: null },
  { value: 'sea', label: 'Sea', match: 'Meri' },
  { value: 'roof', label: 'Roof terrace', match: 'Katuseterrass' },
  { value: 'paljassaare', label: 'Paljassaare', match: 'Paljassaare' },
  { value: 'oldtown', label: 'Old Town', match: 'Vanalinn' },
  { value: 'krulli', label: 'Krulli', match: 'Krulli' },
];

export function isCommercial(a: Apartment): boolean {
  const fn = a.function;
  if (fn && typeof fn === 'object' && !Array.isArray(fn)) {
    const keys = Object.keys(fn).join(' ').toLowerCase();
    return keys.includes('office') || keys.includes('commercial') || keys.includes('retail');
  }
  return false;
}

export interface RangeBounds {
  sizeMin: number; sizeMax: number; priceMin: number; priceMax: number;
}

export function computeBounds(apartments: Apartment[]): RangeBounds {
  const sizes = apartments.map((a) => parseFloat(String(a.area_size_raw ?? ''))).filter((n) => !isNaN(n));
  const prices = apartments.map((a) => parseFloat(String(a.price_raw ?? ''))).filter((n) => !isNaN(n));
  const round = (n: number, step: number, up: boolean) =>
    (up ? Math.ceil(n / step) : Math.floor(n / step)) * step;
  return {
    sizeMin: sizes.length ? Math.floor(Math.min(...sizes)) : 0,
    sizeMax: sizes.length ? Math.ceil(Math.max(...sizes)) : 500,
    priceMin: prices.length ? round(Math.min(...prices), 100, false) : 0,
    priceMax: prices.length ? round(Math.max(...prices), 100, true) : 1000000,
  };
}

export function passesFilter(a: Apartment, f: Filters, favorites?: Set<number>): boolean {
  if (f.available && a.status !== 'available') return false;
  if (f.units !== 'all') {
    const com = isCommercial(a);
    if (f.units === 'commercial' && !com) return false;
    if (f.units === 'apartments' && com) return false;
  }
  if (f.rooms !== 'all' && String(a.rooms_count ?? '') !== f.rooms) return false;
  const fl = parseInt(String(a.floor ?? 0), 10);
  if (fl && (fl < f.floorMin || fl > f.floorMax)) return false;

  const size = parseFloat(String(a.area_size_raw ?? ''));
  if (f.sizeMin != null && (isNaN(size) || size < f.sizeMin)) return false;
  if (f.sizeMax != null && (isNaN(size) || size > f.sizeMax)) return false;

  const price = parseFloat(String(a.price_raw ?? ''));
  if (f.priceMin != null && (isNaN(price) || price < f.priceMin)) return false;
  if (f.priceMax != null && (isNaN(price) || price > f.priceMax)) return false;

  if (f.view !== 'all') {
    const opt = VIEW_OPTIONS.find((o) => o.value === f.view);
    const v = String(a.view ?? '').toLowerCase();
    if (!opt?.match || !v.includes(opt.match.toLowerCase())) return false;
  }

  if (f.favorites && (!favorites || !favorites.has(a.id))) return false;

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
