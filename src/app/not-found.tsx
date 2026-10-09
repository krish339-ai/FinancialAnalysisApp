import Link from 'next/link';
export default function NotFound() { return <div className="panel empty-state"><h1>This page isn’t here.</h1><p>Return to your financial overview.</p><Link className="button button-primary" href="/">Back to overview</Link></div>; }
