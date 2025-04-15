'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/services/dropboxService';
import { PlayerProvider } from '@/lib/context/PlayerContext';

// Suppress hydration warnings
// This is necessary due to browser extensions like Grammarly that modify the DOM
const originalConsoleError = console.error;
if (typeof window !== 'undefined') {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning: Text content did not match.') ||
        args[0]?.includes?.('Warning: Expected server HTML to contain a matching') ||
        args[0]?.includes?.('Hydration failed because')) {
      return;
    }
    originalConsoleError(...args);
  };
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Client-only component to handle authentication
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check authentication only after component is mounted
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Return null on first render to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return children;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen" suppressHydrationWarning>
        <PlayerProvider>
          <ClientOnly>
            {children}
          </ClientOnly>
        </PlayerProvider>
      </body>
    </html>
  );
} 