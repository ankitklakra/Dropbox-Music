'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import PlayerControls from '@/components/player/PlayerControls';
import { isAuthenticated } from '@/lib/services/dropboxService';
import { useRouter } from 'next/navigation';
import { Track } from '@/lib/types';
import { FiMusic, FiFolder } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [featured, setFeatured] = useState<Track[]>([]);

  useEffect(() => {
    // Check if user is authenticated with Dropbox
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Load recently played tracks from localStorage
    const recentlyPlayedData = localStorage.getItem('recentlyPlayed');
    if (recentlyPlayedData) {
      try {
        setRecentlyPlayed(JSON.parse(recentlyPlayedData));
      } catch (error) {
        console.error('Failed to parse recently played tracks:', error);
      }
    }

    // In a real app, we would fetch featured content or recommendations
    // For now, let's set some demo tracks
    setFeatured([
      // This would normally come from your API or Dropbox
    ]);
  }, [router]);

  return (
    <div className="flex h-screen bg-secondary text-accent-muted overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto main-content">
        {/* App Title - Centered on mobile */}
        <div className="md:hidden text-center py-3 border-b border-secondary-lighter">
          <h1 className="text-xl font-bold text-accent">
            <span className="text-primary">Dropbox</span> Music
          </h1>
        </div>
        
        <div className="container mx-auto p-3 sm:p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-4 sm:mb-8">Home</h1>
          
          {/* Welcome Section */}
          <section className="bg-gradient-to-r from-secondary-light to-secondary p-4 sm:p-8 rounded-xl mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-2xl font-bold text-accent mb-2 sm:mb-4">Welcome to Dropbox Music Player</h2>
            <p className="text-accent-muted mb-4 sm:mb-6 text-sm sm:text-base">
              Stream your personal music collection stored in Dropbox. Browse your library and create playlists.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button 
                onClick={() => router.push('/library')}
                className="bg-primary hover:bg-primary-dark text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <FiMusic className="w-4 h-4" />
                Browse Library
              </button>
              <button 
                onClick={() => router.push('/playlists')}
                className="bg-secondary-light hover:bg-secondary-lighter text-accent-muted px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors hover:text-accent duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <FiFolder className="w-4 h-4" />
                My Playlists
              </button>
            </div>
          </section>
          
          {/* Recently Played Section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-accent">Recently Played</h2>
              <button 
                onClick={() => router.push('/history')}
                className="text-primary hover:text-primary-light transition-colors duration-200 text-sm"
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentlyPlayed.length > 0 ? (
                recentlyPlayed.slice(0, 4).map((track) => (
                  <div 
                    key={track.id} 
                    className="bg-secondary-light p-4 rounded-md hover:bg-secondary-lighter transition-colors duration-200 cursor-pointer"
                  >
                    <div className="bg-secondary-lighter w-full aspect-square rounded-md flex items-center justify-center mb-3">
                      {track.thumbnail ? (
                        <img 
                          src={track.thumbnail} 
                          alt={track.name} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <FiMusic className="w-1/4 h-1/4 text-accent-muted" />
                      )}
                    </div>
                    <h3 className="text-accent font-medium truncate">{track.name}</h3>
                    {track.artist && (
                      <p className="text-accent-muted text-sm truncate">{track.artist}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-accent-muted">
                  No recently played tracks. Start playing music to see your history.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <PlayerControls />
    </div>
  );
} 