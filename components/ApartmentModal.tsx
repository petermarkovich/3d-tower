'use client';
import { useEffect, useRef, useState } from 'react';
import type { Apartment } from '@/lib/types';
import { ApartmentScene, type ApartmentSceneApi } from './ApartmentScene';

interface Props {
  apartment: Apartment | null;
  onClose: () => void;
}

export function ApartmentModal({ apartment, onClose }: Props) {
  const apiRef = useRef<ApartmentSceneApi | null>(null);
  const [walkActive, setWalkActive] = useState(false);
  const [iconPos, setIconPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (apiRef.current?.isWalkmode()) {
        apiRef.current.exitWalkmode();
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!apartment) return null;

  return (
    <div className="apt-modal show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog">
        <div className="head">
          <div>
            <div className="title">Apartment {apartment.number ?? '—'}</div>
          </div>
          <div className="meta">
            <div>Floor<b>{apartment.floor ?? '—'}</b></div>
            <div>Rooms<b>{apartment.rooms_count ?? '—'}</b></div>
            <div>Size<b>{apartment.area_size ?? '—'}</b></div>
            <div>Price<b dangerouslySetInnerHTML={{ __html: apartment.price_formatted ?? '—' }} /></div>
          </div>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <div className="apt-canvas-wrap">
            <ApartmentScene
              apiRef={apiRef}
              onWalkmodeChange={setWalkActive}
              onIconPos={setIconPos}
            />
          </div>
          {iconPos?.visible && !walkActive && (
            <div
              className="walk-icon show"
              style={{ left: iconPos.x, top: iconPos.y }}
              title="Walk mode"
              onClick={() => apiRef.current?.enterWalkmode()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13" cy="4" r="2" />
                <path d="M7 22l3-8 4 1 3 5" />
                <path d="M6 12l3-3 4 1 5-1" />
              </svg>
            </div>
          )}
          {walkActive && (
            <>
              <button className="walk-exit show" onClick={() => apiRef.current?.exitWalkmode()} title="Exit (Esc)">×</button>
              <div className="walk-hint show">Клік по підлозі — крок · Drag — огляд · Esc — вихід</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
