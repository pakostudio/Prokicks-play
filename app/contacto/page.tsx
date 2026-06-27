import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export default function ContactoPage() {
  return (
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">Contacto</div>
        <h1 className="h1">Soporte ProKicks</h1>
        <p className="p">Canales preparados para torneos, compras y alianzas.</p>
      </section>
      <section className="grid section detail-bottom-safe">
        <Link className="card row" href="https://wa.me/525624492892"><MessageCircle color="#173B63" /><div><h2 className="card-title">WhatsApp</h2><p className="p">+52 56 2449 2892</p></div></Link>
        <a className="card row" href="mailto:pako@sportcstudio.com"><Mail color="#173B63" /><div><h2 className="card-title">Email</h2><p className="p">pako@sportcstudio.com</p></div></a>
      </section>
    </AppShell>
  );
}
