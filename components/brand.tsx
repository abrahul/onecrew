import Link from 'next/link';

export function Brand({ light = false }: { light?: boolean }) {
  return <Link className={`brand ${light ? 'brand-light' : ''}`} href="/" aria-label="ONECREW home">
    <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
    <span className="brand-name">ONECREW<span className="brand-period">.</span><small>Your Daily Workforce Partner.</small></span>
  </Link>;
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '→'}</span>; }
