from dotenv import load_dotenv
import os
import base64
from requests import post, get
import json
from spotipy.oauth2 import SpotifyClientCredentials
import spotipy
import time

# ---- Initializations... ---------------------------------------
load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

# -----------------------------------------------------------------

# ----- Helper Functions -------------------------------------------
def get_token():
    auth_string = client_id + ":" + client_secret
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"

    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded",
    }

    data = {"grant_type": "client_credentials"}
    result = post(url, headers=headers, data=data)
    json_result = json.loads(result.content)
    token = json_result["access_token"]
    expires_in = json_result["expires_in"]

    return token, expires_in


def get_auth_header(token):
    return {"Authorization": "Bearer " + token}


def get_spotify_id(track_name, artist_name):
    sp = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))

    # Search for the track using the Spotify API
    results = sp.search(q=f"track:{track_name} artist:{artist_name}", type="track", limit=1)

    # Check if there are any results
    if results['tracks']['items']:
        # Get the Spotify ID of the first result
        spotify_id = results['tracks']['items'][0]['id']
        return spotify_id
    else:
        print(f"No results found for {track_name} by {artist_name}")
        return None


# This is for getting audio features from multiple tracks, not just one
def get_audio_features(token, spotify_ids):
    string_ids = ",".join(spotify_ids)
    api_endpoint = f'https://api.spotify.com/v1/audio-features'

    headers = {
        'Authorization': f'Bearer {token}'
    }

    params = {
        'ids': string_ids
    }

    response = get(api_endpoint, headers=headers, params=params)

    if response.status_code == 200:
        audio_features = response.json()['audio_features']
        return audio_features
    elif response.status_code == 429:
        print("DEBUG: Rate limit reached, reattemping in 1 seconds...")
        time.sleep(1)
        return get_audio_features(token, spotify_ids)
    else:
        print("DEBUG: ", response.status_code)
        return [None for _ in range(len(spotify_ids))]
    

# Get the popularity of a track
def get_popularities(token, spotify_ids):
    string_ids = ",".join(spotify_ids)
    api_endpoint = f'https://api.spotify.com/v1/tracks'

    headers = {
        'Authorization': f'Bearer {token}'
    }

    params = {
        'ids': string_ids
    }

    response = get(api_endpoint, headers=headers, params=params)

    if response.status_code == 200:
        tracks_info = response.json()['tracks']

        popularities = [track['popularity'] for track in tracks_info]

        return popularities
    elif response.status_code == 429:
        print("DEBUG: Rate limit reached, reattemping in 1 seconds...")
        time.sleep(1)
        return get_popularities(token, spotify_ids)
    else:
        print("DEBUG: ",response.status_code)
        return [None for _ in range(len(spotify_ids))]
    

# ------------------------------------------------------------------------
