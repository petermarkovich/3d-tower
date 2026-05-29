import * as THREE from 'three';
import { APT_TEXTURE_NAMES, APT_HOUSE_TEXTURE_NAMES, aptTextureUrl } from './constants';

type Side = 'front' | 'back' | 'double';
interface MatConfig {
  side?: Side;
  color?: number;
  material?: 'basic' | 'standard';
  metalness?: number;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
  noTexture?: boolean;
  depthWrite?: boolean;
  alpha?: boolean;
  envMap?: THREE.Texture;
  envMapIntensity?: number;
  anisotropy?: number;
}

const OVERRIDES: Record<string, MatConfig> = {
  // FrontSide — нормалі стін/стелі вказують у кімнату; верхня cap
  // (нормаль вгору) автоматично культується з виду зверху
  sauna:           { side: 'front' },
  ceiling:         { side: 'front' },
  walls:           { side: 'front' },
  saunawalls:      { side: 'front' },
  outdoortable:    { side: 'double' },
  umbrellas:       { side: 'double' },
  ceilinglight:    { side: 'front', color: 0xffffff, material: 'basic', noTexture: true },
  cutline:         { side: 'front', color: 0xb9b9b9, material: 'basic', noTexture: true },
  joinerytop:      { side: 'front', color: 0xebdcd0, material: 'basic', noTexture: true },
  kitchenled:      { color: 0xffffff, material: 'basic', noTexture: true },
  monstera:        { alpha: true },
  bubbles:         { transparent: true, opacity: 0.8 },
  blackmetal:      { color: 0x3a3a3a, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  frames:          { color: 0x3a3a3a, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  intglaz:         { color: 0xebeced, material: 'standard', metalness: 0.15, roughness: 0.5, transparent: true, opacity: 0.2, noTexture: true },
  intglass:        { side: 'double', color: 0xebeced, material: 'standard', metalness: 0.15, roughness: 0.5, transparent: true, opacity: 0.2, noTexture: true },
  furnblack:       { color: 0x383838, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  gold:            { color: 0xb3831b, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  silver:          { color: 0xb1b0af, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  chairlegs:       { color: 0xc0bbb7, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  aptglaz:         { side: 'double', color: 0xDCDCE3, noTexture: true, metalness: 0, roughness: 1, transparent: true, opacity: 0.3, depthWrite: false, envMapIntensity: 0.25 },
  girl:            { anisotropy: 100 },
  doorhinges:      { color: 0xffffff, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  showerblack:     { side: 'double', color: 0x3a3a3a, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  bathroomtap:     { color: 0xc28317, material: 'standard', metalness: 0.3, roughness: 0.25, noTexture: true },
  bathroomdrain:   { color: 0xc28317, material: 'standard', metalness: 0.3, roughness: 0.25, noTexture: true },
  bathroomshower:  { color: 0xc28317, material: 'standard', metalness: 0.3, roughness: 0.25, noTexture: true },
  doorhandles:     { color: 0xc28317, material: 'standard', metalness: 0.3, roughness: 0.25, noTexture: true },
  bathroommirror:  { material: 'standard', metalness: 0.02, roughness: 0.02 },
  kitchentap:      { color: 0xc28317, material: 'standard', metalness: 0.3, roughness: 0.25, noTexture: true },
  wardrobehandles: { color: 0xc28317, material: 'standard', metalness: 0.3, roughness: 0.25, noTexture: true },
  bathroomframes:  { color: 0xc28317, material: 'standard', metalness: 0.3, roughness: 0.25, noTexture: true },
  kitchensink:     { color: 0x3a3a3a, material: 'standard', metalness: 0.15, roughness: 0.5, noTexture: true },
  enterwalk:       { transparent: true, opacity: 0 },
};
const DEFAULTS: Required<Pick<MatConfig,'transparent'|'opacity'|'side'|'color'|'noTexture'|'metalness'|'roughness'>> = {
  transparent: false, opacity: 1, side: 'double', color: 0xffffff,
  noTexture: false, metalness: 0, roughness: 1,
};

function sideEnum(s: Side | undefined): THREE.Side {
  if (s === 'front') return THREE.FrontSide;
  if (s === 'back')  return THREE.BackSide;
  return THREE.DoubleSide;
}

function configureTexture(tex: THREE.Texture, anisotropy = 16) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.channel = 0;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  // mipmapBias =-0.5 (з voltaskai) — sharpen mipmap sampling
  const t = tex as THREE.Texture & { mipmapBias?: number };
  if (t.mipmapBias !== undefined) t.mipmapBias = -0.5;
}

export interface ApartmentMaterials {
  materials: Record<string, THREE.Material>;
  env?: THREE.Texture;
  enterwalkPos: THREE.Vector3 | null;
  floorMeshes: THREE.Mesh[];
  wallMeshes: THREE.Mesh[];
}

function normalizeMeshName(name: string): string {
  let t = name.replace(/^Obj_/i, '').replace(/_COLLIDE$/i, '').toLowerCase();
  if (!t.includes('apartment_')) {
    t = t.replace(/[._\s]\d+/g, '').replace(/_\d+$/, '');
  }
  return t;
}

export function applyApartmentMaterials(root: THREE.Object3D): ApartmentMaterials {
  const textureUrls: Record<string, string> = {};
  let env: THREE.Texture | undefined;
  const texLoader = new THREE.TextureLoader();

  // 1) збираємо URL текстур та env
  [...APT_TEXTURE_NAMES, ...APT_HOUSE_TEXTURE_NAMES].forEach((name) => {
    const url = aptTextureUrl(name);
    const lower = name.toLowerCase();
    if (lower.startsWith('env')) {
      const t = texLoader.load(url);
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      env = t;
      return;
    }
    let alias = lower;
    if (lower.charAt(lower.length - 2) === '-') alias = lower.substring(0, lower.length - 2);
    else if (lower.charAt(lower.length - 3) === '-') alias = lower.substring(0, lower.length - 3);
    textureUrls[lower] = url;
    if (alias !== lower) textureUrls[alias] = url;
  });

  const materials: Record<string, THREE.Material> = {};

  function createMaterial(key: string, extra: Partial<MatConfig> = {}): THREE.Material | null {
    if (materials[key]) return materials[key];
    const cfg: MatConfig = { ...DEFAULTS, ...(OVERRIDES[key] || {}), ...extra };
    const side = sideEnum(cfg.side);
    const transparent = !!(cfg.transparent || (cfg.opacity ?? 1) < 1 || cfg.alpha);
    const alphaExtra: Partial<THREE.MaterialParameters> = cfg.alpha ? { alphaTest: 0.5 } : {};
    const isStandard = (cfg.metalness ?? 0) > 0 || (cfg.roughness ?? 1) < 1;

    let mat: THREE.Material;
    if (isStandard) {
      const std = new THREE.MeshStandardMaterial({
        color: cfg.color, side, transparent, opacity: cfg.opacity,
        metalness: cfg.metalness, roughness: cfg.roughness,
        ...(cfg.depthWrite === false ? { depthWrite: false } : {}),
        ...alphaExtra,
      });
      if (cfg.envMap || env) {
        std.envMap = cfg.envMap || env!;
        std.envMapIntensity = cfg.envMapIntensity ?? 1;
      }
      mat = std;
    } else {
      mat = new THREE.MeshBasicMaterial({
        color: cfg.color, side, transparent, opacity: cfg.opacity,
        ...(cfg.depthWrite === false ? { depthWrite: false } : {}),
        ...alphaExtra,
      });
    }
    materials[key] = mat;

    const url = textureUrls[key];
    if (!cfg.noTexture && url) {
      texLoader.load(
        url,
        (tex) => {
          configureTexture(tex, cfg.anisotropy ?? 16);
          (mat as THREE.MeshBasicMaterial | THREE.MeshStandardMaterial).map = tex;
          mat.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.warn(`[apt texture FAILED] ${key} ←`, url, err);
        }
      );
    }
    return mat;
  }

  let enterwalkPos: THREE.Vector3 | null = null;
  const floorMeshes: THREE.Mesh[] = [];
  const wallMeshes: THREE.Mesh[] = [];

  root.traverse((s) => {
    if (!(s as THREE.Mesh).isMesh || !s.name) return;
    const mesh = s as THREE.Mesh;
    const key = normalizeMeshName(s.name);
    if (!key) return;

    if (key.startsWith('enterwalk')) {
      mesh.updateWorldMatrix(true, false);
      enterwalkPos = new THREE.Vector3();
      mesh.getWorldPosition(enterwalkPos);
      mesh.visible = false;
      return;
    }
    if (key === 'centerpoint' || key.startsWith('centerpoint')) {
      mesh.visible = false;
      return;
    }
    if (key.includes('floor')) floorMeshes.push(mesh);
    // walls + cutline (зовнішня оболонка) + facade — це колізійні поверхні
    if (key === 'walls' || key === 'cutline' || key === 'facade') wallMeshes.push(mesh);

    const extra: Partial<MatConfig> = key === 'aptglaz' && env ? { envMap: env, envMapIntensity: 1 } : {};
    const mat = createMaterial(key, extra);
    if (mat) mesh.material = mat;
  });

  return { materials, env, enterwalkPos, floorMeshes, wallMeshes };
}
