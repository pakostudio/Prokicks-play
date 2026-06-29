import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Observability } from '@/components/Observability';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProKicks Play',
  description: 'Encuentra spots, únete a torneos y compite con la comunidad ProKicks.',
  manifest: '/manifest.json',
  applicationName: 'ProKicks Play',
  appleWebApp: {
    capable: true,
    title: 'ProKicks',
    statusBarStyle: 'default'
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#173B63'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Observability />
        <Script src="/pwa-register.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
