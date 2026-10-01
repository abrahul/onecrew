'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Arrow } from './brand';
export function OpenTrackingLink() {
  const [link, setLink] = useState(''); const [error, setError] = useState(''); const router = useRouter();
  function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try {
      const url = new URL(link.trim(), window.location.origin);
      const match = url.pathname.match(/^\/track\/([A-Za-z0-9_-]{32,100})\/?$/);
      if (!match || (url.origin !== window.location.origin && !['onecrew.in', 'www.onecrew.in', 'onecrew.com', 'www.onecrew.com'].includes(url.hostname))) throw new Error('Paste the secure tracking link ONECREW sent you.');
      router.push(`/track/${match[1]}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Enter a valid tracking link.'); }
  }
  return <form className="open-track-form" onSubmit={submit}><label htmlFor="tracking-link">Paste your tracking link</label><div><input id="tracking-link" value={link} onChange={e => setLink(e.target.value)} placeholder="https://onecrew.in/track/…" required/><button className="button button-outline" type="submit">Open booking <Arrow /></button></div>{error && <small role="alert">{error}</small>}</form>;
}
