// src/App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Heading, Text, Input, Button, Flex, Spacer, Box, Image } from '@chakra-ui/react';
import SongList from './SongList'; // Import the SongList component
import theme from './theme';
import useSpotifyPlayer from './SpotifyPlayer'; // Import the useSpotifyPlayer hook
import GenrePopup from './GenrePopup'; // Import the GenrePopup component
import { Song } from './Song'
import SwipeableSongCard from './SwipeableSongCard';

const generateRandomSongs = (numSongs: number): Song[] => {
  const randomSongs: Song[] = [];
  
  for (let i = 0; i < numSongs; i++) {
    randomSongs.push(new Song());
  }

  return randomSongs;
};

function App() {
  const [userInput, setUserInput] = useState<string>('');
  const [generatedPlaylist, setGeneratedPlaylist] = useState<Song[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [dislikedTrackIds, setDislikedTrackIds] = useState<string[]>([]);
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState<boolean>(false); // State to control the popup
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlaylistLoaded, setIsPlaylistLoaded] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string>(''); // This will hold our access token
  const isAuthenticated = !!token;

  //const [startPlayback, setStartPlayback] = useState<any>(null);

  // Assuming you have some way to get the access token from the code
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    if (accessToken) {
      setToken(accessToken);
      // Optionally, clear the URL parameters to clean up the URL
      window.history.pushState({}, document.title, window.location.pathname);
    }
  }, []);


  useEffect(() => {
    const getUserData = async () => {
      const fetchedUserId = await fetchSpotifyUserId(token);
      setUserId(fetchedUserId);
    };

    if (token) { // Make sure the token exists and is valid
      getUserData();
    }
  }, [token]); // Run this effect when the token changes

  const fetchSpotifyUserId = async (token: string) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data) {
        console.log("Fetched user ID:", response.data.id);
        return response.data.id; // This is the Spotify user ID
      }
    } catch (error) {
      console.error("Failed to fetch user data from Spotify:", error);
    }
  }

  const login = () => {
    window.location.href = 'http://localhost:8000/login';
  };

  const logout = () => {
    // Clear the token from state or wherever it's stored
    setToken('');
  };

  const { startPlayback, stopPlayback } = useSpotifyPlayer(token);

  const handleSongClick = (spotifyId: string) => {
    if (spotifyId === currentPlayingId && isPlaying) {
      stopPlayback(); // Assuming you have a stopPlayback function similar to startPlayback
      setIsPlaying(false);
      console.log("Playback paused");
    } else {
      startPlayback(`spotify:track:${spotifyId}`);
      setCurrentPlayingId(spotifyId);
      setIsPlaying(true);
      console.log("Playback started for:", spotifyId);
    }
  };

  const createPlaylist = async (songs: Song[]) => {
    setIsLoading(true); // Indicate loading
  
    try {
      // Step 1: Create a new playlist
      const playlistResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, JSON.stringify({
        name: "Generated Playlist", // Name of the new playlist
        description: "New playlist created by Feelify", // Optional description
        public: false // Set to true if you want the playlist public
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      const playlist = playlistResponse.data;
  
      // Step 2: Add tracks to the new playlist
      const trackUris = songs.map(song => `spotify:track:${song.trackId}`);
      await axios.post(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, JSON.stringify({
        uris: trackUris
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log("Playlist created and tracks added!");
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const generatePlaylist = async () => {
    setCurrentIndex(0);
    setGeneratedPlaylist([]);
    setSelectedTrackIds([]);
    setDislikedTrackIds([]);
    setIsPlaylistLoaded(false);
    setIsLoading(true);
    stopPlayback();
    // setIsGenrePopupOpen(true); // Open the genre selection popup
    // Implement playlist generation logic based on the selected genre here...

    // For demonstration, the user input is being used
    // const playlistItems = userInput.split(' ').filter(Boolean);
    try {
      const response = await axios.get('http://localhost:8080/get-seeds', {
        params: { input: userInput }
      });
      if (response.data) {
        const playlist = response.data.map((song: any) => new Song(song.track, song.artist, song.image_url, song.spotify_id));
        setGeneratedPlaylist(playlist);
        console.log("BAAAANG")
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      // Handle errors here, e.g., show a message to the user
    } finally {
      setIsLoading(false);  // End loading regardless of success or failure
    }
  
  };

  const handleGenreSelect = async (genre: string) => {
    setIsGenrePopupOpen(false); // Close the popup
    
    // Implement playlist generation logic based on the selected genre here...

    // For demonstration, the user input is being used
    try {
      const response = await axios.get('http://localhost:8080/get-seeds', {
        params: { input: userInput }
      });
      if (response.data) {
        const playlist = response.data.map((song: any) => new Song(song.track, song.artist, song.image_url, song.spotify_id));
        setGeneratedPlaylist(playlist);
        console.log("BAAAANG")
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    }

  };

  const handleSwipe = (direction: 'left' | 'right', songId: string) => {
    // Remove the current card and set the next one
    if (direction === "right") {
      setSelectedTrackIds(prevIds => [...prevIds, songId]);
    } else {
      setDislikedTrackIds(prevIds => [...prevIds, songId]);
    }
    // Logic to go to the next card
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    console.log("CURRENT: " + newIndex + " GEN LEN: " + generatedPlaylist.length);
      // Check if the new current index equals the length of the playlist
    if (newIndex === generatedPlaylist.length) {
      console.log("Last song swiped. Fetching new recommendations...");
      fetchRecommendations();
      stopPlayback();
    }
  };

  let cardComponents = [];


  let numRender = 1;
   // Add a key to each song card that's unique to reorder the component on swipes.
   //for (let i = currentIndex; i < generatedPlaylist.length && i<= currentIndex + 1; i++) {
  if (generatedPlaylist.length > 0 && currentIndex < generatedPlaylist.length){
    for (let i = currentIndex + numRender - 1; i >= 0 && i >= currentIndex; i--) {
  
      const isTopCard = (i === currentIndex);

      if (isTopCard) {
        startPlayback(`spotify:track:` + generatedPlaylist[i].trackId); // 42VsgItocQwOQC3XWZ8JNA
      }
  
      console.log(currentIndex, i, numRender - 1- i + currentIndex, isTopCard, generatedPlaylist[i].title, generatedPlaylist[i].artist)
      // Construct the card component.
      cardComponents[numRender - 1- i + currentIndex] =
          <SwipeableSongCard
              key={generatedPlaylist[i].title + generatedPlaylist[i].artist + i}
              song={generatedPlaylist[i]}
              onSwipe={isTopCard ? (direction) => handleSwipe(direction, generatedPlaylist[i].trackId) : undefined}
              topCard={isTopCard}
          />
      ;
    }
  }

// Add this function inside your component
const fetchRecommendations = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get('http://localhost:8080/seed-songs', {
      params: {
        seed_ids: selectedTrackIds.join(','), // Assuming selectedTrackIds is an array of Spotify IDs
        disliked_ids: dislikedTrackIds.join(','),
        input: userInput // Assuming there is some user input you want to use for recommendation
      }
    });
    if (response.data) {
      const playlist = response.data.map((song: any) => new Song(song.track, song.artist, song.image_url, song.spotify_id));
      setGeneratedPlaylist(playlist);
      setCurrentIndex(playlist.length); // Reset the index for the new playlist
      setIsPlaylistLoaded(true);
      console.log("New playlist loaded successfully.");
    }
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    // Handle error here, e.g., showing an error message to the user
  } finally {
    setIsLoading(false);  // End loading regardless of success or failure
  }
};
  

  return (

    <Container>
      {/* Header */}
      <Flex align="center" mt={4} mb={8}>
        <Image src="/spotify-logo.png" alt="Spotify Logo" boxSize="50px" mr={4} />
        <Heading as="h1" size="lg" color="brand.50">
          Feelify
        </Heading>
        <Spacer />
      </Flex>

      {!isAuthenticated ? (
        <Button onClick={login}>Login with Spotify</Button>
      ) : (
        <div>

      {/* GenrePopup Modal */}
      <GenrePopup 
        isOpen={isGenrePopupOpen}
        onClose={() => setIsGenrePopupOpen(false)}
        onGenreSelect={handleGenreSelect}
      />

    {generatedPlaylist.length > 0 && currentIndex < generatedPlaylist.length && (
      <Box position="relative" width="100%" height="100%">
        {cardComponents}
      </Box>
      )}

      {/* User Input Section */}
      <Box mb={8}>
        <Heading as="h2" size="xl" color="text.primary">
          How are you feeling? Enter a sentence!
        </Heading>
        <Flex mt={4}>
          <Input
            placeholder="Enter your sentence"
            value={userInput}
            color="text.primary"
            onChange={(e) => setUserInput(e.target.value)}
          />
          <Button 
            colorScheme="brand" 
            variant="brand" 
            ml={2} 
            onClick={generatePlaylist}
            width={190}
          >
            Generate Playlist
          </Button>
        </Flex>
      </Box>

      {/* Logout Button */}
      <Box my={4}>
        <Button colorScheme="red" onClick={logout}>Logout</Button>
      </Box>

      {isLoading ? (
      <Text fontSize="xl" color="gray.500">Loading...</Text>
    ) : (
      isPlaylistLoaded && generatedPlaylist.length > 0 && (
        <Box>
          <Button colorScheme="blue" onClick={() => createPlaylist(generatedPlaylist)}>Save Playlist to Spotify</Button>
          <Heading as="h2" size="xl" color="text.primary">Generated Playlist</Heading>
          <SongList songs={generatedPlaylist} onSongClick={handleSongClick} />
        </Box>
      )
    )}

      {/* Generated Playlist Section
      {isPlaylistLoaded && generatedPlaylist.length > 0 && (
        <Box>
          <Heading as="h2" size="xl" color="text.primary">
            Generated Playlist
          </Heading>

          <SongList songs={generatedPlaylist} onSongClick={handleSongClick} />
        </Box>
      )} */}

                {/* Your existing UI components go here, e.g., GenrePopup, SongList, etc. */}
                </div>
      )}
    </Container>
  );
}

export default App;

