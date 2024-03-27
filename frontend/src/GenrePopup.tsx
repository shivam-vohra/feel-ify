// src/GenrePopup.tsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  SimpleGrid,
  Button
} from '@chakra-ui/react';

interface GenrePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGenreSelect: (genre: string) => void;
}

const genreColors: Record<string, string> = {
  Rock: 'green.400',
  Rap: 'red.400',
  Classical: 'yellow.400',
  Electronic: 'purple.400',
  Pop: 'pink.400',
  Jazz: 'orange.400',
  Reggae: 'teal.400',
  Metal: 'gray.500',
  // Add more genres and colors as needed
};

const getRandomGenres = (numGenres: number = 4) => {
  const shuffled = Object.keys(genreColors).sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numGenres);
};

const GenrePopup: React.FC<GenrePopupProps> = ({ isOpen, onClose, onGenreSelect }) => {
  const randomGenres = getRandomGenres();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent borderRadius="xl" bg="gray.800" color="white">
        <ModalHeader borderTopRadius="xl">Select a Genre</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <SimpleGrid columns={2} spacing={4}>
            {randomGenres.map((genre) => (
              <Button
                key={genre}
                bg={genreColors[genre]}
                _hover={{
                  bg: `${genreColors[genre].split('.')[0]}.300`
                }}
                onClick={() => onGenreSelect(genre)}
                size="lg"
              >
                {genre}
              </Button>
            ))}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GenrePopup;