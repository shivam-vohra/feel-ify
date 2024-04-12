// src/models/Song.ts
export class Song {
    title: string;
    artist: string;
    image: string;
    trackId: string;
    constructor(track?: string, artist?: string, image_url?: string, spotify_id?: string) {
        console.log("Song created")
      this.title = track || this.getRandomTitle();
      this.artist = artist || this.getRandomArtist();
      this.image = image_url || this.getRandomImage();
      this.trackId = spotify_id || '42VsgItocQwOQC3XWZ8JNA';
    }
  
    private getRandomTitle(): string {
      const titles = ["FE!N (feat. Playboi Carti)"];
      return titles[Math.floor(Math.random() * titles.length)];
    }
  
    private getRandomArtist(): string {
      const artists = ["Travis Scott"];
      return artists[Math.floor(Math.random() * artists.length)];
    }
  
    private getRandomImage(): string {
      const imageId = Math.floor(Math.random() * 1000) + 1;
      return 'https://d3rjjq7fi1tbk0.cloudfront.net/product/196588460326/196588460326.jpg'; ///`https://picsum.photos/seed/${imageId}/400/400`;
    }
  }