import * as THREE from 'three';
import { BUILDING_TEXTURES, TEX_DIR } from './constants';

const TREE_BASE = /^(tree\d+|bush03)$/;
const TREE_ALPHA = /^(tree\d+a|bush03a)$/;

export type MaterialMap = Record<string, THREE.Material | THREE.Texture>;

function defaultBasic(tex: THREE.Texture): THREE.MeshBasicMaterial {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return new THREE.MeshBasicMaterial({ map: tex });
}

export function loadBuildingMaterials(): MaterialMap {
  const materials: MaterialMap = {};
  const texLoader = new THREE.TextureLoader();

  BUILDING_TEXTURES.forEach((filename) => {
    const url = TEX_DIR + filename;
    const base = filename.split('.')[0];
    const baseLower = base.toLowerCase();
    const alias =
      base.length >= 2 && base.charAt(base.length - 2) === '-'
        ? base.substring(0, base.length - 2)
        : base;

    const tex = texLoader.load(url);

    if (filename.startsWith('env')) {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      materials.env = tex;
      const glass = materials.glass as THREE.MeshBasicMaterial | undefined;
      if (glass) {
        glass.envMap = tex;
      }
    } else if (filename.startsWith('shadow')) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.flipY = false;
      materials.shadowAlpha = tex;
    } else if (filename.startsWith('bronze')) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2, metalness: 0.25 });
      materials.bronze = m;
    } else if (TREE_BASE.test(baseLower)) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      materials[baseLower] = new THREE.MeshBasicMaterial({
        map: tex, alphaTest: 0.5, transparent: true, side: THREE.DoubleSide,
      });
    } else if (TREE_ALPHA.test(baseLower)) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.flipY = false;
      const stem = baseLower.substring(0, baseLower.length - 1);
      const m = materials[stem] as THREE.MeshBasicMaterial | undefined;
      if (m) m.alphaMap = tex;
    } else {
      materials[baseLower] = defaultBasic(tex);
      if (alias !== base) materials[alias.toLowerCase()] = materials[baseLower];
    }
  });

  const env = materials.env as THREE.Texture | undefined;
  materials.shadow = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: 1,
    alphaMap: (materials.shadowAlpha as THREE.Texture) || null, alphaTest: 0,
    side: THREE.DoubleSide, depthWrite: false,
  });
  materials.dull = new THREE.MeshBasicMaterial({ color: 0xDBE0DB, side: THREE.DoubleSide });
  materials.greyfacade = new THREE.MeshBasicMaterial({ color: 0x2E2E2E, side: THREE.DoubleSide });
  materials.white = new THREE.MeshStandardMaterial({ color: 0xEDEDED, metalness: 0.2, roughness: 0.8, side: THREE.DoubleSide });
  materials.frames = new THREE.MeshStandardMaterial({ color: 0x383838, side: THREE.DoubleSide, roughness: 0.2, metalness: 0.5 });
  materials.aptglass = new THREE.MeshBasicMaterial({
    color: 0xDCE0E3, transparent: true, opacity: 0.3,
    envMap: env || null, depthWrite: false, side: THREE.DoubleSide,
  });
  materials.glass = new THREE.MeshBasicMaterial({
    color: 0xC3CCD4, transparent: true, opacity: 0.85,
    envMap: env || null, depthWrite: false, side: THREE.DoubleSide,
  });
  materials.podglaz = new THREE.MeshStandardMaterial({
    color: 0xA3B3BF, metalness: 0.75, roughness: 0.5, transparent: true, opacity: 0.5,
    envMap: env || null, envMapIntensity: 1, depthWrite: false, side: THREE.DoubleSide,
  });
  materials.podiumglaz = new THREE.MeshStandardMaterial({
    color: 0xA3B3BF, metalness: 0.75, roughness: 0.5, transparent: true, opacity: 0.5,
    envMapIntensity: 1, depthWrite: false, side: THREE.DoubleSide,
  });
  materials.pots = new THREE.MeshStandardMaterial({ color: 0x474747, side: THREE.DoubleSide });
  materials.ghost = new THREE.MeshBasicMaterial({ color: 0xE6EBED, side: THREE.BackSide, transparent: true, opacity: 0.5 });

  return materials;
}

export interface ApplyStats { applied: number; missed: number; hidden: number; }

export function applyBuildingMaterials(root: THREE.Object3D, materials: MaterialMap): ApplyStats {
  let applied = 0, missed = 0, hidden = 0;
  const missing = new Set<string>();
  root.traverse((s) => {
    if (!(s as THREE.Mesh).isMesh) return;
    const mesh = s as THREE.Mesh;
    let name = mesh.name;
    if (!name) return;

    if (name.includes('GHOST_')) { mesh.visible = false; hidden++; return; }
    if (['building_podium','building_towera','building_towerb'].includes(name.toLowerCase())) {
      mesh.visible = false; hidden++; return;
    }
    if (name.includes('BILLBOARD')) {
      mesh.onBeforeRender = function (_r, _sc, cam) { mesh.lookAt(cam.position); };
    } else if (name.startsWith('TREE')) {
      name = name.split('_')[0].toLowerCase();
    }
    const lower = name.toLowerCase();
    if (lower.includes('apartment_')) return;  // обробляється окремо

    if (materials[lower] && (materials[lower] as THREE.Material).isMaterial) {
      mesh.material = materials[lower] as THREE.Material; applied++;
    } else if (name.includes('FRAMES'))  { mesh.material = materials.frames as THREE.Material; applied++; }
    else if (name.startsWith('AGLASS'))  { mesh.material = materials.aptglass as THREE.Material; applied++; }
    else if (name.includes('GLASS'))     { mesh.material = materials.glass as THREE.Material; applied++; }
    else if (name.includes('PODGLAZ'))   { mesh.material = materials.podglaz as THREE.Material; applied++; }
    else if (name === 'BLACKFACADE')     { mesh.material = materials.greyfacade as THREE.Material; applied++; }
    else if (name === 'LOGO')            { mesh.material = materials.white as THREE.Material; applied++; }
    else if (name.includes('STUFF') || name === 'TABLE' || name === 'DECK') {
      mesh.material = materials.dull as THREE.Material; applied++;
    } else {
      missed++; missing.add(mesh.name);
    }
  });
  if (missing.size) console.log('Building no-mat:', [...missing].slice(0, 30));
  return { applied, missed, hidden };
}
