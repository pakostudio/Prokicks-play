'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronDown, Download, FileText, GraduationCap, ImageIcon, LayoutDashboard,
  LogOut, MapPin, Menu, RefreshCw, ShieldCheck, Trophy, Users, Video, X, Zap, Eye
} from 'lucide-react';

type NavChild = { key: string; href: string; label: string };
type NavItem = { key: string; href: string; label: string; icon: any; children?: NavChild[] };

const NAV: NavItem[] = [
  { key: 'dashboard', href: '/admin', label: 'Panel', icon: LayoutDashboard },
  {
    key: 'torneos', href: '/admin/torneos', label: 'Torneos', icon: Trophy,
    children: [
      { key: 'torneos', href: '/admin/torneos', label: 'Ver torneos' },
      { key: 'checkin', href: '/admin/check-in', label: 'Check-in' },
      { key: 'resultados', href: '/admin/resultados', label: 'Resultados' },
      { key: 'videos', href: '/admin/videos', label: 'Videos' },
      { key: 'materiales', href: '/admin/materiales', label: 'Materiales' },
      { key: 'transmision', href: '/admin/torneos#transmision', label: 'Transmisión en vivo' }
    ]
  },
  { key: 'registros', href: '/admin/registros-torneos', label: 'Registros', icon: FileText },
  { key: 'retas', href: '/admin/retas', label: 'Retas', icon: Zap },
  { key: 'usuarios', href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { key: 'clinicas', href: '/admin/clinicas', label: 'Clínicas', icon: GraduationCap },
  { key: 'spots', href: '/admin/spots', label: 'Spots', icon: MapPin },
  { key: 'galeria', href: '/admin/galeria', label: 'Galería', icon: ImageIcon },
  { key: 'vision', href: '/vision', label: 'Vision', icon: Eye },
  { key: 'export', href: '/admin/export', label: 'Reportes', icon: Download }
];

function isChildActive(item: NavItem, active: string) {
  return !!item.children?.some((c) => c.key === active);
}

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="admin-clock" suppressHydrationWarning> </span>;
  const date = now.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' });
  const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <span className="admin-clock" suppressHydrationWarning>
      <span className="admin-clock-date">{date}</span>
      <span className="admin-clock-time">{time}</span>
    </span>
  );
}

export function AdminShell({ children, active = 'dashboard' }: { children: React.ReactNode; active?: string }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function logout() {
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => null);
    router.replace('/admin/login');
  }

  function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 700);
  }

  return (
    <main className="app-shell admin-shell admin-shell-v2">
      {mobileOpen && <div className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link href="/admin" className="admin-sidebar-brand" onClick={() => setMobileOpen(false)}>
            <Image src="/logo-blanco.png" alt="ProKicks" width={120} height={34} className="admin-sidebar-mark" priority />
          </Link>
          <button type="button" className="admin-sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const parentActive = active === item.key || isChildActive(item, active);
            if (!item.children) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`admin-sb-item ${parentActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            }
            const open = parentActive;
            return (
              <div key={item.key} className={`admin-sb-group ${open ? 'open' : ''}`}>
                <Link
                  href={item.href}
                  className={`admin-sb-item admin-sb-parent ${parentActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                  <ChevronDown size={15} className="admin-sb-chevron" />
                </Link>
                <div className="admin-sb-children">
<div>
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={`admin-sb-child ${active === child.key ? 'active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
</div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/play" className="tag tag-blue admin-sb-app-link">Ver app</Link>
          <button type="button" className="tag tag-warm admin-logout" onClick={logout}>
            <LogOut size={14} /> Salir
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <button type="button" className="admin-hamburger" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <Menu size={20} />
          </button>

          <div className="admin-topbar-title">
            <ShieldCheck size={16} />
            <span>Panel de administración</span>
          </div>

          <div className="admin-topbar-right">
            <LiveClock />
            <button type="button" className="admin-refresh" onClick={refresh} aria-label="Actualizar">
              <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            </button>
            <span className="admin-user-chip">
              <span className="admin-user-dot" />
              Administrador
            </span>
          </div>
        </div>

        <div className="admin-content-inner">
          {children}
        </div>
      </section>
    </main>
  );
}
