# AgroLink AI: Price Suggestion System 🚜🤖

This is the core AI engine for the AgroLink platform. It uses machine learning to suggest optimal selling prices for farmers based on historical market trends, seasonal demand, and regional supply levels.

## 📁 Project Structure

```text
ai-engine/
├── api/                # Flask API for serving predictions
├── models/             # Trained models and label encoders (joblib)
├── training/           # Training scripts and data pipelines
├── visualizations/     # Generated charts and model evaluation plots
├── dataset/            # Local data storage
├── utils/              # Helper functions
└── requirements.txt    # Python dependencies
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the Model
The training script automatically downloads the latest Indian Mandi price dataset from Kaggle and selects the best performing model (Random Forest vs XGBoost).
```bash
python training/train_model.py
```

### 3. Start the API
```bash
python api/app.py
```
The API will run on `http://localhost:5001`.

## 🧠 AI Features

- **Price Prediction**: Suggests the best price for a product in a specific market.
- **Demand Analysis**: Estimates demand level (High/Moderate/Low) based on arrival quantities.
- **Profit Potential**: Predicts if a price will lead to High/Moderate/Low profit.
- **Price Categorization**: Labels prices as "Too High", "Good Price", or "Too Low" compared to market trends.
- **Seasonal Insights**: Incorporates seasonal factors (Summer/Monsoon/Winter) into predictions.

## 🔌 API Endpoints

### `POST /predict-price`

**Request Body:**
```json
{
  "vegetable": "Tomato",
  "state": "Madhya Pradesh",
  "market": "Gwalior",
  "season": "Summer",
  "arrival_qty": 200,
  "price": 1800
}
```

**Response Body:**
```json
{
  "suggested_price": 1750.5,
  "market_average": 1715.0,
  "price_category": "Good Price",
  "demand": "High",
  "profit_prediction": "High",
  "status": "success"
}
```

## 📊 Model Evaluation
After training, check the `visualizations/` folder for:
- `feature_importance.png`: Shows which factors (market, season, qty) influence price the most.
- Model metrics (MAE, RMSE, R²) are logged during the training process.

---
Developed by **Senior AI Team** for AgroLink AI.
