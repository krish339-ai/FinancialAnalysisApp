'use client';
import { useState } from 'react';
import { useDemo } from './demo-context';
import { Button } from './ui/button';
export function ResetDemo() { const demo = useDemo(); const [done, setDone] = useState(false); return <><Button variant="outline" onClick={() => { demo.reset(); setDone(true); }}>Reset demo session</Button>{done && <p role="status" className="positive small">Session accounts cleared. Reference data is unchanged.</p>}</>; }
