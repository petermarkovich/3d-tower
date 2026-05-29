export const HOUSE_ID = 40;
export const MODEL_URL = '/models/model_draco-2.glb';
export const APARTMENT_MODEL_URL = '/models/apartment_073_draco.glb';
export const TEX_DIR = '/textures/';
export const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

/* Текстури для головної моделі будівлі */
export const BUILDING_TEXTURES: readonly string[] = [
  'abalconyconc.jpg','aterrace.jpg','awhitewalls.jpg',
  'billboard_001.jpg','billboard_002.jpg','bronze.jpg','ceiling_022.jpg',
  'env.jpg','girl.jpg','grassproject.jpg','jacuzzi.jpg','landscape.jpg',
  'lsbits.jpg','outdoorarmchair.jpg','outdoorsofa.jpg','outdoortable.jpg',
  'playground.jpg','podiumblack.jpg','podiumconc.jpg','shadow.png',
  'soil.jpg','terrace.jpg','towerablack.jpg','toweraceiling.jpg',
  'towerafloorplates.jpg','towerblack.jpg',
  'tree002.jpg','tree002a.jpg','tree003.jpg','tree003a.jpg',
  'tree004.jpg','tree004a.jpg','tree005.jpg','tree005a.jpg',
  'tree006.jpg','tree006a.jpg','tree007.jpg','tree007a.jpg',
  'tree008.jpg','tree008a.jpg','tree009.jpg','tree009a.jpg',
  'tree010.jpg','tree010a.jpg',
];

/* CDN-текстури для інтер'єру квартири 073 (через wsrv.nl) */
const APT_TEX_BASE      = 'https://wsrv.nl/?url=https%3A%2F%2Fvoltaskai.endover.ee%2Fwp-content%2Fuploads%2F2025%2F09%2F';
const APT_HOUSE_TEX_BASE = 'https://wsrv.nl/?url=https%3A%2F%2Fvoltaskai.endover.ee%2Fwp-content%2Fuploads%2F2025%2F10%2F';
const APT_TEX_SUFFIX = '.jpg&quality=90&output=webp';

export const APT_TEXTURE_NAMES: readonly string[] = [
  'aptglaz','armchair-3','armchairsbedroom','bath','bathroom-5','bathroomsink-5',
  'bathroomvanity','baxtertable','bedmain-5','bedmedium-2','bubbles','carpet-5',
  'carpetbig','chair-5','coffeetables-5','deckchair','doors-5','facade-5',
  'floor-5','floortiles-5','frontdoor-5','galotti-3','hottub','interior-doors',
  'kitchenbench-5','kitchencarcass-5','kitchendoors-5','outdoorarmchair-5',
  'outdoorcoffeetable-3','outdoortable-1','plant-5','pot-5','skirting-5',
  'stool-4','tiles-1','toilet-5','umbrella','walls-5','wardrobecarcass-5',
  'wardrobedoors-5',
];

export const APT_HOUSE_TEXTURE_NAMES: readonly string[] = ['env-1', 'girl'];

export function aptTextureUrl(name: string): string {
  const isHouse = (APT_HOUSE_TEXTURE_NAMES as readonly string[]).includes(name);
  return (isHouse ? APT_HOUSE_TEX_BASE : APT_TEX_BASE) + name + APT_TEX_SUFFIX;
}

/* Floorplan SVG (універсальне посилання за номером квартири) */
export function floorplanUrl(number: string | number): string {
  return `https://voltaskai.endover.ee/wp-content/uploads/2026/01/${number}.svg`;
}
