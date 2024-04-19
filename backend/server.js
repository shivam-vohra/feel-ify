const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const Jimp = require('jimp');

const client_id = '4684b510b3ab4faaa121c2ac74b209fe';//'3ebaced21096427090115826ab5a94e5';
const client_secret = '9b132b735e264aa08a78d2f2049f48eb';//'38e9784f35984a359ae2b901543d92b4';
const redirect_uri = 'http://localhost:8000/callback';
const scopes = 'streaming user-read-email user-read-private user-modify-playback-state playlist-modify-public playlist-modify-private ugc-image-upload'; // Include necessary scopes
app.use(cors());
app.use(bodyParser.json());
const openai_secret = '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';

app.post('/create-playlist-with-image', async (req, res) => {

  const { prompt, accessToken, playlistId } = req.body;

  // Generate image via OpenAI
  try {
      const imageResponse = await axios.post(
          'https://api.openai.com/v1/images/generations',
          {
              prompt: `Draw high quality, HD, studio level playlist cover art for a playlist that was generated with the following prompt: ${prompt}`,
              n: 1,
              size: "1024x1024",
              model: 'dall-e-3'
          },
          {
              headers: {
                  'Authorization': `Bearer ${openai_secret}`,
                  'Content-Type': 'application/json'
              }
          }
      );

      const imageUrl = imageResponse.data.data[0].url;
      console.log("Got image at: ", imageUrl);

      // Fetch and process image
      const image = await Jimp.read(imageUrl);
      const imageBuffer = await image.resize(128, 128).quality(100).getBufferAsync(Jimp.MIME_JPEG);
      const base64Image = imageBuffer.toString('base64');
    
      console.log("Base64 preview:", base64Image.substring(0, 30));

      const spotifyResponse = await axios.put(
        `https://api.spotify.com/v1/playlists/${playlistId}/images`,
        base64Image,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'image/jpeg',
            'Content-Length': base64Image.length
          }
        }
      );

      console.log("Spotify image upload response status:", spotifyResponse.status);
      res.status(200).send({ success: true, playlistId: playlistId });
  } catch (error) {
    console.error("Failed to create playlist and upload image:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    res.status(500).send({ success: false, message: 'Failed to create playlist and upload image.' });
  }
});

app.get('/login', (req, res) => {
  const auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scopes,
    redirect_uri: redirect_uri,
    show_dialog: true
  });

  res.redirect('https://accounts.spotify.com/authorize?' + auth_query_parameters.toString());
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  console.log("reee")
  console.log(code)
  if (code) {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        }
      });

      const access_token = response.data.access_token;
      console.log('Your Access Token: ' + access_token);
      // Do something with the access token, e.g., render the HTML page with the access token set in the script
      // For now, we just display the token in the console.
      res.redirect(`http://localhost:3000/?access_token=${access_token}`);
      
    } catch (error) {
      console.error('Error getting tokens', error.response.data);
      res.send('Error getting tokens, check server console log.');
    }
  } else {
    res.send('Authorization code not found');
  }
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
