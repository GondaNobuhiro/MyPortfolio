import type { Metadata } from 'next';
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
    siteName: "NOBBY'S Portfolio",
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "NOBBY'S Portfolio — ドラクエ風ポートフォリオ",
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
    </html>
  );
}
