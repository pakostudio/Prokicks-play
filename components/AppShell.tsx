import Image from 'next/image';
import Link from 'next/link';
import { Home, Map, QrCode, Trophy, User } from 'lucide-react';

function BallAvatar() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#173B63" strokeWidth="3" />
      <polygon points="50,37 62.36,45.98 57.64,60.52 42.36,60.52 37.64,45.98" fill="#173B63" />
      <polygon points="50,12 57.6,17.53 54.7,26.47 45.3,26.47 42.4,17.53" fill="#173B63" />
      <polygon points="78.5,32.7 86.1,38.23 83.2,47.17 73.8,47.17 70.9,38.23" fill="#173B63" />
      <polygon points="67.6,66.3 75.2,71.83 72.3,80.77 62.9,80.77 60.0,71.83" fill="#173B63" />
      <polygon points="32.4,66.3 40.0,71.83 37.1,80.77 27.7,80.77 24.8,71.83" fill="#173B63" />
      <polygon points="21.5,32.7 29.1,38.23 26.2,47.17 16.8,47.17 13.9,38.23" fill="#173B63" />
    </svg>
  );
}

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
          <Image src="/logo-negro.png" alt="ProKicks" width={156} height={50} className="logo" priority />
        </Link>
        <Link href="/perfil" className="avatar">
          <BallAvatar />
        </Link>
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
