'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/services/dropboxService';
import { PlayerProvider } from '@/lib/context/PlayerContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <PlayerProvider>
          {isClient ? children : null}
        </PlayerProvider>
      </body>
    </html>
  );
} 