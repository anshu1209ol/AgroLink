# AgroLink AI - Modern Farmer-to-Consumer Marketplace 🚜🌾

AgroLink AI is a multi-tier platform designed to empower farmers by providing direct access to consumers, AI-driven price suggestions, and local equipment sharing.

## 🏗️ Architecture Overview

The project is structured as a monorepo containing the following components:

- **Mobile App (`/mobile-app`)**: React Native (Expo) app for Farmers and Consumers. Features real-time price tracking, product management, and nearby market discovery.
- **Web Dashboard (`/web-app`)**: Vite + React dashboard for Admins and Retailers to manage inventory, verify farmers, and monitor demand analytics.
- **Backend Service (`/backend`)**: Node.js Express server handling complex workflows, Supabase integration, and AI proxying.
- **AI Engine (`/ai-engine`)**: Python Flask service that utilizes machine learning models (XGBoost/RandomForest) to provide price predictions based on market data.

## 🚀 Key Features

- **Direct Marketplace**: Buy and sell fresh produce without intermediaries.
- **AI Price Engine**: Real-time price suggestions based on seasonal trends and market demand.
- **Equipment Sharing**: Peer-to-peer rental system for farming machinery.
- **Secure Verification**: Identity verification for farmers via backend-integrated workflows.
- **Multi-language Support**: i18next integration for regional accessibility.

## 🛠️ Tech Stack

- **Frontend**: React, React Native (Expo), TypeScript, Tailwind CSS / NativeWind.
- **Backend**: Node.js, Express, Python (Flask).
- **Database & Auth**: Supabase (Postgres), Firebase (Firestore/Auth fallback).
- **ML/AI**: Scikit-learn, XGBoost, Pandas.
- **Deployment**: Vercel (Web), EAS (Mobile APK).

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Expo CLI (`npm install -g expo-cli`)
- Firebase CLI (`npm install -g firebase-tools`)

### Local Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/anshu1209ol/AgroLink.git
   cd AgroLink
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file (see .env.example)
   node server.js
   ```

3. **AI Engine Setup**
   ```bash
   cd ai-engine
   pip install -r requirements.txt
   python app.py
   ```

4. **Web App Setup**
   ```bash
   cd web-app
   npm install
   npm run dev
   ```

5. **Mobile App Setup**
   ```bash
   cd mobile-app
   npm install
   npx expo start
   ```

## 🔒 Security & Configuration

- **Environment Variables**: Sensitive keys (Supabase, Firebase, API URLs) must be stored in `.env` files within their respective directories. These are excluded from version control for security.
- **Firebase**: Ensure `google-services.json` and `serviceAccountKey.json` are placed in the correct directories before building native apps.

## 📈 AI Training
To retrain the price prediction model with the latest market data:
```bash
cd ai-engine/training
python train_model.py
```

## 📄 License
This project is for demonstration and developmental purposes.

---
Created with ❤️ for the future of farming.
