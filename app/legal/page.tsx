import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const legalItems = [
  ['Aviso de privacidad', '/legal/privacy'],
  ['Términos y condiciones', '/legal/terms'],
  ['Uso de imagen', '/legal/uso-de-imagen'],
  ['Consentimiento tutor', '/legal/minor-consent'],
  ['Reglamento', '/legal/reglamento'],
];

export default function LegalIndexPage() {
  return (
    <main className="legal-page">
      <Link href="/torneos" className="back-link"><ChevronLeft size={18}/> Volver</Link>
      <section className="legal-card">
        <div className="kicker">Legal ProKicks</div>
        <h1>Documentos legales</h1>
        <p>Base provisional preparada para conectar PDFs descargables cuando estén aprobados.</p>
        <div className="list section">
          {legalItems.map(([label, href]) => (
            <Link key={href} href={href} className="btn btn-soft btn-full">{label}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
