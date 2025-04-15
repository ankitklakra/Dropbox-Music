'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Track } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  playlist: Track[];
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  seekToPosition: (position: number) => void;
  playTrack: (track: Track) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  setPlaylist: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialized = useRef(false);
  const isLoading = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (!isInitialized.current) {
      audioRef.current = new Audio();
      isInitialized.current = true;
    }
  }, []);

  // Helper function to safely load and play audio
  const loadAndPlay = useCallback(async (url: string) => {
    if (!audioRef.current) return;
    
    try {
      // Set loading flag to prevent other operations
      isLoading.current = true;
      
      // Stop any current playback
      audioRef.current.pause();
      
      // Set new source and load
      audioRef.current.src = url;
      
      // Wait for metadata to load before playing
      const loadPromise = new Promise((resolve) => {
        const audio = audioRef.current;
        if (!audio) {
          resolve(false);
          return;
        }
        
        const handleLoaded = () => {
          audio.removeEventListener('loadedmetadata', handleLoaded);
          resolve(true);
        };
        audio.addEventListener('loadedmetadata', handleLoaded);
        
        // Also resolve if there's an error to prevent hanging
        const handleError = () => {
          audio.removeEventListener('error', handleError);
          console.error('Error loading audio');
          resolve(false);
        };
        audio.addEventListener('error', handleError);
      });
      
      // Load the audio file
      audioRef.current.load();
      
      // Wait for metadata to be loaded
      await loadPromise;
      
      // Only play if we're still supposed to be playing
      if (isPlaying && audioRef.current) {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error in loadAndPlay:', error);
    } finally {
      isLoading.current = false;
    }
  }, [isPlaying]);

  // Update audio element when current track changes
  useEffect(() => {
    if (currentTrack) {
      loadAndPlay(currentTrack.url);
    }
  }, [currentTrack, loadAndPlay]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLoading.current) return;

    const handlePlayPause = async () => {
      try {
        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (error) {
        console.error('Error toggling play/pause:', error);
      }
    };

    handlePlayPause();
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrackItem = playlist[nextIndex];
    
    setCurrentTrack(nextTrackItem);
    setIsPlaying(true);
  }, [playlist, currentTrack]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevTrackItem = playlist[prevIndex];
    
    setCurrentTrack(prevTrackItem);
    setIsPlaying(true);
  }, [playlist, currentTrack]);

  // Handle time updates and track ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextTrack]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
  }, []);

  const seekToPosition = useCallback((position: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = position;
      setCurrentTime(position);
    }
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const addToPlaylist = useCallback((track: Track) => {
    setPlaylistState(prev => {
      if (prev.some(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromPlaylist = useCallback((trackId: string) => {
    setPlaylistState(prev => prev.filter(track => track.id !== trackId));
  }, []);

  const setPlaylist = useCallback((tracks: Track[]) => {
    setPlaylistState(tracks);
  }, []);

  const value = {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    volume,
    playlist,
    togglePlayPause,
    nextTrack,
    prevTrack,
    setVolume,
    seekToPosition,
    playTrack,
    addToPlaylist,
    removeFromPlaylist,
    setPlaylist,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
} 