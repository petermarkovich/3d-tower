import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACO_DECODER } from './constants';

/* єдиний інстанс на всю app — без повторної ініціалізації WASM */
let _draco: DRACOLoader | null = null;
let _gltf: GLTFLoader | null = null;

export function getGLTFLoader(): GLTFLoader {
  if (typeof window === 'undefined') {
    throw new Error('getGLTFLoader must be called on the client');
  }
  if (!_gltf) {
    _draco = new DRACOLoader();
    _draco.setDecoderPath(DRACO_DECODER);
    _gltf = new GLTFLoader();
    _gltf.setDRACOLoader(_draco);
  }
  return _gltf;
}
