// src/App.tsx
import React, { useState } from 'react';
import { Container, Heading, Text, Input, Button, Flex, Spacer, Box, Image } from '@chakra-ui/react';
import SongList, { Song } from './SongList'; // Import the SongList component
import theme from './theme';
import GenrePopup from './GenrePopup'; // Import the GenrePopup component

function App() {
  const [userInput, setUserInput] = useState<string>('');
  const [generatedPlaylist, setGeneratedPlaylist] = useState<Song[]>([]);
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState<boolean>(false); // State to control the popup

  const generatePlaylist = () => {
    setIsGenrePopupOpen(true); // Open the genre selection popup
  };

  const handleGenreSelect = (genre: string) => {
    setIsGenrePopupOpen(false); // Close the popup
    
    // Implement playlist generation logic based on the selected genre here...

    // For demonstration, the user input is being used
    const playlistItems = userInput.split(' ').filter(Boolean);
    const generatedSongs: Song[] = playlistItems.map((item, index) => ({
      title: `${item} (${genre})`, // Song title includes the genre
      artist: `Artist ${index + 1}`,
    }));
  
    setGeneratedPlaylist(generatedSongs);
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
        {/*<Button colorScheme="brand" variant="brand">
          Login
  </Button>*/}
      </Flex>

      {/* GenrePopup Modal */}
      <GenrePopup 
        isOpen={isGenrePopupOpen}
        onClose={() => setIsGenrePopupOpen(false)}
        onGenreSelect={handleGenreSelect}
      />


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

      {/* Generated Playlist Section */}
      {generatedPlaylist.length > 0 && (
        <Box>
          <Heading as="h2" size="xl" color="text.primary">
            Generated Playlist
          </Heading>
          <SongList songs={generatedPlaylist} />
          {/* <Flex mt={4} direction="column">
            {generatedPlaylist.map((item, index) => (
              <Text key={index}>{item}</Text>
            ))}
          </Flex> */}
        </Box>
      )}

      {/* Other elements and sections */}
      {/* Customize and add more elements based on your design */}
    </Container>
  );
}

export default App;

