'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from './brand';
export function AdminLogin() {
  const router = useRouter(); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(''); const f = new FormData(e.currentTarget);
    try { const r = await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})}); const body = await r.json(); if (!r.ok) throw new Error(body.error || 'Unable to sign in.'); router.replace('/admin'); router.refresh(); }
    catch(e) { setError(e instanceof Error ? e.message : 'Unable to sign in.'); setBusy(false); }
  }
  return <div className="admin-login-page"><div className="admin-login-card"><Brand/><span className="eyebrow">ONECREW operations</span><h1>Welcome back.</h1><p>Sign in to manage bookings, teams and applications.</p><form onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254}/></label><label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256}/></label>{error&&<p role="alert" className="form-error">{error}</p>}<button className="button button-primary" disabled={busy}>{busy?'Signing in…':'Sign in securely'} <span>↗</span></button></form><small>Admin access only · Sign in attempts are rate limited</small></div></div>;
}
