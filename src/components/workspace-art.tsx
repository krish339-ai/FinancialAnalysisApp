'use client';

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { FinancialSculpture } from './financial-sculpture';
import { useReducedMotion } from './use-reduced-motion';

/** A small edition of the landing artwork; deliberately separate from the charts. */
export function WorkspaceArt({ mode = 0, edition = '01' }: { mode?: number; edition?: string }) {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  return <figure className="workspace-art">
    <div className="workspace-art-coordinate" aria-hidden="true"><span>+</span> PERSPECTIVE / {edition}</div>
    <div className="workspace-art-orbit" aria-hidden="true" />
    <FinancialSculpture mode={mode} paused={paused || reduced} />
    <figcaption>Generative artwork</figcaption>
    <button className="workspace-art-toggle" aria-label={reduced ? 'Artwork motion reduced by your system preference' : paused ? 'Play workspace artwork' : 'Pause workspace artwork'} disabled={reduced} onClick={() => setPaused(value => !value)}>
      {paused || reduced ? <Play size={13} /> : <Pause size={13} />}
    </button>
  </figure>;
}
