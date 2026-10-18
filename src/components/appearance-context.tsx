'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';

export type Appearance = 'obsidian' | 'ivory';
export type ArtworkStyle = 'weave' | 'orbit';
const themeKey = 'aureli.appearance';
const artworkKey = 'aureli.artwork';
type Preferences = {
  theme: Appearance; artwork: ArtworkStyle;
  setTheme: (theme: Appearance) => void;
  setArtwork: (artwork: ArtworkStyle) => void;
};
const AppearanceContext = createContext<Preferences | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [theme, updateTheme] = useState<Appearance>('obsidian');
  const [artwork, updateArtwork] = useState<ArtworkStyle>('weave');
  useEffect(() => {
    function restore() {
      try {
        const nextTheme = localStorage.getItem(themeKey) === 'ivory' ? 'ivory' : 'obsidian';
        updateTheme(nextTheme);
        document.documentElement.dataset.theme = nextTheme;
        updateArtwork(localStorage.getItem(artworkKey) === 'orbit' ? 'orbit' : 'weave');
      } catch { /* Preferences still work for this visit when storage is unavailable. */ }
    }
    function storage(event: StorageEvent) { if (event.key === themeKey || event.key === artworkKey || event.key === null) restore(); }
    restore(); window.addEventListener('storage', storage);
    return () => window.removeEventListener('storage', storage);
  }, []);
  function setTheme(value: Appearance) {
    updateTheme(value); document.documentElement.dataset.theme = value;
    try { localStorage.setItem(themeKey, value); } catch { /* Keep the in-memory choice. */ }
  }
  function setArtwork(value: ArtworkStyle) {
    updateArtwork(value);
    try { localStorage.setItem(artworkKey, value); } catch { /* Keep the in-memory choice. */ }
  }
  return <AppearanceContext.Provider value={{ theme, artwork, setTheme, setArtwork }}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('AppearanceProvider is required.');
  return value;
}

export function AppearanceToggle() {
  const { theme, setTheme } = useAppearance();
  const label = theme === 'obsidian' ? 'Switch to Porcelain & Ink light theme' : 'Switch to Obsidian dark theme';
  return <button type="button" className="appearance-toggle" aria-label={label} title={label} onClick={() => setTheme(theme === 'obsidian' ? 'ivory' : 'obsidian')}>
    {theme === 'obsidian' ? <Sun size={19} strokeWidth={1.6} /> : <Moon size={18} strokeWidth={1.6} />}
  </button>;
}

export function ArtworkPicker() {
  const { artwork, setArtwork } = useAppearance();
  return <label className="artwork-picker"><span>Artwork</span><select aria-label="Artwork style" value={artwork} onChange={event => setArtwork(event.target.value === 'orbit' ? 'orbit' : 'weave')}><option value="weave">Living weave</option><option value="orbit">Orbital field</option></select></label>;
}

export function AppearanceSettings() {
  const { theme, setTheme } = useAppearance();
  return <section className="panel appearance-settings" aria-labelledby="appearance-title">
    <h2 id="appearance-title" className="settings-title">Make it yours.</h2>
    <p>Choose the light and artwork you feel at home with. Your choices are remembered on this device.</p>
    <div className="theme-choices" role="group" aria-label="Color theme">
      <button type="button" className="theme-choice" aria-pressed={theme === 'obsidian'} onClick={() => setTheme('obsidian')}><span className="theme-swatch swatch-obsidian" aria-hidden="true"><i /><i /><i /></span><span><strong>Obsidian</strong><small>Dark, sage & ivory · Default</small></span><Moon size={18} /></button>
      <button type="button" className="theme-choice" aria-pressed={theme === 'ivory'} onClick={() => setTheme('ivory')}><span className="theme-swatch swatch-ivory" aria-hidden="true"><i /><i /><i /></span><span><strong>Porcelain &amp; Ink</strong><small>Light, blue & bronze</small></span><Sun size={18} /></button>
    </div>
    <ArtworkPicker />
  </section>;
}
