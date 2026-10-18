import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Shell } from '@/components/shell';
import { AppearanceProvider } from '@/components/appearance-context';
import './globals.css';
import './obsidian.css';
import './landing.css';
import './workspace.css';
import './appearance.css';
export const metadata: Metadata = { title: { default: 'Aureli · Financial clarity', template: '%s · Aureli' }, description: 'A thoughtful view of your complete financial picture. Explore the synthetic Aureli demo.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en" data-theme="obsidian" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('aureli.appearance')==='ivory'?'ivory':'obsidian'}catch{}" }} /></head><body><AppearanceProvider><a href="#main-content" className="skip-link">Skip to content</a><Shell>{children}</Shell></AppearanceProvider></body></html>; }
