// src/hooks/useSpotifyPlayer.ts
import { useEffect } from 'react';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
    device: string;
  }
}

interface ReadyEvent {
    device_id: string
}

interface MessageEvent {
    message: string
}

const useSpotifyPlayer = (token: string) => {
  useEffect(() => {
    if (!token) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
        console.log(token)
      const player = new window.Spotify.Player({
        name: 'React Spotify Web Playback',
        getOAuthToken: (cb: (token: string) => any) => { cb(token); }, // this is bad practice but i dont care
        volume: 0.5
      });

      // Ready
      player.addListener('ready', ({ device_id }: ReadyEvent) => {
        console.log('Ready with Device ID', device_id);
        window.device = device_id;
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }: ReadyEvent) => {
        console.error('Device ID has gone offline', device_id);
      });

      // Initialization error
      player.addListener('initialization_error', ({ message }: MessageEvent) => {
        console.error('Initialization error', message);
      });

      // Authentication error
      player.addListener('authentication_error', ({ message }: MessageEvent) => {
        console.error('Authentication error', message);
      });

      // Account error
      player.addListener('account_error', ({ message }: MessageEvent) => {
        console.error('Account error', message);
      });

      player.connect();
    };

    // Load the Spotify Playback SDK
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
    document.head.appendChild(scriptTag);

    return () => {
      // Cleanup function to disconnect the player when the component unmounts
      //player?.disconnect();
    };
  }, [token]);

  // Function to start playback
  const startPlayback = (spotify_uri: string) => {
    console.log("plz start")
    if (!window.device) {
      console.error('No device ID available for playback');
      return;
    }

    window.Spotify.Player.prototype.getOAuthToken = (cb: (token: string) => void) => {
      cb(token);
    };

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${window.device}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [spotify_uri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    }).then(response => {
      if (response.ok) {
        console.log("Playback started");
      } else {
        console.error("Failed to start playback", response);
      }
    }).catch(err => console.error("Error starting playback", err));
  };

  return { startPlayback };
};

export default useSpotifyPlayer;