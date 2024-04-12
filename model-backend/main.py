from multiprocessing.context import get_spawning_popen
from flask import Flask, jsonify, request
from get_data import get_song_data
from song_utils import get_seed_songs, get_songs_from_seed
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

songs = get_song_data()

@app.route('/get-seeds', methods=['GET'])
def get_seeds():

    query_param = request.args.get('input', default=None, type=str)

    seed_songs = get_seed_songs(query_param, 10, songs)

    frontend_cares_about = ['track', 'artist', 'image_url', 'spotify_id']

    return seed_songs[frontend_cares_about].to_json(orient='records')

@app.route('/seed-songs', methods=['GET'])
def recommend_songs():
    # Extract comma-separated Spotify IDs from the query parameter
    seed_ids = request.args.get('seed_ids')
    bad_ids = request.args.get('disliked_ids')
    if not seed_ids:
        return jsonify({'error': 'No seed IDs provided'}), 400
    if not bad_ids:
        return jsonify({'error': 'No bad IDs provided'}), 400

    if len(bad_ids) == 0:
        bad_ids = []
    else:
        bad_ids = bad_ids.split(',')
    seed_ids = seed_ids.split(',')
    num_songs = 20  # Default to returning 10 songs
    user_input = request.args.get('input', default='', type=str)  # Optional textual input from user

    # Retrieve rows for the seed songs
    main_songs = songs[songs['spotify_id'].isin(seed_ids)]
    print(seed_ids)
    if main_songs.empty:
        return jsonify({'error': 'Seed songs not found'}), 404

    # Call your song recommendation function
    recommended_songs = get_songs_from_seed(main_songs, bad_ids, user_input, num_songs, songs)

    # Convert the result to JSON
    frontend_cares_about = ['track', 'artist', 'image_url', 'spotify_id']
    return recommended_songs[frontend_cares_about].to_json(orient='records')

if __name__ == '__main__':
    app.run(debug=True, port=8080)

