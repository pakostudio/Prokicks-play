import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProKicks Play',
  description: 'PWA para spots, QR, retas y ranking ProKicks',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
