'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

const docs: Record<string, { title: string; type: string; body: string[] }> = {
  terms: { title: 'Términos y Condiciones', type: 'terms', body: ['Documento provisional para revisión legal antes de lanzamiento.', 'El usuario acepta usar ProKicks Play de forma responsable, respetar reglas de convivencia, seguridad, torneos y validación de resultados.', 'ProKicks podrá moderar cuentas, retas, torneos y contenido cuando exista abuso, fraude, riesgo o incumplimiento de reglas.'] },
  privacy: { title: 'Aviso de Privacidad', type: 'privacy_notice', body: ['Documento provisional para revisión legal antes de lanzamiento.', 'Se recaban datos mínimos: nombre, apellidos, fecha de nacimiento, email, estado, municipio o alcaldía, nickname, avatar y consentimientos.', 'No se solicita domicilio completo ni WhatsApp obligatorio. Los datos se usan para crear cuenta, operar retas, torneos, ranking y seguridad.'] },
  'image-release': { title: 'Autorización de uso de imagen', type: 'image_release', body: ['Consentimiento opcional y separado.', 'Autoriza el uso de fotografías o videos capturados en eventos ProKicks para comunicación, comunidad y difusión de actividades.', 'Este consentimiento podrá no marcarse sin impedir la creación de cuenta.'] },
  'uso-de-imagen': { title: 'Autorización de uso de imagen', type: 'image_release', body: ['Documento provisional para conectar PDF legal definitivo.', 'Autoriza el uso de fotografías o videos capturados en torneos ProKicks para comunicación, comunidad y difusión de actividades.', 'Este consentimiento se registra junto con la inscripción al torneo.'] },
  reglamento: { title: 'Reglamento Oficial de Competencia', type: 'rules', body: ['Documento provisional para conectar PDF legal definitivo.', 'El participante acepta las reglas deportivas, de convivencia, puntualidad, seguridad, validación de resultados y decisiones del comité organizador.', 'El incumplimiento puede derivar en cancelación de registro, descalificación o revisión administrativa.'] },
  marketing: { title: 'Consentimiento promocional', type: 'marketing_consent', body: ['Consentimiento opcional y separado.', 'Autoriza recibir comunicaciones promocionales, lanzamientos, eventos, torneos y novedades de ProKicks.', 'Puede rechazarse sin impedir el uso básico de la plataforma.'] },
  'minor-consent': { title: 'Autorización para menores', type: 'minor_consent', body: ['Documento provisional para revisión legal antes de lanzamiento.', 'Las cuentas de menores requieren autorización de madre, padre o tutor. La cuenta puede quedar pendiente hasta confirmación.', 'La plataforma debe proteger privacidad, ubicación y exposición pública de menores.'] }
};

export default function LegalPage() {
  const params = useParams<{ slug: string }>();
  const doc = docs[params.slug] || docs.terms;
  return (
    <main className="legal-page">
      <Link href="/registro" className="back-link"><ChevronLeft size={18}/> Volver</Link>
      <section className="legal-card">
        <div className="kicker">Documento provisional · {doc.type} · v1.0</div>
        <h1>{doc.title}</h1>
        {doc.body.map((p) => <p key={p}>{p}</p>)}
        <div className="alert ok">Pendiente de validación por abogado mexicano especializado en privacidad digital antes de lanzamiento.</div>
      </section>
    </main>
  );
}
