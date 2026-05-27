'use client';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { APARTMENT_MODEL_URL } from '@/lib/constants';
import { getGLTFLoader } from '@/lib/gltfLoader';
import { applyApartmentMaterials, type ApartmentMaterials } from '@/lib/apartmentMaterials';
type OrbitControlsImpl = {
  target: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  update: () => void;
  enabled: boolean;
  autoRotate: boolean;
};

interface InteriorProps {
  onLoad: (info: { enterwalkPos: THREE.Vector3 | null; floorMeshes: THREE.Mesh[]; boxY: { min: number; max: number } }) => void;
}

function Interior({ onLoad }: InteriorProps) {
  void onLoad;
  const { camera, controls } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    controls: OrbitControlsImpl | null;
  };
  const [root, setRoot] = useState<THREE.Object3D | null>(null);
  const pendingFrame = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; minDist: number; maxDist: number } | null>(null);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useEffect(() => {
    let cancelled = false;
    getGLTFLoader().load(APARTMENT_MODEL_URL, (gltf) => {
      if (cancelled) return;
      const r = gltf.scene;
      const mats: ApartmentMaterials = applyApartmentMaterials(r);

      const box = new THREE.Box3().setFromObject(r);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov;
      const dist = maxDim / (2 * Math.tan(Math.PI * fov / 360));
      const pos = new THREE.Vector3(
        center.x + dist * 0.35,
        center.y + dist * 1.15,
        center.z + dist * 0.55,
      );
      camera.near = maxDim / 100;
      camera.far = maxDim * 100;
      camera.updateProjectionMatrix();
      pendingFrame.current = { pos, target: center.clone(), minDist: maxDim * 0.2, maxDist: maxDim * 4 };

      setRoot(r);
      onLoadRef.current({ enterwalkPos: mats.enterwalkPos, floorMeshes: mats.floorMeshes, boxY: { min: box.min.y, max: box.max.y } });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!controls || !pendingFrame.current) return;
    const { pos, target, minDist, maxDist } = pendingFrame.current;
    camera.position.copy(pos);
    controls.target.copy(target);
    controls.minDistance = minDist;
    controls.maxDistance = maxDist;
    controls.update();
  }, [controls, root, camera]);

  return root ? <primitive object={root} /> : null;
}

export interface ApartmentSceneApi {
  enterWalkmode: () => void;
  exitWalkmode: () => void;
  isWalkmode: () => boolean;
}

interface SceneProps {
  apiRef: React.MutableRefObject<ApartmentSceneApi | null>;
  onWalkmodeChange: (active: boolean) => void;
  onIconPos: (pos: { x: number; y: number; visible: boolean } | null) => void;
}

function SceneInner({ apiRef, onWalkmodeChange, onIconPos }: SceneProps) {
  const { camera, gl, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; gl: THREE.WebGLRenderer; controls: { target: THREE.Vector3; enabled: boolean; autoRotate: boolean; update: () => void; minDistance: number; maxDistance: number } };
  const enterwalkPos = useRef<THREE.Vector3 | null>(null);
  const floorMeshes = useRef<THREE.Mesh[]>([]);
  const walkMode = useRef(false);
  const walkYaw = useRef(0);
  const walkPitch = useRef(0);
  const walkTween = useRef<{ from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number } | null>(null);
  const orbitSave = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; fov: number; autoRotate: boolean } | null>(null);
  const modelBoxY = useRef<{ min: number; max: number } | null>(null);
  const screenV = useMemo(() => new THREE.Vector3(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const eyeHeight = () => {
    if (!modelBoxY.current) return enterwalkPos.current?.y ?? 1.5;
    return modelBoxY.current.min + (modelBoxY.current.max - modelBoxY.current.min) * 0.55;
  };

  const applyWalkLook = () => {
    const dir = new THREE.Vector3(
      Math.sin(walkYaw.current) * Math.cos(walkPitch.current),
      Math.sin(walkPitch.current),
      Math.cos(walkYaw.current) * Math.cos(walkPitch.current)
    );
    camera.lookAt(camera.position.clone().add(dir));
  };

  const enterWalkmode = () => {
    if (walkMode.current || !enterwalkPos.current || !controls) return;
    orbitSave.current = {
      pos: camera.position.clone(),
      target: controls.target.clone(),
      fov: camera.fov,
      autoRotate: controls.autoRotate,
    };
    walkMode.current = true;
    controls.enabled = false;
    controls.autoRotate = false;
    const eyeY = eyeHeight();
    camera.position.set(enterwalkPos.current.x, eyeY, enterwalkPos.current.z);
    const lookDir = new THREE.Vector3().subVectors(orbitSave.current.target, camera.position);
    lookDir.y = 0;
    if (lookDir.lengthSq() < 1e-6) lookDir.set(0, 0, 1);
    lookDir.normalize();
    walkYaw.current = Math.atan2(lookDir.x, lookDir.z);
    walkPitch.current = 0;
    applyWalkLook();
    camera.fov = 75;
    camera.updateProjectionMatrix();
    onWalkmodeChange(true);
  };

  const exitWalkmode = () => {
    if (!walkMode.current) return;
    walkMode.current = false;
    walkTween.current = null;
    if (orbitSave.current && controls) {
      camera.position.copy(orbitSave.current.pos);
      controls.target.copy(orbitSave.current.target);
      camera.fov = orbitSave.current.fov;
      controls.autoRotate = orbitSave.current.autoRotate;
      camera.updateProjectionMatrix();
      controls.enabled = true;
      controls.update();
    }
    onWalkmodeChange(false);
  };

  // експозиція API — оновлюємо КОЖЕН рендер,
  // щоб closures бачили актуальні camera/controls
  apiRef.current = { enterWalkmode, exitWalkmode, isWalkmode: () => walkMode.current };

  // mouse handlers
  useEffect(() => {
    let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
    let dragMoved = false;
    const onMouseDown = (e: MouseEvent) => {
      if (!walkMode.current) return;
      drag = { x: e.clientX, y: e.clientY, yaw: walkYaw.current, pitch: walkPitch.current };
      dragMoved = false;
      gl.domElement.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!walkMode.current || !drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 4) dragMoved = true;
      const sens = 0.005;
      walkYaw.current = drag.yaw - dx * sens;
      walkPitch.current = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, drag.pitch - dy * sens));
      applyWalkLook();
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!walkMode.current || !drag) return;
      const wasDrag = dragMoved;
      drag = null; dragMoved = false;
      gl.domElement.style.cursor = '';
      if (wasDrag) return;
      const r = gl.domElement.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      const ndc = new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const targets = floorMeshes.current.filter((m) => m.visible);
      const hits = raycaster.intersectObjects(targets, false);
      if (!hits.length) return;
      const p = hits[0].point;
      walkTween.current = {
        from: camera.position.clone(),
        to: new THREE.Vector3(p.x, eyeHeight(), p.z),
        t: 0, dur: 0.7,
      };
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && walkMode.current) exitWalkmode(); };
    gl.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKey);
    return () => {
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [camera, gl, raycaster]);

  // кешуємо попередню позицію іконки, щоб не дьоргати React state кожен кадр
  const lastIconPos = useRef<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const updateIcon = (next: { x: number; y: number; visible: boolean }) => {
    const prev = lastIconPos.current;
    if (prev.visible === next.visible &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5) return;
    lastIconPos.current = next;
    onIconPos(next);
  };

  useFrame((_, dt) => {
    if (walkMode.current && walkTween.current) {
      walkTween.current.t += dt / walkTween.current.dur;
      const k = Math.min(1, walkTween.current.t);
      const ease = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(walkTween.current.from, walkTween.current.to, ease);
      if (k >= 1) walkTween.current = null;
      applyWalkLook();
    }

    if (!walkMode.current && enterwalkPos.current) {
      screenV.copy(enterwalkPos.current).project(camera);
      if (screenV.z > 1) {
        updateIcon({ x: 0, y: 0, visible: false });
      } else {
        const r = gl.domElement.getBoundingClientRect();
        const sx = Math.max(-0.95, Math.min(0.95, screenV.x));
        const sy = Math.max(-0.95, Math.min(0.95, screenV.y));
        const px = (sx * 0.5 + 0.5) * r.width;
        const py = (-sy * 0.5 + 0.5) * r.height;
        updateIcon({ x: px, y: py, visible: true });
      }
    } else {
      updateIcon({ x: 0, y: 0, visible: false });
    }
  });

  const handleInteriorLoad = (info: { enterwalkPos: THREE.Vector3 | null; floorMeshes: THREE.Mesh[]; boxY: { min: number; max: number } }) => {
    enterwalkPos.current = info.enterwalkPos;
    floorMeshes.current = info.floorMeshes;
    modelBoxY.current = info.boxY;
  };

  return (
    <>
      <ambientLight intensity={0.9} />
      <hemisphereLight color={0xffffff} groundColor={0xffffff} intensity={0.6} />
      <directionalLight position={[10, 15, 8]} intensity={0.8} />
      <directionalLight position={[-12, -6, -10]} intensity={0.5} />
      <Suspense fallback={null}>
        <Interior onLoad={handleInteriorLoad} />
      </Suspense>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  );
}

export function ApartmentScene(props: SceneProps) {
  return (
    <Canvas
      camera={{ fov: 45, position: [8, 6, 8] }}
      gl={{
        antialias: true,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: 'high-performance',
      }}
    >
      <color attach="background" args={[0xf1eee7]} />
      <SceneInner {...props} />
    </Canvas>
  );
}
