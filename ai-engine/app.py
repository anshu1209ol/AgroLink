from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# Mock data for demonstration
MARKET_RATES = {
    "tomato": {"avg": 40, "trend": "up", "nearby": [38, 42, 45]},
    "onion": {"avg": 30, "trend": "stable", "nearby": [28, 31, 32]},
    "potato": {"avg": 25, "trend": "down", "nearby": [22, 24, 26]}
}

@app.route('/api/ai/price-suggestion', methods=['POST'])
def price_suggestion():
    data = request.json
    product = data.get('product', '').lower()
    region = data.get('region', 'Nashik')
    
    # Simple logic to simulate AI prediction
    if product in MARKET_RATES:
        rate_info = MARKET_RATES[product]
        suggested_price = rate_info['avg'] + random.uniform(-2, 5)
        return jsonify({
            "suggested_price": round(suggested_price, 2),
            "trend": rate_info['trend'],
            "nearby_market_rates": rate_info['nearby'],
            "recommendation": f"Market demand for {product} is currently high in {region}. Selling now might be profitable."
        })
    else:
        return jsonify({
            "suggested_price": 50,
            "trend": "unknown",
            "recommendation": "Limited data for this product. Check nearby markets."
        })

@app.route('/api/ai/recommendations', methods=['GET'])
def smart_recommendations():
    # Return mock recommendations for a buyer or farmer
    user_role = request.args.get('role', 'customer')
    
    if user_role == 'farmer':
        return jsonify([
            {"title": "Best Crop to Sow", "desc": "Based on seasonal demand, Baby Corn has high projected ROI next quarter."},
            {"title": "Top Buyer Alert", "desc": "Retailer 'FreshMart' is looking for bulk onions within 20km."}
        ])
    else:
        return jsonify([
            {"title": "Best Value", "desc": "Organic Potatoes from Sunrise Farms are at their lowest price this week."},
            {"title": "Season Peak", "desc": "Alphonso Mangoes are now available at peak freshness."}
        ])

if __name__ == '__main__':
    app.run(port=5001, debug=True)
