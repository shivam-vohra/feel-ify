const express = require('express');
const axios = require('axios');
const app = express();

const client_id = '4684b510b3ab4faaa121c2ac74b209fe';//'3ebaced21096427090115826ab5a94e5'; // Insert your client ID here
const client_secret = '9b132b735e264aa08a78d2f2049f48eb';//'38e9784f35984a359ae2b901543d92b4'; // Insert your client secret here
const redirect_uri = 'http://localhost:8000/callback'; // Your redirect URI
const scopes = 'streaming user-read-email user-read-private user-modify-playback-state'; // Include necessary scopes

app.get('/login', (req, res) => {
  const auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scopes,
    redirect_uri: redirect_uri
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
  // Automatically opens the browser and navigates to the /login route
});
