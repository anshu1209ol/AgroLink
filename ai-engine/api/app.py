from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load Models and Encoders
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

model = None
le_veg = None
le_state = None
le_market = None
le_season = None

def load_resources():
    global model, le_veg, le_state, le_market, le_season
    try:
        model = joblib.load(os.path.join(MODELS_DIR, 'price_model.joblib'))
        le_veg = joblib.load(os.path.join(MODELS_DIR, 'le_veg.joblib'))
        le_state = joblib.load(os.path.join(MODELS_DIR, 'le_state.joblib'))
        le_market = joblib.load(os.path.join(MODELS_DIR, 'le_market.joblib'))
        le_season = joblib.load(os.path.join(MODELS_DIR, 'le_season.joblib'))
        logger.info("AgroLink AI: All models and encoders loaded successfully.")
    except Exception as e:
        logger.error(f"AgroLink AI: Error loading models: {e}")

load_resources()

@app.route('/predict-price', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Please run training first.", "status": "error"}), 503
        
    try:
        data = request.json
        veg = data.get('vegetable', 'Tomato')
        state = data.get('state', 'Madhya Pradesh')
        market = data.get('market', 'Gwalior')
        season = data.get('season', 'Summer')
        arrival_qty = float(data.get('arrival_qty', 200))
        user_price = float(data.get('price', 0))

        # Handle unknown categories safely
        def safe_transform(le, val, default_val=0):
            try:
                return le.transform([val])[0]
            except:
                return default_val

        veg_enc = safe_transform(le_veg, veg)
        state_enc = safe_transform(le_state, state)
        market_enc = safe_transform(le_market, market)
        season_enc = safe_transform(le_season, season)
        
        # Date features (Current)
        now = pd.Timestamp.now()
        month = now.month
        weekday = now.weekday()

        # Input features for prediction
        # features = ['vegetable_encoded', 'state_encoded', 'market_encoded', 'month', 'weekday', 'arrival_qty', 'state_avg_price', 'season_encoded']
        # Mock state_avg_price as 1500 for demo if not provided
        state_avg_price = 1500 
        
        features_arr = np.array([[veg_enc, state_enc, market_enc, month, weekday, arrival_qty, state_avg_price, season_enc]])
        suggested_price = float(model.predict(features_arr)[0])

        # Logic for Price Category
        if user_price <= 0:
            category = "N/A"
        else:
            diff = (user_price - suggested_price) / suggested_price
            if diff > 0.20:
                category = "Too High"
            elif diff > 0.05:
                category = "Slightly High"
            elif diff < -0.20:
                category = "Too Low"
            elif diff < -0.05:
                category = "Slightly Low"
            else:
                category = "Good Price"

        # Logic for Demand & Profit Potential
        demand = "High" if arrival_qty < 150 else "Moderate" if arrival_qty < 400 else "Low"
        
        if category == "Good Price" and demand == "High":
            profit = "High"
        elif category in ["Slightly High", "Good Price"] and demand == "Moderate":
            profit = "Moderate"
        else:
            profit = "Low"

        return jsonify({
            "suggested_price": round(suggested_price, 2),
            "market_average": round(suggested_price * 0.98, 2),
            "price_category": category,
            "demand": demand,
            "profit_prediction": profit,
            "vegetable": veg,
            "status": "success"
        })

    except Exception as e:
        logger.error(f"Prediction Error: {e}")
        return jsonify({"error": str(e), "status": "error"}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "model_loaded": model is not None,
        "service": "AgroLink Price AI"
    })

if __name__ == '__main__':
    # Try to reload resources if they weren't loaded at start
    if model is None:
        load_resources()
    app.run(host='0.0.0.0', port=5001)
