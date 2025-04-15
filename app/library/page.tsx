'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import PlayerControls from '@/components/player/PlayerControls';
import { isAuthenticated, listAudioFiles } from '@/lib/services/dropboxService';
import { usePlayer } from '@/lib/context/PlayerContext';
import { Track } from '@/lib/types';
import { FiMusic, FiPlay, FiPause, FiPlus } from 'react-icons/fi';

export default function Library() {
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying, togglePlayPause, addToPlaylist, setPlaylist } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if user is authenticated with Dropbox
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Load tracks from Dropbox
    const fetchTracks = async () => {
      setLoading(true);
      setError(null);

      try {
        const audioTracks = await listAudioFiles();
        setTracks(audioTracks);
        
        // Initialize the playlist with all tracks
        setPlaylist(audioTracks);
      } catch (err) {
        console.error('Failed to load tracks:', err);
        setError('Failed to load your music library. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [router, setPlaylist]);

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(track => {
    const query = searchQuery.toLowerCase();
    return (
      track.name.toLowerCase().includes(query) ||
      (track.artist && track.artist.toLowerCase().includes(query))
    );
  });

  // Handle track play/pause
  const handleTrackPlay = (track: Track) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
      
      // Save to recently played in localStorage
      const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      const updatedRecent = [
        track,
        ...recentlyPlayed.filter((t: Track) => t.id !== track.id),
      ].slice(0, 20); // Keep only last 20 tracks
      
      localStorage.setItem('recentlyPlayed', JSON.stringify(updatedRecent));
    }
  };

  // Add track to current playlist
  const handleAddToPlaylist = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering play/pause
    addToPlaylist(track);
  };

  return (
    <div className="flex h-screen bg-secondary text-accent-muted overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto main-content w-full">
        {/* App Title - Centered on mobile */}
        <div className="md:hidden text-center py-3 border-b border-secondary-lighter">
          <h1 className="text-xl font-bold text-accent">
            <span className="text-primary">Dropbox</span> Music
          </h1>
        </div>
        
        <div className="container mx-auto p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent">Your Library</h1>
            
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search music..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-secondary-light border border-secondary-lighter rounded-full py-2 px-4 text-sm text-accent focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-4 sm:mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary"></div>
            </div>
          ) : filteredTracks.length > 0 ? (
            <div className="bg-secondary-light rounded-lg overflow-hidden">
              {/* Desktop table view */}
              <table className="hidden sm:table responsive-table min-w-full divide-y divide-secondary-lighter">
                <thead className="bg-secondary">
                  <tr>
                    <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-accent-muted uppercase tracking-wider">#</th>
                    <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-accent-muted uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-accent-muted uppercase tracking-wider">Artist</th>
                    <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-accent-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-lighter">
                  {filteredTracks.map((track, index) => (
                    <tr 
                      key={track.id}
                      onClick={() => handleTrackPlay(track)}
                      className="hover:bg-secondary-lighter cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2 sm:mr-4 bg-secondary-lighter rounded flex items-center justify-center">
                            {track.thumbnail ? (
                              <img src={track.thumbnail} alt={track.name} className="w-full h-full rounded" />
                            ) : (
                              <FiMusic className="text-accent-muted" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-accent">{track.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-accent-muted">
                        {track.artist || 'Unknown Artist'}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackPlay(track);
                            }}
                            className="player-button"
                          >
                            {currentTrack && currentTrack.id === track.id && isPlaying ? (
                              <FiPause className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <FiPlay className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </button>
                          <button 
                            onClick={(e) => handleAddToPlaylist(track, e)}
                            className="player-button"
                            title="Add to playlist"
                          >
                            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Mobile card view */}
              <div className="sm:hidden space-y-2 p-2">
                {filteredTracks.map((track, index) => (
                  <div 
                    key={track.id}
                    onClick={() => handleTrackPlay(track)}
                    className="bg-secondary p-3 rounded-lg flex items-center gap-3 hover:bg-secondary-lighter cursor-pointer transition-colors duration-150"
                  >
                    <div className="w-10 h-10 flex-shrink-0 bg-secondary-lighter rounded flex items-center justify-center">
                      {track.thumbnail ? (
                        <img src={track.thumbnail} alt={track.name} className="w-10 h-10 rounded" />
                      ) : (
                        <FiMusic className="text-accent-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-accent truncate">{track.name}</div>
                      <div className="text-xs text-accent-muted truncate">
                        {track.artist || 'Unknown Artist'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackPlay(track);
                        }}
                        className="player-button"
                      >
                        {currentTrack && currentTrack.id === track.id && isPlaying ? (
                          <FiPause className="w-4 h-4" />
                        ) : (
                          <FiPlay className="w-4 h-4" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => handleAddToPlaylist(track, e)}
                        className="player-button"
                        title="Add to playlist"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-12 bg-secondary-light rounded-lg">
              <FiMusic className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-accent-muted mb-4" />
              <h2 className="text-lg sm:text-xl font-medium text-accent mb-2">No tracks found</h2>
              <p className="text-sm text-accent-muted">
                {searchQuery ? 'Try a different search term.' : 'Add music to your Dropbox to see them here.'}
              </p>
            </div>
          )}
        </div>
      </main>

      <PlayerControls />
    </div>
  );
} 