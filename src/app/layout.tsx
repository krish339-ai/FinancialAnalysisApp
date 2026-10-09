import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Shell } from '@/components/shell';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Aureli · Financial clarity', template: '%s · Aureli' }, description: 'A thoughtful view of your complete financial picture. Explore the synthetic Aureli demo.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a><Shell>{children}</Shell></body></html>; }
