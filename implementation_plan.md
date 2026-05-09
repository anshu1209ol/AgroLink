# AgroLink AI - Implementation Plan

## 1. Project Architecture
A multi-tier architecture designed for scalability and modern mobile-first experience.

- **Mobile App**: React Native (Expo) + TypeScript + NativeWind.
- **Web Dashboard (Admin/Retailer)**: React (Vite) + Tailwind CSS.
- **Backend Service**: Node.js + Express (Handles complex workflows, payments, and integrations).
- **Database & Auth**: Supabase (PostgreSQL, RLS, Auth, Storage).
- **AI Engine**: Python (Flask/FastAPI) + TensorFlow (Price prediction & recommendations).
- **Maps**: MapLibre/OpenStreetMap for location services.

## 2. Folder Structure
```text
agrolink-ai/
├── mobile-app/         # Expo React Native App
├── web-app/            # Vite React Admin/Retailer Dashboard
├── backend/            # Express.js Server
├── ai-engine/          # Python AI Service
└── docs/               # Documentation
```

## 3. Database Schema (Supabase/Postgres)

### Tables:
- `profiles`: `id, phone, full_name, role (farmer, customer, retail, delivery, admin), language, location (lat/lng), verified_status, aadhaar_kyc_url`
- `products`: `id, farmer_id, name, category, description, price, unit, stock_quantity, image_url, organic_certified (bool), created_at`
- `orders`: `id, buyer_id, total_amount, status (pending, paid, shipped, delivered), payment_method, delivery_address`
- `order_items`: `id, order_id, product_id, quantity, price_at_purchase`
- `equipment_rentals`: `id, owner_id, name, type (tractor, pump, etc), price_per_day, availability_status, location`
- `rental_bookings`: `id, renter_id, equipment_id, start_date, end_date, total_price, status`
- `cooperative_groups`: `id, group_name, leader_id, description`
- `group_members`: `id, group_id, farmer_id`
- `subscriptions`: `id, user_id, type (vegetable, milk), frequency, next_delivery_date`
- `learning_modules`: `id, title, content_type (video/text), content_url, category`

## 4. Feature Implementation Strategy

### Phase 1: Core Foundation & Auth (Week 1)
- Supabase Auth setup with Phone OTP.
- Profile management and Role-based access control.
- Basic navigation in Mobile App.

### Phase 2: Farmer & Customer Marketplace (Week 2)
- Farmer: Product management (CRUD), image uploads to Supabase Storage.
- Customer: Search, browse by location, cart, and checkout.
- Integration of MapLibre for nearby farmer discovery.

### Phase 3: AI & Advanced Features (Week 3)
- AI Price Suggestion (Flask API integration).
- Equipment Sharing & Group Selling modules.
- Subscriptions & Learning modules.

### Phase 4: Logistics & Payments (Week 4)
- Razorpay/UPI integration.
- Delivery partner tracking.
- Voice navigation & Multi-language support (i18next).

## 5. UI/UX Design Principles
- **Aesthetic**: Modern, "Earth-tone" palette (Deep Greens, Warm Browns, Soft Whites).
- **Accessibility**: High contrast, large touch targets, voice-first cues.
- **Navigation**: Simple Tab bar for Customer; Sidebar/Dashboard for Farmer.

## 6. AI Workflow
1. **Price Engine**: 
   - Input: Product type, region, season.
   - Process: Flask API queries historical data + real-time demand.
   - Output: Recommended price range.
2. **Recommendation**:
   - Collaborative filtering for buyers.
   - Demand heatmaps for farmers.

## 7. Revenue Model
- **Transaction Fee**: 2-3% on every sale.
- **Subscription Fee**: Monthly/Yearly for premium farmer insights.
- **Rental Commission**: 5% on equipment rentals.
- **Ads/Boost**: Farmers can pay to feature products.
