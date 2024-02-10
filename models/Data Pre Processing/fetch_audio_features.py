import pandas as pd
from utils import *

# -----------------------------------------------------------------

# ----- Retrieve audio features ---------------------------------------------------

token, expires_in = get_token()

# print(expires_in)

# This path is on my local machine
fp = 'data/muse_v3_lyrics_90000.csv'
df = pd.read_csv(fp)

df_out_list = []

batch_size = 100

for i in range(0, len(df), batch_size):
    try:
        if i % 1000 == 0:
            print(f"DEBUG: Epoch {i / 1000} / {len(df) / 1000}")

        batch = df.iloc[i:i+batch_size]

        spotify_ids = []

        for _, row in batch.iterrows():
            spotify_id = row['spotify_id']

            if spotify_id and type(spotify_id) == str:
                spotify_ids.append(spotify_id)
        
        batch_features = get_audio_features(token, spotify_ids)

        m = len(spotify_ids)
        batch_pop1 = get_popularities(token, spotify_ids[:(m//2)])
        batch_pop2 = get_popularities(token, spotify_ids[(m//2):])
        batch_pop = batch_pop1 + batch_pop2

        for j in range(len(spotify_ids)):
            features = batch_features[j]
            popularity = batch_pop[j]

            if features:
                new_row = {
                    'spotify_id': spotify_ids[j], 
                    'popularity': popularity,
                    'danceability': features.get('danceability'),
                    'energy': features.get('energy'),
                    'loudness': features.get('loudness'),
                    'valence': features.get('valence'),
                    'tempo': features.get('tempo'),
                }

                df_out_list.append(new_row)
            else:
                empty_row = {
                    'spotify_id': spotify_ids[j], 
                    'danceability': None,
                    'energy': None,
                    'loudness': None,
                    'valence': None,
                    'tempo': None,
                }
                df_out_list.append(empty_row)
                print(f"Features are None for Spotify ID: {spotify_ids[j]}")
    except:
        print("DEBUG: Batch failed")

df_out = pd.DataFrame(df_out_list)

new_path = 'data/audio_features.csv'

df_out.to_csv(new_path, index=False)

