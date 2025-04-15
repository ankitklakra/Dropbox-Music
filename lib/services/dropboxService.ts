'use client';

import { Dropbox } from 'dropbox';
import { Track } from '../types';

// Get the Dropbox app key from environment variables
const CLIENT_ID = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;

if (!CLIENT_ID) {
  throw new Error('Dropbox app key is not configured. Please set NEXT_PUBLIC_DROPBOX_APP_KEY in your .env.local file.');
}

let dbx: Dropbox | null = null;

// Initialize Dropbox client
export const initDropbox = () => {
  if (!dbx) {
    console.log('Initializing Dropbox client with clientId:', CLIENT_ID);
    // Create a bound version of fetch
    const boundFetch = fetch.bind(window);
    dbx = new Dropbox({
      clientId: CLIENT_ID,
      fetch: boundFetch,
    });
  }
  return dbx;
};

// Generate a random string for PKCE that meets Dropbox's requirements
const generateRandomString = (length: number) => {
  // Use only allowed characters: 0-9, a-z, A-Z, -, ., _, ~
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const charsLength = allowedChars.length;
  
  // Ensure length is between 43 and 128 characters
  const actualLength = Math.max(43, Math.min(length, 128));
  
  for (let i = 0; i < actualLength; i++) {
    result += allowedChars.charAt(Math.floor(Math.random() * charsLength));
  }
  
  return result;
};

// Create a code verifier for PKCE
const generateCodeVerifier = () => {
  // Generate a verifier of length 43 (minimum required by Dropbox)
  return generateRandomString(43);
};

// Create a code challenge from the code verifier
const generateCodeChallenge = async (codeVerifier: string) => {
  // Use a simpler approach for browser compatibility
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash buffer to base64url encoding
  const hashArray = new Uint8Array(hashBuffer);
  let base64 = '';
  for (let i = 0; i < hashArray.length; i++) {
    base64 += String.fromCharCode(hashArray[i]);
  }
  
  // Encode as base64 and convert to base64url
  const base64url = window.btoa(base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  return base64url;
};

// Get authentication URL with PKCE support
export const getAuthUrl = async () => {
  try {
    console.log('Building OAuth URL with PKCE...');
    // Use the current path for redirect URI
    const redirectUri = window.location.origin + '/login';
    console.log('Using redirect URI:', redirectUri);
    
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store the code verifier in localStorage for later use
    if (typeof window !== 'undefined') {
      localStorage.setItem('dropboxCodeVerifier', codeVerifier);
      console.log('Stored code verifier in localStorage');
    }
    
    // Manually build the OAuth URL with PKCE parameters
    const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('token_access_type', 'offline'); // For refresh token
    
    console.log('Auth URL:', authUrl.toString());
    return authUrl.toString();
  } catch (error) {
    console.error('Error building auth URL:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
};

// Complete authentication with code from redirect - using fetch directly with PKCE
export const completeAuth = async (code: string) => {
  // Use the current path for redirect URI
  const redirectUri = window.location.origin + '/login';
  
  // Check if we already have a token
  if (typeof window !== 'undefined' && localStorage.getItem('dropboxToken')) {
    console.log('Already authenticated with a token');
    return true;
  }
  
  // Check if this code has been used before
  const lastUsedCode = localStorage.getItem('lastUsedAuthCode');
  if (lastUsedCode === code) {
    console.log('This authorization code has already been used');
    return isAuthenticated(); // Return current auth status instead of error
  }
  
  // Get the code verifier from localStorage
  const codeVerifier = localStorage.getItem('dropboxCodeVerifier');
  if (!codeVerifier) {
    console.error('Code verifier not found in localStorage');
    throw new Error('PKCE code verifier not found');
  }
  
  try {
    console.log('Exchanging authorization code for token with PKCE...');
    console.log('Code:', code.substring(0, 5) + '...');
    console.log('Redirect URI:', redirectUri);
    console.log('Code Verifier:', codeVerifier.substring(0, 5) + '...');
    
    // Store this code as used
    localStorage.setItem('lastUsedAuthCode', code);
    
    // Use fetch directly to exchange the code for a token
    console.log('Preparing token request with PKCE...');
    const tokenUrl = 'https://api.dropboxapi.com/oauth2/token';
    console.log('Token URL:', tokenUrl);
    
    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });
    console.log('Request params:', Object.fromEntries(params.entries()));
    
    const boundFetch = fetch.bind(window);
    const response = await boundFetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    console.log('Token response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed. Response:', errorText);
      
      // If the error is "code has already been used" and we have a token, don't throw an error
      if (errorText.includes('invalid_grant') && errorText.includes('already been used') && isAuthenticated()) {
        console.log('Code was already used, but we have a valid token');
        return true;
      }
      
      throw new Error('Failed to exchange authorization code for access token');
    }
    
    const tokenData = await response.json();
    console.log('Token exchange successful. Got token data:', Object.keys(tokenData));
    
    // Store token in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('dropboxToken', tokenData.access_token);
      console.log('Stored access token in localStorage');
      
      if (tokenData.refresh_token) {
        localStorage.setItem('dropboxRefreshToken', tokenData.refresh_token);
        console.log('Stored refresh token in localStorage');
      }
      
      // Clear the code verifier as it's no longer needed
      localStorage.removeItem('dropboxCodeVerifier');
    }
    
    // Reinitialize the Dropbox client with the new token
    dbx = new Dropbox({
      accessToken: tokenData.access_token,
      fetch: boundFetch,
    });
    console.log('Reinitialized Dropbox client with new token');
    
    return true;
  } catch (error) {
    console.error('Dropbox authentication error:', error);
    
    // If we already have a token, return true instead of propagating the error
    if (isAuthenticated()) {
      console.log('Error occurred but we already have a valid token');
      return true;
    }
    
    throw error;
  }
};

// Refresh the access token using the refresh token
export const refreshToken = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const refreshToken = localStorage.getItem('dropboxRefreshToken');
  if (!refreshToken) {
    console.log('No refresh token available');
    return false;
  }
  
  try {
    console.log('Refreshing access token...');
    const tokenUrl = 'https://api.dropboxapi.com/oauth2/token';
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    });
    
    const boundFetch = fetch.bind(window);
    const response = await boundFetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    if (!response.ok) {
      console.error('Token refresh failed');
      return false;
    }
    
    const tokenData = await response.json();
    console.log('Token refresh successful');
    
    localStorage.setItem('dropboxToken', tokenData.access_token);
    if (tokenData.refresh_token) {
      localStorage.setItem('dropboxRefreshToken', tokenData.refresh_token);
    }
    
    // Reinitialize the Dropbox client with the new token
    dbx = new Dropbox({
      accessToken: tokenData.access_token,
      fetch: boundFetch,
    });
    
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  // Try to get token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dropboxToken');
    if (token) {
      console.log('Found token in localStorage');
      // Create a bound version of fetch
      const boundFetch = fetch.bind(window);
      // Reinitialize the Dropbox client with the token
      dbx = new Dropbox({
        accessToken: token,
        fetch: boundFetch,
      });
      return true;
    }
  }
  
  return false;
};

// Validate token by making a simple API call
export const validateToken = async (): Promise<boolean> => {
  if (!dbx) {
    console.log('No Dropbox client initialized');
    return false;
  }
  
  try {
    console.log('Validating Dropbox token...');
    // Make a simple call to get current account info
    const response = await dbx.usersGetCurrentAccount();
    console.log('Token is valid. User:', response.result.name.display_name);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    // Clear invalid token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dropboxToken');
      localStorage.removeItem('dropboxRefreshToken');
    }
    return false;
  }
};

// Helper function to format Dropbox paths correctly
const formatPath = (path: string): string => {
  // Return empty string for root
  if (!path || path === '/') {
    return '';
  }
  
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Remove trailing slash if present
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  
  return path;
};

// List files from a specific folder (only audio files)
export const listAudioFiles = async (folder: string = '/music'): Promise<Track[]> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated with Dropbox');
  }
  
  const dropbox = initDropbox()!;
  console.log('Listing audio files from folder:', folder);
  
  try {
    // Ensure folder path is correctly formatted
    const path = formatPath(folder);
    console.log('Formatted path for API call:', path);
    
    console.log('Making Dropbox filesListFolder API call...');
    const response = await dropbox.filesListFolder({
      path: path,
      recursive: false,
      include_media_info: true,
    });
    
    console.log('Received response:', response);
    console.log('Total entries:', response.result.entries.length);
    
    const audioFiles = response.result.entries.filter(entry => {
      const name = entry.name.toLowerCase();
      return (
        entry['.tag'] === 'file' && 
        (name.endsWith('.mp3') || name.endsWith('.flac') || name.endsWith('.wav'))
      );
    });
    
    console.log('Filtered audio files:', audioFiles.length);
    
    // Transform to Track format
    const tracks: Track[] = audioFiles.map(file => {
      console.log('Processing file:', file.name, 'Path:', file.path_lower);
      // Extract artist and title from filename if possible (e.g., "Artist - Title.mp3")
      const nameMatch = file.name.match(/^(.+) - (.+)\.(mp3|flac|wav)$/i);
      let artist = '';
      let title = file.name;
      
      if (nameMatch) {
        artist = nameMatch[1].trim();
        title = nameMatch[2].trim();
      } else {
        // If not in "Artist - Title" format, remove extension
        title = file.name.replace(/\.(mp3|flac|wav)$/i, '');
      }
      
      return {
        id: file.path_lower || file.name,
        name: title,
        artist: artist || undefined,
        url: '', // We'll get the actual URL in getFileUrl
        thumbnail: undefined,
      };
    });
    
    // Get URLs for each track
    console.log('Getting temporary URLs for', tracks.length, 'tracks');
    for (const track of tracks) {
      try {
        console.log('Getting URL for track:', track.id);
        track.url = await getFileUrl(track.id);
        console.log('Got URL:', track.url.substring(0, 50) + '...');
      } catch (error) {
        console.error(`Failed to get URL for ${track.id}:`, error);
      }
    }
    
    console.log('Returning', tracks.length, 'audio tracks');
    return tracks;
  } catch (error) {
    console.error('Error listing Dropbox files:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
};

// Get temporary URL for a file
export const getFileUrl = async (path: string): Promise<string> => {
  if (!isAuthenticated()) {
    throw new Error('User not authenticated with Dropbox');
  }
  
  const dropbox = initDropbox()!;
  // Format the path properly
  const formattedPath = formatPath(path);
  console.log('Getting temporary link for:', formattedPath);
  
  try {
    const response = await dropbox.filesGetTemporaryLink({ path: formattedPath });
    console.log('Got temporary link successfully');
    return response.result.link;
  } catch (error) {
    console.error('Error getting file URL:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack, 
        name: error.name
      });
    }
    throw error;
  }
};

// Logout / Clear authentication
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dropboxToken');
    localStorage.removeItem('dropboxRefreshToken');
  }
  
  // Reinitialize with just the client ID
  dbx = new Dropbox({
    clientId: CLIENT_ID,
    fetch: fetch,
  });
}; 