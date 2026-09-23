import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '../src/components/common/AppShell';

const firaGO = localFont({
  src: [
    {
      path: '../public/fonts/firago/firago-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/firago/firago-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/firago/firago-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/firago/firago-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/firago/firago-latin-800-normal.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-firago',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ArtistePulse - Talent & Show Organiser',
  description: 'Manage artists, groups, hotel venues, contracts, and daily show rotations.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka" className={firaGO.variable} suppressHydrationWarning>
      <body className={`${firaGO.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
