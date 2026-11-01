import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dancing with the SARs | NASA Space Apps CTF & Forensics Workbench',
  description:
    'Security operations and geospatial forensics workbench for synthetic aperture radar (SAR) earth observation challenges. Analyze microwave backscatter, coherence loss, and InSAR phase fringes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#06090e] text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
