// src/models/Song.ts
export class Song {
    title: string;
    artist: string;
    image: string;
  
    constructor(title?: string, artist?: string, image?: string) {
        console.log("Song created")
      this.title = title || this.getRandomTitle();
      this.artist = artist || this.getRandomArtist();
      this.image = image || this.getRandomImage();
    }
  
    private getRandomTitle(): string {
      const titles = ["Song Title 1", "Song Title 2", "Song Title 3", "Song Title 4", "Song Title 5"];
      return titles[Math.floor(Math.random() * titles.length)];
    }
  
    private getRandomArtist(): string {
      const artists = ["Artist 1", "Artist 2", "Artist 3", "Artist 4", "Artist 5"];
      return artists[Math.floor(Math.random() * artists.length)];
    }
  
    private getRandomImage(): string {
      const imageId = Math.floor(Math.random() * 1000) + 1;
      return `https://picsum.photos/seed/${imageId}/400/400`;
    }
  }