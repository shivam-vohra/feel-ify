from transformers import AutoModelForSequenceClassification, AutoTokenizer
import joblib

# Helper functions that the later seeding songs use
def predict_VAD(sentiment_dimension, text_inputs):
  model_path = f'./data/models/{sentiment_dimension}_model'
  model = AutoModelForSequenceClassification.from_pretrained(model_path)

  tokenizer = AutoTokenizer.from_pretrained(model_path)

  inputs = tokenizer(text_inputs, return_tensors="pt", padding=True, truncation=True)

  outputs = model(**inputs)

  predictions = outputs.logits.squeeze()#.detach().cpu().numpy()

  return predictions

def predict_audio_features(input):
  VAD_to_features = joblib.load('./data/models/VAD_to_audiofeatures.joblib')

  scaler_X = joblib.load(f'./data/models/scaler_X.joblib')
  scaler_y = joblib.load(f'./data/models/scaler_y.joblib')

  input_sentiment_scaled = scaler_X.transform(input)

  predicted_audio_features_scaled = VAD_to_features.predict(input_sentiment_scaled)
  predicted_audio_features = scaler_y.inverse_transform(predicted_audio_features_scaled)

  return predicted_audio_features