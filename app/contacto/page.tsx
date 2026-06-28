import Link from 'next/link';
import { Mail, MessageCircle, Star } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export default function ContactoPage() {
  return (
    <AppShell active="perfil">
      <section className="hero section">
        <div className="kicker">Contacto</div>
        <h1 className="h1">Contáctanos</h1>
        <p className="p">¿Quieres organizar una reta, resolver dudas o sumarte a la comunidad ProKicks? Contáctanos.</p>
      </section>
      <section className="grid section detail-bottom-safe">
        <Link className="card row" href="https://wa.me/525624492892"><MessageCircle color="#173B63" /><div><h2 className="card-title">Mandar WhatsApp</h2><p className="p">+52 56 2449 2892</p></div></Link>
        <a className="card row" href="mailto:pako@sportcstudio.com"><Mail color="#173B63" /><div><h2 className="card-title">Enviar email</h2><p className="p">pako@sportcstudio.com</p></div></a>
        <a className="card row" href="https://www.instagram.com/prokicksoficial?igsh=MTQyZDgwcTUwcTdxOQ==" target="_blank"><Star color="#173B63" /><div><h2 className="card-title">Seguir en Instagram</h2><p className="p">@prokicksoficial</p></div></a>
      </section>
    </AppShell>
  );
}
