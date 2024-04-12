import pandas as pd

def get_song_data():
    data_path = './data/lyrics_images_104k.csv'
    df = pd.read_csv(data_path)
    df = df[['spotify_id', 'image_url', 'track', 'artist', 'danceability', 'energy', 'loudness', 'valence', 'tempo', 'popularity']]
    df = df.dropna()
    df.drop_duplicates(subset=['spotify_id'])
    df.drop_duplicates(subset=['track', 'artist'])
    df['popularity'] = df['popularity'].apply(lambda x: x * 100 if x < 1.0 else x)
    df = df[df['popularity'] > 10]
    print(df.info())
    return df