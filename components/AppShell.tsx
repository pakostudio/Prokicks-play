import Image from 'next/image';
import Link from 'next/link';
import { Home, Map, QrCode, Trophy, User } from 'lucide-react';

export function AppShell({ children, active = 'home' }: { children: React.ReactNode; active?: string }) {
  const nav = [
    { key: 'home', href: '/play', label: 'Inicio', icon: Home },
    { key: 'map', href: '/spots', label: 'Spots', icon: Map },
    { key: 'scan', href: '/scan', label: 'QR', icon: QrCode, scan: true },
    { key: 'torneos', href: '/torneos', label: 'Torneos', icon: Trophy },
    { key: 'perfil', href: '/perfil', label: 'Perfil', icon: User }
  ];

  return (
    <main className="app-shell">
      <div className="topbar">
        <Link href="/play" className="brand-pill">
          <Image src="/logo-negro.png" alt="ProKicks" width={132} height={42} className="logo" priority />
        </Link>
        <div className="top-actions">
          <Link href="/admin/login" className="tag tag-blue">Admin</Link>
          <Link href="/perfil" className="tag tag-blue">Perfil</Link>
        </div>
      </div>
      {children}
      <nav className="bottom-nav">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.href} className={`nav-item ${active === item.key ? 'active' : ''} ${item.scan ? 'scan-button' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
