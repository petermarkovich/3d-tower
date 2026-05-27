'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { MODEL_URL } from '@/lib/constants';
import { getGLTFLoader } from '@/lib/gltfLoader';
import { loadBuildingMaterials, applyBuildingMaterials } from '@/lib/buildingMaterials';
import type { Apartment } from '@/lib/types';
import { findApartmentForMesh } from '@/lib/useApartments';
type OrbitControlsImpl = {
  target: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  update: () => void;
  enabled: boolean;
  autoRotate: boolean;
};

interface SceneProps {
  apartments: Apartment[];
  hoveredId: number | null;
  onHoverApartment: (apt: Apartment | null, screenX?: number, screenY?: number) => void;
  onClickApartment: (apt: Apartment) => void;
  paused?: boolean;
}

function Model({ apartments, hoveredId, onHoverApartment, onClickApartment }: SceneProps) {
  const { camera, gl, controls } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    gl: THREE.WebGLRenderer;
    controls: OrbitControlsImpl | null;
  };
  const [root, setRoot] = useState<THREE.Object3D | null>(null);
  const apartmentMeshes = useRef<THREE.Mesh[]>([]);
  const hoveredMeshRef = useRef<THREE.Mesh | null>(null);
  const pendingFrame = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; minDist: number; maxDist: number } | null>(null);

  const apartmentsRef = useRef(apartments);
  apartmentsRef.current = apartments;
  useEffect(() => {
    if (!apartments.length) return;
    let cancelled = false;
    getGLTFLoader().load(MODEL_URL, (gltf) => {
      if (cancelled) return;
      const r = gltf.scene;
      const materials = loadBuildingMaterials();
      applyBuildingMaterials(r, materials);

      apartmentMeshes.current = [];
      r.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return;
        const lower = (obj.name || '').toLowerCase();
        if (!lower.includes('apartment_')) return;
        const apt = findApartmentForMesh(obj.name, apartmentsRef.current);
        if (!apt) { obj.visible = false; return; }
        const mat = new THREE.MeshStandardMaterial({
          color: 0xffffff, transparent: true, opacity: 0,
          depthTest: false, depthWrite: false,
        });
        (obj as THREE.Mesh).material = mat;
        (obj as THREE.Mesh).renderOrder = 2;
        obj.userData.apt = apt;
        apartmentMeshes.current.push(obj as THREE.Mesh);
      });

      const box = new THREE.Box3().setFromObject(r);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov;
      const dist = maxDim / (2 * Math.tan(Math.PI * fov / 360));
      camera.near = maxDim / 100;
      camera.far = maxDim * 100;
      camera.updateProjectionMatrix();
      pendingFrame.current = {
        pos: new THREE.Vector3(center.x + dist * 0.9, center.y + dist * 0.5, center.z + dist * 0.9),
        target: center.clone(),
        minDist: maxDim * 0.3,
        maxDist: maxDim * 3,
      };
      setRoot(r);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apartments.length > 0]);

  useEffect(() => {
    if (!controls || !pendingFrame.current) return;
    const { pos, target, minDist, maxDist } = pendingFrame.current;
    camera.position.copy(pos);
    controls.target.copy(target);
    controls.minDistance = minDist;
    controls.maxDistance = maxDist;
    controls.update();
  }, [controls, root, camera]);

  function setHL(mesh: THREE.Mesh | null, on: boolean) {
    if (!mesh) return;
    const m = mesh.material as THREE.MeshStandardMaterial;
    if (on) {
      const st = (mesh.userData.apt as Apartment | undefined)?.status;
      if (st === 'booked' || st === 'sold') { m.color.set('#e3cdbb'); m.opacity = 0.8; }
      else { m.color.set('#B0734E'); m.opacity = 0.6; }
    } else {
      m.color.set('#ffffff'); m.opacity = 0;
    }
  }

  // hover/click через raycaster в useFrame
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (!apartmentMeshes.current.length) return;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(apartmentMeshes.current, true);
      const hit = (hits.length ? hits[0].object : null) as THREE.Mesh | null;
      if (hit !== hoveredMeshRef.current) {
        if (hoveredMeshRef.current) setHL(hoveredMeshRef.current, false);
        hoveredMeshRef.current = hit;
        if (hit) {
          setHL(hit, true);
          onHoverApartment(hit.userData.apt as Apartment, e.clientX, e.clientY);
          gl.domElement.style.cursor = 'pointer';
        } else {
          onHoverApartment(null);
          gl.domElement.style.cursor = 'grab';
        }
      }
    };
    const onClick = () => {
      const hit = hoveredMeshRef.current;
      if (hit && hit.userData.apt) onClickApartment(hit.userData.apt as Apartment);
    };
    gl.domElement.addEventListener('pointermove', onMove);
    gl.domElement.addEventListener('click', onClick);
    return () => {
      gl.domElement.removeEventListener('pointermove', onMove);
      gl.domElement.removeEventListener('click', onClick);
    };
  }, [camera, gl, raycaster, pointer, onHoverApartment, onClickApartment]);

  // зовнішній hover з таблиці → синхронізувати підсвітку
  useEffect(() => {
    if (!apartmentMeshes.current.length) return;
    const mesh = apartmentMeshes.current.find((m) => (m.userData.apt as Apartment | undefined)?.id === hoveredId);
    if (hoveredMeshRef.current && hoveredMeshRef.current !== mesh) {
      setHL(hoveredMeshRef.current, false);
    }
    if (mesh && hoveredMeshRef.current !== mesh) {
      setHL(mesh, true);
      hoveredMeshRef.current = mesh;
    } else if (!hoveredId && hoveredMeshRef.current) {
      setHL(hoveredMeshRef.current, false);
      hoveredMeshRef.current = null;
    }
  }, [hoveredId]);

  return root ? <primitive object={root} /> : null;
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[20, 30, 15]} intensity={1.6} color={0xffe9c8} castShadow />
      <directionalLight position={[-15, 8, -15]} intensity={0.5} color={0x6a8fc0} />
    </>
  );
}

export function BuildingScene(props: SceneProps) {
  return (
    <Canvas
      id="scene"
      shadows
      frameloop={props.paused ? 'never' : 'always'}
      camera={{ fov: 45, near: 0.1, far: 2000, position: [10, 8, 14] }}
      gl={{ antialias: true, outputColorSpace: THREE.SRGBColorSpace, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[0xfafaf8]} />
      <SceneLights />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
