'use client';

import Link from 'next/link';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { trackEvent } from '@/lib/analytics';

export default function ComprarPage() {
  return (
    <AppShell active="perfil">
      <section className="hero section"><div className="kicker">Comprar</div><h1 className="h1">ProKicks Shop</h1><p className="p">Preparado para compras en línea futuras.</p></section>
      <section className="grid section detail-bottom-safe">
        <Link className="btn btn-primary btn-full" href="https://prokicks.shop" onClick={() => trackEvent('Purchase CTA Clicked', { source: 'comprar' })}><ShoppingBag size={18} /> Ir a prokicks.shop</Link>
        <Link className="btn btn-soft btn-full" href="https://wa.me/525624492892" onClick={() => trackEvent('WhatsApp CTA Clicked', { source: 'comprar' })}><MessageCircle size={18} /> WhatsApp +52 56 2449 2892</Link>
      </section>
    </AppShell>
  );
}
