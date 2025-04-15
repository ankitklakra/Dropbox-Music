'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUrl, completeAuth, isAuthenticated, validateToken, refreshToken } from '@/lib/services/dropboxService';
import { FiMusic, FiDroplet } from 'react-icons/fi';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Login page mounted');
    console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'window not available');
    
    const checkAuth = async () => {
      // Check if the user is already authenticated
      const authenticated = isAuthenticated();
      console.log('Is authenticated (from localStorage):', authenticated);
      
      if (authenticated) {
        console.log('Token found in localStorage, validating...');
        const isValid = await validateToken();
        
        if (!isValid) {
          console.log('Token is invalid, attempting to refresh...');
          const refreshed = await refreshToken();
          if (refreshed) {
            console.log('Token refreshed successfully');
            router.push('/');
            return;
          }
          console.log('Token refresh failed, staying on login page');
        } else {
          console.log('User is authenticated with valid token, redirecting to home');
          router.push('/');
          return;
        }
      }
      
      // Check if there's an auth code in the URL (after redirect from Dropbox)
      if (typeof window !== 'undefined') {
        // Check for code in both searchParams and hash
        const url = new URL(window.location.href);
        let code = url.searchParams.get('code');
        
        // If code isn't in searchParams, try to extract from hash
        if (!code && url.hash) {
          const hashParams = new URLSearchParams(url.hash.substring(1));
          code = hashParams.get('code');
        }
        
        console.log('Auth code in URL:', code ? `present (${code.substring(0, 5)}...)` : 'not found');
  
        if (code) {
          console.log('Processing auth code');
          handleAuthCode(code);
        }
      }
    };
    
    checkAuth();
  }, [router]);

  const handleAuthCode = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting authentication with code:', code.substring(0, 5) + '...');
      const success = await completeAuth(code);
      console.log('Auth result:', success);
      
      if (success) {
        console.log('Authentication successful, navigating to home');
        // Clear the URL parameters
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        router.push('/');
      } else {
        setError('Failed to authenticate with Dropbox. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting Dropbox authentication...');
      // Get the auth URL and redirect the user to Dropbox
      const authUrl = await getAuthUrl();
      console.log('Received auth URL:', authUrl);
      
      if (typeof authUrl === 'string') {
        console.log('Redirecting to Dropbox...');
        window.location.href = authUrl;
      } else {
        throw new Error('Invalid authentication URL received');
      }
    } catch (err) {
      console.error('Auth init error:', err);
      setError(`Failed to initialize Dropbox authentication: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
      <div className="bg-secondary-light rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <FiMusic className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-accent mb-2">
            <span className="text-primary">Dropbox</span> Music Player
          </h1>
          <p className="text-accent-muted">
            Connect your Dropbox account to access your music collection.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></span>
          ) : (
            <FiDroplet className="w-5 h-5" />
          )}
          {isLoading ? 'Connecting...' : 'Connect with Dropbox'}
        </button>

        <p className="text-xs text-accent-muted mt-6 text-center">
          By connecting, you allow this application to access your Dropbox files.
          We only access the audio files you select.
        </p>
      </div>
    </div>
  );
} 