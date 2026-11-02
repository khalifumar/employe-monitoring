import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Navbar } from '@/components/layout/Navbar';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Selaras — Asisten Kesejahteraan & Harmoni Kerja Digital',
  description:
    'Sistem pemantauan ergonomi, kelelahan, dan ritme fokus tim dengan arsitektur Privacy-by-Design tanpa pengawasan individu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-ink dark:text-ink-dark transition-colors duration-200">
        <AppProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-border-light dark:border-border-dark py-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 Selaras. Riset Tugas Akhir Privacy-by-Design Ergonomics.</p>
              <p className="flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                k-Anonymity (k ≥ 5) Enforced at Database Engine
              </p>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
