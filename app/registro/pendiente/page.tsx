import Link from 'next/link';

export default function PendingRegistrationPage() {
  return (
    <main className="register-screen pending-screen">
      <section className="register-card">
        <div className="card-head"><div><h2>Cuenta pendiente de autorización</h2><p>Enviaremos la autorización al correo del tutor registrado.</p></div></div>
        <p className="p">Por protección de menores, la cuenta quedará limitada hasta que madre, padre o tutor confirme el consentimiento.</p>
        <Link href="/login" className="btn btn-primary btn-full">Volver al acceso</Link>
      </section>
    </main>
  );
}
