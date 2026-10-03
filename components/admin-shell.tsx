'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brand } from './brand';

const nav = [['Dashboard', '/admin'], ['Bookings', '/admin/bookings'], ['Workers', '/admin/workers'], ['Applications', '/admin/applications'], ['Services', '/admin/services'], ['Customers', '/admin/customers'], ['Reports', '/admin/reports'], ['Settings', '/admin/settings']];
const icons = ['⌂', '▤', '♙', '☷', '▦', '♧', '▥', '⚙'];

export function AdminShell({ name, email, children }: { name: string; email: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('admin-menu-is-open', menu);
    return () => document.body.classList.remove('admin-menu-is-open');
  }, [menu]);

  async function logout() {
    setBusy(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return <div className="admin-layout">
    <button className={`admin-drawer-backdrop ${menu ? 'is-visible' : ''}`} aria-label="Close navigation" onClick={() => setMenu(false)} />
    <aside className={`admin-sidebar ${menu ? 'admin-sidebar-open' : ''}`}>
      <div className="admin-logo"><Brand /><span>OPERATIONS</span></div>
      <nav>{nav.map(([label, href], i) => <Link key={href} href={href} onClick={() => setMenu(false)} className={`${path === href || (href !== '/admin' && path.startsWith(`${href}/`)) ? 'active' : ''} ${i === 4 ? 'nav-spacer' : ''}`}><span className="admin-nav-icon">{icons[i]}</span>{label}</Link>)}</nav>
      <div className="admin-sidebar-bottom"><span className="admin-status-dot" /> Dashboard is private</div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar">
        <button className="admin-menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle admin navigation" aria-expanded={menu}>☰</button>
        <div className="admin-breadcrumb">ONECREW <span>/</span> OPERATIONS</div>
        <div className="admin-user"><span className="admin-user-avatar">{name.slice(0, 1).toUpperCase()}</span><div><b>{name}</b><small>{email}</small></div><button onClick={logout} disabled={busy}>{busy ? '…' : 'Log out'}</button></div>
      </header>
      <div className="admin-content">{children}</div>
    </div>
  </div>;
}
