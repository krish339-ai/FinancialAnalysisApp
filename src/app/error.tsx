'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="panel empty-state"><h1>We couldn’t load this view.</h1><p>Your sample data is safe. Try loading the page again.</p><button className="button button-primary" onClick={reset}>Try again</button></div>; }
