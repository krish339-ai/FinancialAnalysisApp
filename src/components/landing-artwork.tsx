'use client';

import { useEffect, useRef } from 'react';
import { useAppearance } from './appearance-context';
import { createLandingArtwork } from './landing-artwork-renderer';
import { useReducedMotion } from './use-reduced-motion';

export function LandingArtwork({ mode, sequence, description }: { mode: number; sequence: number; description: string }) {
  const { artwork, theme } = useAppearance();
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<ReturnType<typeof createLandingArtwork> | null>(null);
  const latest = useRef({ style: artwork, mode, sequence, light: theme === 'ivory', reduced });
  latest.current = { style: artwork, mode, sequence, light: theme === 'ivory', reduced };
  useEffect(() => {
    if (!canvas.current) return;
    renderer.current = createLandingArtwork(canvas.current, latest.current);
    return () => { renderer.current?.destroy(); renderer.current = null; };
  }, []);
  useEffect(() => { renderer.current?.set(latest.current); }, [artwork, mode, sequence, theme, reduced]);
  return <canvas ref={canvas} className="landing-artwork-canvas" role="img" aria-label={`${description} Conceptual artwork, not to scale.`}>Conceptual artwork illustrating {['net worth', 'income', 'surplus'][mode]}.</canvas>;
}
