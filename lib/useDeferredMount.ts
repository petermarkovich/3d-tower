'use client';
import { useEffect, useState } from 'react';

/**
 * Повертає true через `delay` мс після монтування — але не раніше ніж
 * браузер намалює перший кадр (через подвійний rAF). Використовується щоб
 * відкласти важкий WebGL-canvas доти, доки View Transition-кросфейд завершиться,
 * інакше ініціалізація 3D блокує головний потік і анімація «підвисає».
 */
export function useDeferredMount(delay = 450): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        timer = setTimeout(() => setReady(true), delay);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  return ready;
}
