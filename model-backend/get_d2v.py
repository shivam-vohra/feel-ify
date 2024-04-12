# Load the doc2vec model into the backend first
from gensim.models.doc2vec import Doc2Vec

def get_d2v_model():
    return Doc2Vec.load('./data/models/lyric_vec_125k.bin')