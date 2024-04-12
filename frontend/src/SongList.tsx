import React from 'react';
import { Box, Text, VStack, HStack, Image } from '@chakra-ui/react';
import { Song } from './Song'

export interface SongListProps {
    songs: Song[];
    onSongClick: (songId: string) => void;
  }

const SongList: React.FC<SongListProps> = ({ songs, onSongClick }) => {

  return (
    <VStack spacing={4} align="stretch">
      {songs.map((song, index) => (
        <HStack
          key={index}
          p={4}
          bg="gray.700"
          borderRadius="md"
          spacing={4}
          onClick={() => onSongClick(song.trackId)}
          cursor="pointer"
          _hover={{ bg: 'gray.600' }}
        >
          <Image
            src={song.image}
            alt={`${song.title} Album Cover`}
            boxSize="60px"
            objectFit="cover"
            borderRadius="md"
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" color="gray.200">{song.title}</Text>
            <Text fontSize="sm" color="gray.400">
              {song.artist}
            </Text>
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
};

// export {Song, SongListProps};
export default SongList;
