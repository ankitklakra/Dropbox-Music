'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiPlay, FiMusic } from 'react-icons/fi';
import { usePlayer } from '@/lib/context/PlayerContext';
import { Track } from '@/lib/context/PlayerContext';
import { isAuthenticated } from '@/lib/services/dropboxService';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import PlayerControls from '@/components/player/PlayerControls';

type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
};

export default function Playlists() {
  const { playlist, setPlaylist, playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated with Dropbox
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Load playlists from localStorage on mount
    const savedPlaylists = localStorage.getItem('userPlaylists');
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch (e) {
        console.error('Failed to parse playlists from localStorage:', e);
      }
    }
  }, [router]);

  // Save playlists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  // Create a new playlist
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      tracks: [],
    };
    
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
  };

  // Delete a playlist
  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
    if (selectedPlaylist?.id === id) {
      setSelectedPlaylist(null);
    }
  };

  // Select a playlist
  const selectPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  // Play all tracks in a playlist
  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return;
    
    setPlaylist(playlist.tracks);
    playTrack(playlist.tracks[0]);
  };

  // Save the current queue as a playlist
  const saveCurrentQueueAsPlaylist = () => {
    if (playlist.length === 0) return;
    
    const playlistName = prompt('Enter a name for this playlist:');
    if (!playlistName) return;
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: playlistName.trim(),
      tracks: [...playlist],
    };
    
    setPlaylists([...playlists, newPlaylist]);
  };

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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-4 sm:mb-6">My Playlists</h1>
          
          {/* Create New Playlist */}
          <div className="bg-secondary-light rounded-lg p-3 sm:p-6 shadow-md mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-accent mb-3 sm:mb-4">Create New Playlist</h2>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Playlist Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 p-2 bg-secondary-lighter border border-secondary-dark rounded text-accent text-sm"
              />
              <button
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim()}
                className="px-3 py-2 bg-primary text-white rounded disabled:opacity-50 text-sm"
              >
                <FiPlus className="inline mr-1" /> Create
              </button>
            </div>
            
            {playlist.length > 0 && (
              <button
                onClick={saveCurrentQueueAsPlaylist}
                className="mt-3 sm:mt-4 px-3 py-2 bg-secondary text-accent rounded hover:bg-secondary-darker transition-colors text-sm"
              >
                Save Current Queue as Playlist
              </button>
            )}
          </div>
          
          {/* Playlists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {playlists.length === 0 ? (
              <div className="col-span-full bg-secondary-light rounded-lg p-4 sm:p-6 shadow-md text-center">
                <FiMusic className="mx-auto text-3xl sm:text-4xl text-accent-muted mb-2" />
                <p className="text-accent-muted text-sm sm:text-base">No playlists yet. Create one to get started!</p>
              </div>
            ) : (
              playlists.map(playlist => (
                <div 
                  key={playlist.id}
                  className={`bg-secondary-light rounded-lg p-3 sm:p-4 shadow-md cursor-pointer transition-colors ${
                    selectedPlaylist?.id === playlist.id ? 'border-2 border-primary' : ''
                  }`}
                  onClick={() => selectPlaylist(playlist)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-accent truncate text-sm sm:text-base">{playlist.name}</h3>
                    <div className="flex gap-1 sm:gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playPlaylist(playlist);
                        }}
                        className="p-1 sm:p-2 text-accent hover:text-primary transition-colors"
                        disabled={playlist.tracks.length === 0}
                      >
                        <FiPlay className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete playlist "${playlist.name}"?`)) {
                            deletePlaylist(playlist.id);
                          }
                        }}
                        className="p-1 sm:p-2 text-accent hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-accent-muted">
                    {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                  </p>
                </div>
              ))
            )}
          </div>
          
          {/* Selected Playlist Details */}
          {selectedPlaylist && (
            <div className="mt-6 bg-secondary-light rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-accent mb-4">{selectedPlaylist.name}</h2>
              
              {selectedPlaylist.tracks.length === 0 ? (
                <p className="text-accent-muted">This playlist is empty. Add tracks from your library.</p>
              ) : (
                <div className="space-y-2">
                  {selectedPlaylist.tracks.map((track, index) => (
                    <div 
                      key={`${track.id}-${index}`}
                      className="flex justify-between items-center p-3 bg-secondary hover:bg-secondary-lighter rounded-md transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-accent truncate">{track.name}</h3>
                        {track.artist && <p className="text-sm text-accent-muted truncate">{track.artist}</p>}
                      </div>
                      <button 
                        onClick={() => playTrack(track)}
                        className="p-2 text-accent hover:text-primary transition-colors"
                      >
                        <FiPlay />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    if (selectedPlaylist.tracks.length > 0) {
                      playPlaylist(selectedPlaylist);
                    }
                  }}
                  disabled={selectedPlaylist.tracks.length === 0}
                  className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                >
                  Play All
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <PlayerControls />
    </div>
  );
} 