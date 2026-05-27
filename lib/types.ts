export interface Apartment {
  id: number;
  number: string;
  number_num: string;
  floor: number;
  rooms_count: number | null;
  area_size: string;
  balcony_size?: string;
  price_formatted: string;
  status?: 'available' | 'booked' | 'sold' | null;
  house: { id: number };
  // … інші поля з API не використовуються
  [key: string]: unknown;
}
