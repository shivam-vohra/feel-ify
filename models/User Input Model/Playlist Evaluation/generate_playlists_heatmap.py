# This code is used to generate playlist heatmaps for comparing different methods of encoding songs in an embedded space
# To reproduce, the only real changes to make are modifying the "playlists" dataframe and "best" dataframe to be your dataframe
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import normalize

# Load dataframes
playlists = pd.read_csv("drive/MyDrive/CS 3892/Data/mood_playlists_with_list.csv")
best = pd.read_csv('drive/My Drive/CS 3892/Data/lyrics_with_audio_49k.csv')

# Get the average distance between all songs of two playlists
def avg_distance(playlist1, playlist2):
  running_sum = 0.00
  count = 0
  for _, song1 in playlist1.iterrows():
    for _, song2 in playlist2.iterrows():
      count += 1
      running_sum += np.linalg.norm(song1.to_numpy() - song2.to_numpy())
  return running_sum / count

# Get the average distance between all songs of two playlists with the L2 norm
def avg_distance_norm(playlist1, playlist2):
  running_sum = 0.00
  count = 0
  for song1 in playlist1:
    for song2 in playlist2:
      count += 1
      running_sum += np.linalg.norm(song1 - song2)
  return running_sum / count

# Pull song data for a playlist
def get_data(title):
  beats = playlists[playlists['playlist_name'] == title]
  beats_tracks = list(beats['tracks_list'])
  beats_tracks[0]
  beats_data = best[best['spotify_id'].isin(list(beats_tracks[0]))]
  beats_data = beats_data[care_about]
  if beats_data is None:
    print("BADDDD")
  return beats_data

# Pull song data for a playlist and normalize it
def get_data_norm(title):
    beats = playlists[playlists['playlist_name'] == title]
    beats_tracks = list(beats['tracks_list'])[0]  # Assuming the first item is what we want
    beats_data = best[best['spotify_id'].isin(beats_tracks)]

    # Assuming each row in 'embeddings' is an array-like structure; if not, you'll need to adjust
    embeddings_list = beats_data['embeddings'].to_numpy()
    filtered_embeddings = []
    for emb in embeddings_list:
        if isinstance(emb, np.ndarray):  # Check if the item is an ndarray
            # if not np.isnan(emb).any():  # Check if the ndarray contains any nan values
            filtered_embeddings.append(emb)

    # print(filtered_embeddings)
    # Stack the filtered embeddings into a 2D NumPy array
    try:
      embeddings_array = np.stack(filtered_embeddings)
    except:
      print(title)
      print(embeddings_list)

    # Normalize the embeddings
    normalized_embeddings = normalize(embeddings_array, norm='l2')
    return normalized_embeddings

# For each playlist we have, pull their songs
to_compare = ["Good Vibes", "Happy Beats", "sad hour", "Sad Beats", "Love Letter", "Make Out Jams", "Get Turnt", "Beast Mode", "Heartache"]
compare_data = [get_data_norm(title) for title in to_compare]

# Calculate pairwise distances for each playlist
distances = []
for i in range(len(compare_data)):
  new_row = []
  for j in range(len(compare_data)):
    new_row.append(avg_distance_norm(compare_data[i], compare_data[j]))
  distances.append(new_row)
distances = np.array(distances)

# Plotting
sns.heatmap(distances, annot=True, cmap='RdYlGn_r', fmt=".2f",
            xticklabels=to_compare, yticklabels=to_compare)
plt.title('Average Distance between Playlist Doc2Vec Features')

# Move the x-axis labels to the top
plt.tick_params(top=True, bottom=False, labeltop=True, labelbottom=False)

# Rotate labels on the top
plt.xticks(rotation=45)
plt.yticks(rotation=0)
plt.tight_layout()
plt.show()