import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const title       = 'NOBBY | Portfolio';
const description = 'システムエンジニア NOBBYのポートフォリオ。ドラクエ風RPGを探索しているような感覚で、これまでの経験やスキルを紹介しています。';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,

  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "NOBBY'S Adventure",
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "NOBBY'S Adventure",
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
