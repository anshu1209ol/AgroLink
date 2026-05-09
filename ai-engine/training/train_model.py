import pandas as pd
import numpy as np
import kagglehub
from kagglehub import KaggleDatasetAdapter
import os
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data():
    logging.info("Downloading dataset from Kaggle...")
    # Load the latest version
    try:
        df = kagglehub.load_dataset(
            KaggleDatasetAdapter.PANDAS,
            "everydaycodings/produce-prices-dataset",
            "ProducePriceStatistics.csv",
        )
        return df
    except Exception as e:
        logging.error(f"Failed to load dataset: {e}")
        # Fallback to sample data for development if kaggle fails
        data = {
            'date': ['2026-05-01', '2026-05-01', '2026-05-02', '2026-05-02'],
            'vegetable': ['Tomato', 'Potato', 'Tomato', 'Potato'],
            'state': ['Madhya Pradesh', 'Madhya Pradesh', 'Uttar Pradesh', 'Uttar Pradesh'],
            'market': ['Gwalior', 'Gwalior', 'Agra', 'Agra'],
            'min_price': [1200, 900, 1300, 950],
            'max_price': [1800, 1300, 1900, 1400],
            'modal_price': [1500, 1100, 1600, 1150],
            'arrival_qty': [200, 500, 250, 600]
        }
        return pd.DataFrame(data)

def preprocess_data(df):
    logging.info("Preprocessing data...")
    
    # 1. Handle Missing Values
    df = df.dropna()
    
    # 2. Date Features
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.month
    df['weekday'] = df['date'].dt.weekday
    df['year'] = df['date'].dt.year
    
    # Define Season
    def get_season(month):
        if month in [3, 4, 5, 6]: return 'Summer'
        if month in [7, 8, 9, 10]: return 'Monsoon'
        return 'Winter'
    
    df['season'] = df['month'].apply(get_season)
    
    # 3. Feature Engineering
    # Demand level based on arrival quantity (normalized per vegetable)
    df['demand_score'] = df.groupby('vegetable')['arrival_qty'].transform(lambda x: (x - x.min()) / (x.max() - x.min() + 1))
    
    # Average Market Price
    df['avg_market_price'] = df[['min_price', 'max_price', 'modal_price']].mean(axis=1)
    
    # Price Volatility
    df['price_volatility'] = (df['max_price'] - df['min_price']) / (df['modal_price'] + 1)
    
    # Nearby Market Average (Simplified as state average for now)
    df['state_avg_price'] = df.groupby(['state', 'vegetable', 'month'])['modal_price'].transform('mean')
    
    # 4. Encoding
    le_veg = LabelEncoder()
    le_state = LabelEncoder()
    le_market = LabelEncoder()
    le_season = LabelEncoder()
    
    df['vegetable_encoded'] = le_veg.fit_transform(df['vegetable'])
    df['state_encoded'] = le_state.fit_transform(df['state'])
    df['market_encoded'] = le_market.fit_transform(df['market'])
    df['season_encoded'] = le_season.fit_transform(df['season'])
    
    # Save encoders
    os.makedirs('../models', exist_ok=True)
    joblib.dump(le_veg, '../models/le_veg.joblib')
    joblib.dump(le_state, '../models/le_state.joblib')
    joblib.dump(le_market, '../models/le_market.joblib')
    joblib.dump(le_season, '../models/le_season.joblib')
    
    return df, le_veg, le_state, le_market, le_season

def train_and_evaluate(df):
    logging.info("Training models...")
    
    features = ['vegetable_encoded', 'state_encoded', 'market_encoded', 'month', 'weekday', 'arrival_qty', 'state_avg_price', 'season_encoded']
    X = df[features]
    y = df['modal_price']
    
    if len(df) < 5:
        logging.warning("Not enough data for real training, skipping evaluation.")
        X_train, y_train = X, y
        X_test, y_test = X, y
    else:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # RF Model
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    
    # XGB Model
    xgb = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
    xgb.fit(X_train, y_train)
    xgb_pred = xgb.predict(X_test)
    
    # Metrics
    def get_metrics(y_true, y_pred):
        return {
            'MAE': mean_absolute_error(y_true, y_pred),
            'RMSE': np.sqrt(mean_squared_error(y_true, y_pred)),
            'R2': r2_score(y_true, y_pred)
        }
    
    rf_metrics = get_metrics(y_test, rf_pred)
    xgb_metrics = get_metrics(y_test, xgb_pred)
    
    logging.info(f"RF Metrics: {rf_metrics}")
    logging.info(f"XGB Metrics: {xgb_metrics}")
    
    # Selection
    if rf_metrics['R2'] >= xgb_metrics['R2']:
        best_model = rf
        model_name = "RandomForest"
    else:
        best_model = xgb
        model_name = "XGBoost"
        
    logging.info(f"Selected Best Model: {model_name}")
    
    # Save Model
    joblib.dump(best_model, '../models/price_model.joblib')
    
    # Visualizations
    os.makedirs('../visualizations', exist_ok=True)
    plt.figure(figsize=(10, 6))
    importances = best_model.feature_importances_
    indices = np.argsort(importances)
    plt.title(f"Feature Importance ({model_name})")
    plt.barh(range(len(indices)), importances[indices], align='center')
    plt.yticks(range(len(indices)), [features[i] for i in indices])
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig('../visualizations/feature_importance.png')
    
    return best_model

if __name__ == "__main__":
    # Ensure current working directory is the script's directory for relative paths
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    df = load_data()
    df_processed, _, _, _, _ = preprocess_data(df)
    train_and_evaluate(df_processed)
    logging.info("Training Complete!")
