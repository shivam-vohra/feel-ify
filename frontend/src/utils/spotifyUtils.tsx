export const getSpotifyToken = async () => {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
    const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET
    const URL = "https://accounts.spotify.com/api/token"
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        })

        if (!response.ok) {
            throw new Error("Could not get token");
        }
        const data = await response.json();
        return data.access_token
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

export const getAlbumCover = async (trackID: string, token: string) => {
    try {
        const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackID}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        if (!trackResponse.ok) {
            throw new Error(`Failed to fetch track data: ${trackResponse.statusText}`);
        }
        const trackData = await trackResponse.json();
        const albumID = trackData.album.id;

        const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumID}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        if (!albumResponse.ok) {
            throw new Error(`Failed to fetch album data: ${albumResponse.statusText}`);
        }
        const albumData = await albumResponse.json();

        if (!albumData.images || albumData.images.length === 0) {
            throw new Error("No album cover found");
        }
        return albumData.images[0].url;
        
    } catch (error) {
        console.error('Error fetching album cover:', error);
        return "";
    }
}