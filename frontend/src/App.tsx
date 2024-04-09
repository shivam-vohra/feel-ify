// src/App.tsx
import React, { useEffect, useState } from 'react';
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
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState<boolean>(false); // State to control the popup
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const login = () => {
    window.location.href = 'http://localhost:8000/login';
  };

  const logout = () => {
    // Clear the token from state or wherever it's stored
    setToken('');
  };

  const { startPlayback } = useSpotifyPlayer(token);

  const generatePlaylist = () => {
    setIsGenrePopupOpen(true); // Open the genre selection popup
  };

  const handleGenreSelect = (genre: string) => {
    setIsGenrePopupOpen(false); // Close the popup
    
    // Implement playlist generation logic based on the selected genre here...

    // For demonstration, the user input is being used
    const playlistItems = userInput.split(' ').filter(Boolean);
  
    setGeneratedPlaylist(generateRandomSongs(10));
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // Remove the current card and set the next one
    if (direction === "right") {
      // Logic to add the song to the user's selection
    }
    // Logic to go to the next card
    setCurrentIndex(currentIndex + 1);
  };

  let cardComponents = [];


  let numRender = 1;
   // Add a key to each song card that's unique to reorder the component on swipes.
   //for (let i = currentIndex; i < generatedPlaylist.length && i<= currentIndex + 1; i++) {
  if (generatedPlaylist.length > 0 && currentIndex < generatedPlaylist.length){
    for (let i = currentIndex + numRender - 1; i >= 0 && i >= currentIndex; i--) {
  
      const isTopCard = (i === currentIndex);

      if (isTopCard) {
        startPlayback(`spotify:track:42VsgItocQwOQC3XWZ8JNA`);
      }
  
      console.log(currentIndex, i, numRender - 1- i + currentIndex, isTopCard, generatedPlaylist[i].title, generatedPlaylist[i].artist)
      // Construct the card component.
      cardComponents[numRender - 1- i + currentIndex] =
          <SwipeableSongCard
              key={generatedPlaylist[i].title + generatedPlaylist[i].artist + i}
              song={generatedPlaylist[i]}
              onSwipe={isTopCard ? (direction) => handleSwipe(direction) : undefined}
              topCard={isTopCard}
          />
      ;
    }
  }
  

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

      {/* Generated Playlist Section */}
      {generatedPlaylist.length > 0 && (
        <Box>
          <Heading as="h2" size="xl" color="text.primary">
            Generated Playlist
          </Heading>

          <SongList songs={generatedPlaylist} />
        </Box>
      )}

                {/* Your existing UI components go here, e.g., GenrePopup, SongList, etc. */}
                </div>
      )}
    </Container>
  );
}

export default App;

