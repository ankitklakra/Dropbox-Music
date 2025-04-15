'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiSettings, FiInfo, FiGithub, FiHeart } from 'react-icons/fi';
import { logout, isAuthenticated } from '@/lib/services/dropboxService';
import Sidebar from '@/components/layout/Sidebar';
import PlayerControls from '@/components/player/PlayerControls';

export default function Settings() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check if user is authenticated with Dropbox
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setTimeout(() => {
      router.push('/login');
    }, 500);
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-4 sm:mb-6">Settings</h1>
          
          <div className="bg-secondary-light rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-accent mb-3 sm:mb-4 flex items-center">
              <FiSettings className="mr-2 flex-shrink-0" /> Account Settings
            </h2>
            
            <div className="border-t border-secondary-dark my-3 sm:my-4 pt-3 sm:pt-4">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-between w-full p-2 sm:p-3 text-left text-accent hover:bg-secondary-lighter rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <FiLogOut className="mr-2 sm:mr-3 text-red-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Logout from Dropbox</span>
                </div>
                {isLoggingOut ? (
                  <span className="text-xs sm:text-sm text-accent-muted">Logging out...</span>
                ) : (
                  <span className="text-xs sm:text-sm text-accent-muted">Disconnect your account</span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-secondary-light rounded-lg p-4 sm:p-6 shadow-md mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-accent mb-3 sm:mb-4 flex items-center">
              <FiInfo className="mr-2 flex-shrink-0" /> About
            </h2>
            <p className="text-sm sm:text-base text-accent-muted mb-3">
              Dropbox Music Player allows you to stream your music directly from your Dropbox account.
              All your music stays in your Dropbox - we don't store any of your files on our servers.
            </p>
            
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:text-primary-dark transition-colors text-sm sm:text-base"
              >
                <FiGithub className="mr-1 flex-shrink-0" /> Source Code
              </a>
              <a 
                href="https://buymeacoffee.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:text-primary-dark transition-colors text-sm sm:text-base"
              >
                <FiHeart className="mr-1 flex-shrink-0" /> Support
              </a>
            </div>
          </div>
          
          <div className="bg-secondary-light rounded-lg p-4 sm:p-6 shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-accent mb-2 sm:mb-4">App Version</h2>
            <p className="text-sm sm:text-base text-accent-muted">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <PlayerControls />
    </div>
  );
} 