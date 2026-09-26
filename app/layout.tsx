import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

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
  title: {
    default: 'ArtistePulse | Talent & Show Organiser',
    template: '%s | ArtistePulse',
  },
  description: 'Manage artists, groups, venues, contracts, and show schedules in one place.',
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
    <html lang="en" className={firaGO.variable} suppressHydrationWarning>
      <body className={`${firaGO.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
