'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, LogOut, MapPin, ShieldCheck, Trophy, Users, Zap } from 'lucide-react';

export function AdminShell({ children, active = 'dashboard' }: { children: React.ReactNode; active?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => null);
    router.replace('/admin/login');
  }

  const nav = [
    { key: 'dashboard', href: '/admin', label: 'Panel', icon: ShieldCheck },
    { key: 'torneos', href: '/admin/torneos', label: 'Torneos', icon: Trophy },
    { key: 'registros', href: '/admin/registros-torneos', label: 'Registros', icon: FileText },
    { key: 'usuarios', href: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { key: 'retas', href: '/admin/retas', label: 'Retas', icon: Zap },
    { key: 'spots', href: '/admin/spots', label: 'Spots', icon: MapPin }
  ];

  return (
    <main className="app-shell admin-shell">
      <div className="topbar">
        <Link href="/admin" className="brand-pill">
          <Image src="/logo-negro.png" alt="ProKicks" width={132} height={42} className="logo" priority />
        </Link>
        <div className="top-actions">
          <Link href="/play" className="tag tag-blue">App</Link>
          <button type="button" className="tag tag-warm admin-logout" onClick={logout}>
            <LogOut size={14}/> Salir
          </button>
        </div>
      </div>

      <section className="admin-nav section">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.href} className={`admin-nav-item ${active === item.key ? 'active' : ''}`}>
              <Icon size={16}/>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </section>

      {children}
    </main>
  );
}
