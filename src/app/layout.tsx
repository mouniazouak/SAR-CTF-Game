import type { Metadata } from 'next';
import './globals.css';

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
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('sar_theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
