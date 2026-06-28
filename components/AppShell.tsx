'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, Map, QrCode, ShieldCheck, Trophy, User } from 'lucide-react';

type LocalProfile = {
  nickname?: string;
  avatar_image?: string;
  avatar_name?: string;
};

export function AppShell({ children, active = 'home' }: { children: React.ReactNode; active?: string }) {
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('prokicks_profile');
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      setProfile(null);
    }
  }, []);

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
        <Link href="/" className="brand-pill" aria-label="Ir a entrada ProKicks">
          <Image src="/logo-negro.png" alt="ProKicks" width={132} height={42} className="logo" priority />
        </Link>
        <div className="top-actions">
          <Link href="/admin/login" className="admin-top-link" aria-label="Admin"><ShieldCheck size={16} /> Admin</Link>
          <Link href="/perfil" className="avatar" aria-label="Perfil">
            {profile?.avatar_image ? <img src={profile.avatar_image} alt={profile.avatar_name || 'Avatar'} /> : 'PK'}
          </Link>
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
