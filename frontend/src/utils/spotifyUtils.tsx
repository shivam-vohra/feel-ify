export const getSpotifyToken = async () => {
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
    const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET
    const URL = "https://accounts.spotify.com/api/token"
    try{
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
      })

      if (!response.ok){
        throw new Error("Could not get token");
      }
      const data = await response.json();
      return data.access_token
    }catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
}
