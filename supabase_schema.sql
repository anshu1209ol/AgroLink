-- AgroLink AI: Database Schema

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  phone TEXT UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('farmer', 'customer', 'retailer', 'delivery', 'admin')),
  language TEXT DEFAULT 'English',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  verified_status BOOLEAN DEFAULT FALSE,
  aadhaar_kyc_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- e.g., 'kg', 'bundle', 'dozen'
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  organic_certified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Orders Table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'COD',
  delivery_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- 5. Equipment Rentals
CREATE TABLE equipment_rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'tractor', 'pump'
  price_per_day DECIMAL(10, 2) NOT NULL,
  availability_status BOOLEAN DEFAULT TRUE,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Rental Bookings
CREATE TABLE rental_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  renter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment_rentals(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- 7. Cooperative Groups (Group Selling)
CREATE TABLE cooperative_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Group Members
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES cooperative_groups(id) ON DELETE CASCADE NOT NULL,
  farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(group_id, farmer_id)
);

-- 9. Subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_type TEXT CHECK (subscription_type IN ('vegetable_box', 'milk', 'dairy')),
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'bi-weekly')),
  next_delivery_date DATE,
  status TEXT DEFAULT 'active'
);

-- 10. Learning Modules
CREATE TABLE learning_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('video', 'text', 'tutorial')),
  content_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products: Everyone can view, only farmers can insert/update/delete their own
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Farmers can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update their own products" ON products FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete their own products" ON products FOR DELETE USING (auth.uid() = farmer_id);

-- Orders: Users can see their own orders (as buyer) or orders of their products (as farmer)
-- (Simplification: Just buyer for now)
CREATE POLICY "Users can see their own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
