from vad_utils import predict_VAD, predict_audio_features
from get_d2v import get_d2v_model
from sklearn.preprocessing import normalize
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

from nltk.tokenize import word_tokenize
from nltk.tokenize import word_tokenize
import nltk

nltk.download('punkt')

# This function gets the seed songs. The directory is the directory
# of the individual prediction models.
def get_seed_songs(input, num_songs, df_orig):
    d2v_model = get_d2v_model()

    valence_pred = predict_VAD('valence', input)
    arousal_pred = predict_VAD('arousal', input)
    dominance_pred = predict_VAD('dominance', input)

    scaled_valence = valence_pred * 2 - 1
    scaled_arousal = arousal_pred * 2 - 1
    scaled_dominance = dominance_pred * 2 - 1

    input_sentiment = pd.DataFrame({
        'valence_tags': [scaled_valence.detach().numpy()],
        'arousal_tags': [scaled_arousal.detach().numpy()],
        'dominance_tags': [scaled_dominance.detach().numpy()]
    })

    # alpha = 5000

    predicted_audio_features = predict_audio_features(input_sentiment)
    predicted_audio_features = normalize(predicted_audio_features, norm='l2')
    # predicted_audio_features = np.pad(predicted_audio_features, ((0,0),(0,1)), mode='constant', constant_values= 100/ alpha)

    # get input inference vector
    tokenized_input = word_tokenize(input.lower())
    inference = d2v_model.infer_vector(tokenized_input)

    # get all the doc2vec similarity scores
    inferences = d2v_model.dv.most_similar([inference], topn=d2v_model.corpus_count)
    ids_to_lyric_score = pd.DataFrame(inferences, columns=['spotify_id', 'lyric_sim_score'])

    df_lyric_score = pd.merge(df_orig, ids_to_lyric_score, on='spotify_id', how='inner')

    songs = normalize(df_lyric_score[['danceability', 'energy', 'loudness', 'valence', 'tempo']], norm='l2')
    # songs = df_orig[['danceability', 'energy', 'loudness', 'valence', 'tempo']]
    # songs = np.column_stack((songs, df_lyric_score['popularity'] / alpha))

    similarities = cosine_similarity(predicted_audio_features, songs)
    similarities = similarities[0]

    df_lyric_score['audio_score'] = similarities

    df_lyric_score['weighted_score'] = df_lyric_score['audio_score'] * 2 + df_lyric_score['lyric_sim_score'] * 1 + 0.005 * df_lyric_score['popularity']
    df_lyric_score = df_lyric_score.sort_values('weighted_score', ascending=False)
    df_lyric_score = df_lyric_score.drop_duplicates(subset='spotify_id').drop_duplicates(subset=['track', 'artist'])
    potential_seed_songs = df_lyric_score.head(num_songs)

    return potential_seed_songs

# This function takes in main_songs which is the songs
# selected from the seeds. df_orig must be loaded in.
def get_songs_from_seed(main_songs, bad_ids, input, n, df_orig):
    d2v_model = get_d2v_model()
    all_scores = pd.DataFrame()

    for index, main_song in main_songs.iterrows():
        predicted_audio_features = main_song[['danceability', 'energy', 'loudness', 'valence', 'tempo']].to_numpy().reshape(1, -1)
        predicted_audio_features = normalize(predicted_audio_features, norm='l2')

        # get input inference vector
        tokenized_input = word_tokenize(input.lower())
        inference = d2v_model.infer_vector(tokenized_input)

        # get all the doc2vec similarity scores
        inferences = d2v_model.dv.most_similar([inference], topn=d2v_model.corpus_count)
        ids_to_lyric_score = pd.DataFrame(inferences, columns=['spotify_id', 'lyric_sim_score'])

        song_embedding = d2v_model.dv[main_song['spotify_id']]
        song_inferences = d2v_model.dv.most_similar([song_embedding], topn=d2v_model.corpus_count)

        df_lyric_score = pd.merge(df_orig, ids_to_lyric_score, on='spotify_id', how='inner')

        df_song_lyric_score = pd.DataFrame(song_inferences, columns=['spotify_id', 'song_lyric_sim_score'])
        df_lyric_score = pd.merge(df_lyric_score, df_song_lyric_score, on='spotify_id', how='inner')

        songs = normalize(df_lyric_score[['danceability', 'energy', 'loudness', 'valence', 'tempo']], norm='l2')
        # songs = df_orig[['danceability', 'energy', 'loudness', 'valence', 'tempo']]

        similarities = cosine_similarity(predicted_audio_features, songs)
        similarities = similarities[0]

        df_lyric_score['audio_score'] = similarities

        df_lyric_score['weighted_score'] = df_lyric_score['audio_score'] * 2 + df_lyric_score['lyric_sim_score'] * 0.25 + df_lyric_score['song_lyric_sim_score'] * 1 + 0.005 * df_lyric_score['popularity']
        # df_lyric_score = df_lyric_score.sort_values('weighted_score', ascending=False)
        # df_lyric_score['weighted_score'].head()
        # songs_from_seed = df_lyric_score.head(n)
        all_scores = pd.concat([all_scores, df_lyric_score])

    # Grouping by spotify_id and averaging weighted scores
    average_scores = all_scores.groupby('spotify_id').agg({
        'weighted_score': 'mean', 
        'track': 'first', 
        'artist': 'first', 
        'danceability': 'first',
        'energy': 'first', 
        'loudness': 'first', 
        'valence': 'first', 
        'tempo': 'first',
        'image_url': 'first',
        'spotify_id': 'first'
    })

    average_scores = average_scores[~average_scores['spotify_id'].isin(bad_ids)]

    average_scores = average_scores.sort_values('weighted_score', ascending=False)
    top_songs = average_scores.head(n)

    return pd.concat([main_songs, top_songs]).drop_duplicates(subset='spotify_id').drop_duplicates(subset=['track', 'artist'])