import React, { useState, useEffect } from 'react';
import { Box, Image, Text, ButtonGroup, IconButton, useToast, Modal, ModalOverlay, ModalContent, Flex } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { Song } from './Song';

export interface SwipeableSongCardProps {
    song: Song;
    onSwipe?: (direction: 'left' | 'right') => void;
    topCard: boolean; //React.CSSProperties; // Add style as an optional property
  }

const SwipeableSongCard = ({ song, onSwipe, topCard }: SwipeableSongCardProps) => {
  const [exit, setExit] = useState('');
  const toast = useToast();

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!onSwipe)
        return;

    if (!topCard)
        return;

    setExit(direction);
    toast({
      title: direction === 'left' ? 'Disliked' : 'Liked',
      status: direction === 'left' ? 'error' : 'success',
      position: 'top',
      duration: 2000,
    });
    setTimeout(() => { onSwipe(direction); }, 400);
  };

  useEffect(() => {
    setExit('');
  }, [song]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Modal 
        isOpen={true} 
        onClose={() => {}} 
        isCentered 
        size="xl" 
        motionPreset="none"
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent
        mx="auto"
        my="auto"
        w="lg"
        h="lg"
        borderRadius="lg"
        boxShadow="xl"
        overflow="hidden"
        transform={exit ? `translateX(${exit === 'left' ? '-150%' : '150%'})` : topCard ? 'scale(1)' : 'scale(0.9)'} // Apply scale/exit transforms
        transition="transform 0.4s ease-out"
        position={'fixed'}
        zIndex={topCard ? 100: 1}
        >
        <Box position="relative" h="full">
          {/* Image */}
          <Image src={song.image} alt={song.title} w="full" h="90%" objectFit="cover" />
          
          {/* Bar with song title and artist */}
          <Flex
            position="absolute"
            bottom="0"
            w="full"
            p={4}
            bg="white"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Text fontSize="xl" fontWeight="bold">{song.title}</Text>
              <Text fontSize="md">{song.artist}</Text>
            </Box>

            {/* Buttons */}
            <ButtonGroup zIndex="docked">
              <IconButton
                icon={<ArrowBackIcon />}
                aria-label="Swipe left"
                onClick={() => handleSwipe('left')}
              />
              <IconButton
                icon={<ArrowForwardIcon />}
                aria-label="Swipe right"
                onClick={() => handleSwipe('right')}
              />
            </ButtonGroup>
          </Flex>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default SwipeableSongCard;