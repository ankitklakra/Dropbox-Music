'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { usePlayer } from '@/lib/context/PlayerContext';

const formatTime = (time: number): string => {
  if (isNaN(time) || time < 0) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const PlayerControls = () => {
  const {
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
  } = usePlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const progressRef = useRef<HTMLInputElement>(null);

  // For debugging
  // useEffect(() => {
  //   console.log('PlayerControls: currentTime updated:', currentTime, 'duration:', duration);
  // }, [currentTime, duration]);

  // Update local progress when currentTime changes
  useEffect(() => {
    if (!isDragging && typeof currentTime === 'number' && !isNaN(currentTime)) {
      setLocalProgress(currentTime);
    }
  }, [currentTime, isDragging]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseFloat(e.target.value);
    setLocalProgress(newPosition);
  };

  const handleProgressStart = () => {
    setIsDragging(true);
  };

  const handleProgressCommit = () => {
    // console.log('Committing progress change from', currentTime, 'to', localProgress);
    seekToPosition(localProgress);
    setIsDragging(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume || 0.5);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  useEffect(() => {
    if (volume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (volume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [volume, isMuted]);

  // Determine if next/prev buttons should be disabled
  const isNextDisabled = !currentTrack || playlist.length <= 1;
  const isPrevDisabled = !currentTrack || playlist.length <= 1;

  // If there's no current track, show a minimal version of the player
  if (!currentTrack) {
    return (
      <div className="player-container bg-secondary-light p-4 rounded-lg">
        <div className="text-center text-accent-muted">
          No track selected. Browse your library to play music.
        </div>
      </div>
    );
  }

  const progressPercentage = duration ? (localProgress / duration) * 100 : 0;

  return (
    <div className="player-container bg-secondary-light p-2 sm:p-3 md:p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
        {/* Track Info */}
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          {currentTrack.thumbnail && (
            <img 
              src={currentTrack.thumbnail} 
              alt={`${currentTrack.name} cover`} 
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base md:text-md font-medium text-accent truncate">{currentTrack.name}</h4>
            {currentTrack.artist && (
              <p className="text-xs sm:text-sm text-accent-muted truncate">{currentTrack.artist}</p>
            )}
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center order-first md:order-none mb-2 md:mb-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={prevTrack} 
              className={`player-button ${isPrevDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isPrevDisabled}
            >
              <FiSkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={togglePlayPause} 
              className="player-button p-2 sm:p-3 bg-primary rounded-full text-accent"
            >
              {isPlaying ? 
                <FiPause className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                <FiPlay className="w-4 h-4 sm:w-5 sm:h-5" />
              }
            </button>
            <button 
              onClick={nextTrack} 
              className={`player-button ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isNextDisabled}
            >
              <FiSkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <div className="w-full flex items-center gap-1 sm:gap-2 mt-1">
            <span className="text-xs text-accent-muted w-8 sm:w-10 text-right">{formatTime(localProgress)}</span>
            <div className="flex-1 relative">
              <input
                ref={progressRef}
                type="range"
                min={0}
                max={duration || 100}
                value={localProgress}
                onChange={handleProgressChange}
                onMouseDown={handleProgressStart}
                onTouchStart={handleProgressStart}
                onMouseUp={handleProgressCommit}
                onTouchEnd={handleProgressCommit}
                className="w-full absolute inset-0 opacity-0 z-10 cursor-pointer"
              />
              <div className="slider h-1.5 sm:h-2 bg-secondary-dark rounded-full overflow-hidden">
                <div 
                  className="slider-inner bg-primary h-full" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-accent-muted w-8 sm:w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="hidden md:flex justify-end items-center">
          <div className="relative flex items-center">
            <button 
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="player-button"
            >
              {isMuted || volume === 0 ? 
                <FiVolumeX className="w-5 h-5" /> : 
                <FiVolume2 className="w-5 h-5" />
              }
            </button>
            
            <div 
              className={`absolute bottom-full md:bottom-auto md:right-full mb-2 md:mb-0 md:mr-2 w-24 bg-secondary-lighter p-2 rounded-md transition-opacity ${
                showVolumeSlider ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 sm:h-2 rounded-md accent-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls; 