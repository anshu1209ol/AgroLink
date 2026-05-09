import React, { useState, useEffect } from 'react';
import { db, app as firebaseApp, auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { supabase } from './supabaseClient';
import { collection, query, getDocs, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Home, 
  ShoppingBag, 
  Clock, 
  User, 
  Search, 
  Bell, 
  Plus,
  Minus,
  TrendingUp,
  Star,
  ChevronRight,
  MapPin,
  Settings,
  Shield,
  LogOut,
  Mic,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';
import './index.css';

// --- Mock Data Fallbacks ---
const CATEGORIES = [
  { id: 1, name: 'Vegetables', icon: '🥬', color: '#e8f5e9' },
  { id: 2, name: 'Fruits', icon: '🍎', color: '#ffebee' },
  { id: 3, name: 'Dairy', icon: '🥛', color: '#e3f2fd' },
  { id: 4, name: 'Grains', icon: '🌾', color: '#fff8e1' },
];

const MOCK_PRODUCTS = [
  { id: '101', name: 'Organic Heirloom Tomatoes', price: '40', quantity: '10 kg', contact: 'Farmer John', image: null, rating: 4.9, img: '🍅', tag: 'Best Deal 🔥' },
  { id: '102', name: 'Farm Fresh Potatoes', price: '30', quantity: '50 kg', contact: 'Sunrise Co.', image: null, rating: 4.8, img: '🥔', tag: 'Fresh Today' },
  { id: '103', name: 'Raw Organic Honey', price: '400', quantity: '2 kg', contact: 'Bee Kind', image: null, rating: 5.0, img: '🍯' },
  { id: '104', name: 'Crisp Green Apples', price: '120', quantity: '15 kg', contact: 'Orchard Hills', image: null, rating: 4.7, img: '🍏' },
];

const MOCK_ORDERS = [
  { id: 'ORD-1029', status: 'Delivered', date: 'Oct 12', amount: '₹1,200', items: 'Tomatoes, Potatoes' },
  { id: 'ORD-1030', status: 'Processing', date: 'Oct 14', amount: '₹450', items: 'Fresh Apples' },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        console.log('AgroLink: User signed in', u.uid);
      } else {
        signInAnonymously(auth).catch(err => console.error('Auth Error:', err));
      }
    });

    // Fetch AI Recommendations from Backend
    fetch('http://localhost:3000/api/ai/recommendations?role=farmer')
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(err => console.error('AgroLink: Backend connection failed', err));

    console.log('AgroLink: Firebase Connected', firebaseApp.options.projectId);
    return () => unsubscribe();
  }, []);

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setActiveTab('market');
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => 
          (item.name === product.name) 
            ? { ...item, cartQuantity: (item.cartQuantity || 1) + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    alert(`${product.name} added to cart!`);
  };

  const updateQuantity = (product: any, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (!existing) return prev;
      if ((existing.cartQuantity || 1) + delta <= 0) {
        return prev.filter(item => item.name !== product.name);
      }
      return prev.map(item => item.name === product.name ? { ...item, cartQuantity: (item.cartQuantity || 1) + delta } : item);
    });
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const productsRef = collection(db, 'products');
      let q = query(productsRef, orderBy('created_at', 'desc'));

      if (selectedCategory) {
        q = query(productsRef, where('category', '==', selectedCategory), orderBy('created_at', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (data && data.length > 0) {
        // Filter by search query if present (Firestore doesn't support easy case-insensitive 'ilike' without additional config)
        let filtered = data;
        if (searchQuery) {
          filtered = filtered.filter((p: any) => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
        setProducts(filtered);
      } else {
        // Use mock data if Firestore collection is empty
        let filtered = MOCK_PRODUCTS;
        if (selectedCategory) filtered = filtered.filter((p: any) => p.category === selectedCategory);
        if (searchQuery) filtered = filtered.filter((p: any) => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
        setProducts(filtered);
      }
    } catch (err) {
      console.log('Failed to fetch from Firestore, using mock data.', err);
      let filtered = MOCK_PRODUCTS;
      if (selectedCategory) filtered = filtered.filter((p: any) => p.category === selectedCategory);
      if (searchQuery) filtered = filtered.filter((p: any) => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
      setProducts(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Re-fetch after debounce when category or search changes
    return () => clearTimeout(timer);
  }, [selectedCategory, activeTab, searchQuery]);

  const getEmoji = (name: string = '') => {
    const n = (name || '').toLowerCase();
    if (n.includes('tomato')) return '🍅';
    if (n.includes('potato')) return '🥔';
    if (n.includes('onion')) return '🧅';
    if (n.includes('apple')) return '🍎';
    if (n.includes('carrot')) return '🥕';
    if (n.includes('honey')) return '🍯';
    if (n.includes('wheat') || n.includes('barley') || n.includes('grain')) return '🌾';
    if (n.includes('rice')) return '🍚';
    if (n.includes('corn')) return '🌽';
    return '🧺';
  };

  const renderContent = () => {
    if (activeTab.startsWith('track_')) {
      const orderId = activeTab.split('_')[1];
      const order = MOCK_ORDERS.find(o => o.id === orderId) || MOCK_ORDERS[0];
      return <TrackOrderTab order={order} onBack={() => setActiveTab('orders')} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeTab setActiveTab={setActiveTab} products={products} getEmoji={getEmoji} onAddToCart={handleAddToCart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onVoiceSearch={handleVoiceSearch} isListening={isListening} recommendations={recommendations} onSelectCategory={(cat: string) => {
          setSelectedCategory(cat);
          setActiveTab('market');
        }} />;
      case 'market':
        return <MarketTab products={products} getEmoji={getEmoji} isLoading={isLoading} selectedCategory={selectedCategory} onClearCategory={() => setSelectedCategory(null)} onAddToCart={handleAddToCart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onVoiceSearch={handleVoiceSearch} isListening={isListening} />;
      case 'sell':
        return <SellTab user={user} onSuccess={() => { fetchProducts(); setActiveTab('sell_success'); }} />;
      case 'sell_success':
        return <SellSuccessTab onContinue={() => setActiveTab('market')} />;
      case 'orders':
        return <OrdersTab setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileTab />;
      case 'cart':
        return <CartTab cart={cart} setCart={setCart} updateQuantity={updateQuantity} onCheckout={() => { alert('Order placed successfully! 🚜'); setCart([]); setActiveTab('orders'); }} />;
      default:
        return <HomeTab setActiveTab={setActiveTab} products={products} getEmoji={getEmoji} onAddToCart={handleAddToCart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onVoiceSearch={handleVoiceSearch} isListening={isListening} recommendations={recommendations} onSelectCategory={(cat: string) => {
          setSelectedCategory(cat);
          setActiveTab('market');
        }} />;
    }
  };

  return (
    <div className="app-container mobile-app-layout">
      {/* Mobile Top Navigation */}
      <div className="mobile-nav glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            F
          </div>
          <span style={{ fontWeight: 600, fontSize: '18px' }}>FarmerDirect</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={() => setActiveTab('cart')} style={{ position: 'relative' }}>
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#f44336', color: 'white', fontSize: '10px', borderRadius: '10px', padding: '2px 6px', fontWeight: 'bold' }}>
                {cart.length}
              </span>
            )}
          </button>
          <button className="btn-icon"><Bell size={20} /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content scroll-area">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav glass-panel" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', padding: '12px 20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', zIndex: 100, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <NavItem icon={<Home size={24} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon={<ShoppingBag size={24} />} label="Market" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
        <div className="nav-fab-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-30px' }}>
          <button className="nav-fab" onClick={() => setActiveTab('sell')} style={{ background: '#2E7D32', width: '56px', height: '56px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.3)', marginBottom: '4px', cursor: 'pointer' }}>
            <Plus size={28} color="white" />
          </button>
          <span className="nav-label" style={{ fontSize: '11px', fontWeight: 600, color: '#5e6b61' }}>Sell</span>
        </div>
        <NavItem icon={<Clock size={24} />} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        <NavItem icon={<User size={24} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

// --- Screens ---

function HomeTab({ products, getEmoji, setActiveTab, onSelectCategory, onAddToCart, searchQuery, setSearchQuery, onVoiceSearch, isListening, recommendations }: any) {
  return (
    <div className="fade-in">
      <header className="dashboard-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="dashboard-title">Welcome back 👋</h1>
          <p className="dashboard-subtitle">Here is what's happening at the market today.</p>
        </div>
      </header>

      <div className="mobile-search" style={{ marginBottom: '24px' }}>
         <div className="search-bar" style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Search products, farmers..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button onClick={onVoiceSearch} style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Mic size={18} color={isListening ? '#f44336' : 'var(--text-muted)'} />
            </button>
          </div>
      </div>

      {/* Seasonal Banner */}
      <div className="banner" style={{ 
        background: 'linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '24px', 
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 20px rgba(46, 125, 50, 0.2)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', marginBottom: '12px' }}>Summer Special</span>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Fresh Organic Harvest</h2>
          <p style={{ opacity: 0.9, marginBottom: '16px', fontSize: '14px' }}>Get up to 20% off directly from local farmers.</p>
          <button className="btn btn-accent" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => setActiveTab('market')}>Shop Now <ChevronRight size={16} /></button>
        </div>
        <div style={{ fontSize: '100px', position: 'absolute', right: '-10px', top: '10px', opacity: 0.2, zIndex: 1, transform: 'rotate(15deg)' }}>
          🥦
        </div>
      </div>

      {/* AI Smart Insights */}
      {recommendations && recommendations.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--primary-color)" /> AI Smart Insights
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="card" style={{ padding: '16px', borderLeft: '4px solid var(--primary-color)', background: '#f9fdfa' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: 'var(--primary-color)' }}>{rec.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{rec.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Categories</h3>
        </div>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} onClick={() => onSelectCategory(cat.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', cursor: 'pointer' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '8px' }}>
                {cat.icon}
              </div>
              <span style={{ fontWeight: 500, fontSize: '13px' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section style={{ paddingBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary-color)" /> Trending Today
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {products.slice(0, 4).map((product: any) => (
            <ProductCard key={product.id || product._id || product.name} product={product} getEmoji={getEmoji} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MarketTab({ products, getEmoji, isLoading, selectedCategory, onClearCategory, onAddToCart, searchQuery, setSearchQuery, onVoiceSearch, isListening }: any) {
  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Marketplace</h2>
      <div className="search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} color="var(--text-muted)" />
        <input type="text" placeholder="Search vegetables, fruits..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <button onClick={onVoiceSearch} style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Mic size={18} color={isListening ? '#f44336' : 'var(--text-muted)'} />
        </button>
      </div>

      {selectedCategory && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{selectedCategory}</span>
          <button onClick={onClearCategory} style={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: '14px', background: 'transparent', border: 'none' }}>Clear ✕</button>
        </div>
      )}
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading products...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {products.map((product: any) => (
            <ProductCard key={product.id || product._id || product.name} product={product} getEmoji={getEmoji} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

function SellTab({ user, onSuccess }: any) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('50'); // One-Tap Sell default
  const [contact, setContact] = useState('9876543210'); // One-Tap Sell default
  const [farmerName, setFarmerName] = useState('John Doe'); // Default seller name
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fair Price Indicator Logic
  let priceIndicator = null;
  if (price && !isNaN(Number(price))) {
    const p = Number(price);
    if (p < 40) {
      priceIndicator = <div style={{ color: '#f57c00', fontWeight: 600, fontSize: '13px', marginTop: '6px' }}>Best Deal 🔥 (High demand likely)</div>;
    } else if (p >= 40 && p <= 80) {
      priceIndicator = <div style={{ color: '#2e7d32', fontWeight: 600, fontSize: '13px', marginTop: '6px' }}>Good Price 👍 (Market average)</div>;
    } else {
      priceIndicator = <div style={{ color: '#d32f2f', fontWeight: 600, fontSize: '13px', marginTop: '6px' }}>Too High ⚠️ (Above average)</div>;
    }
  }

  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      let publicImageUrl = image; // Default to base64 or previous value

      // If it's a new file (base64 string starting with data:image), upload to Supabase
      if (image && image.startsWith('data:image')) {
        const fileExt = image.split(';')[0].split('/')[1];
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        // Convert base64 to Blob
        const base64Data = image.split(',')[1];
        const blob = await (await fetch(`data:image/${fileExt};base64,${base64Data}`)).blob();

        const { data, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        publicImageUrl = publicUrl;
      }

      const productsRef = collection(db, 'products');
      await addDoc(productsRef, {
        name,
        price: Number(price),
        quantity: quantity + ' kg',
        contact,
        farmer_id: user?.uid || 'anonymous',
        farmer_name: farmerName,
        image: publicImageUrl || null,
        created_at: serverTimestamp()
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert('Error saving product: ' + (err.message || 'Unknown error. Make sure "product-images" bucket exists in Supabase.'));
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Quick Add Product</h2>
        <span className="badge badge-fresh">⚡ One-Tap Sell</span>
      </div>
      
      <form onSubmit={handleSave} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Product Image</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', border: '2px dashed #ccc', borderRadius: '12px', cursor: 'pointer', background: '#fafafa' }}>
              <ImageIcon size={24} color="#888" />
              <span style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>Upload</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            {image && <img src={image} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Produce Name</label>
          <input className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0' }} required value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Organic Tomatoes" />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Price per kg (₹)</label>
          <input className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0' }} required type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 40" />
          {priceIndicator}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Quantity (kg)</label>
            <input className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0' }} type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="50" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Contact (Auto)</label>
            <input className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0' }} required value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Seller Name</label>
          <input className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e0e0e0' }} required value={farmerName} onChange={e => setFarmerName(e.target.value)} placeholder="e.g., John Doe" />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '10px', fontSize: '16px', padding: '14px' }}>
          {loading ? 'Adding...' : 'Publish to Market'}
        </button>
      </form>
    </div>
  );
}

function OrdersTab({ setActiveTab }: any) {
  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>My Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {MOCK_ORDERS.map((order, i) => (
          <div key={i} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>{order.id}</span>
              <span className="badge" style={{ background: order.status === 'Delivered' ? '#e8f5e9' : '#fff3e0', color: order.status === 'Delivered' ? '#2e7d32' : '#f57c00' }}>
                {order.status}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <div style={{ marginBottom: '4px' }}>{order.date}</div>
              <div>{order.items}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-color)' }}>{order.amount}</span>
              <button className="btn" style={{ color: 'var(--primary-color)', fontWeight: 600 }} onClick={() => setActiveTab('track_' + order.id)}>Track</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackOrderTab({ order, onBack }: any) {
  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>
      <button onClick={onBack} className="btn-icon" style={{ marginBottom: '16px', padding: 0 }}>
        <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} /> Back
      </button>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Track Order</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{order.id} • {order.items}</p>
      
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Delivery Status</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
          {/* Vertical line connecting steps */}
          <div style={{ position: 'absolute', left: '16px', top: '16px', bottom: '16px', width: '2px', background: '#e0e0e0', zIndex: 0 }}></div>
          
          <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '17px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Order Confirmed</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Oct 12, 10:00 AM</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '17px', background: order.status === 'Processing' ? 'var(--primary-color)' : '#e0e0e0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {order.status === 'Delivered' ? '✓' : '2'}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Processing by Farmer</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.status === 'Delivered' ? 'Oct 12, 02:00 PM' : 'Currently preparing your fresh produce'}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '17px', background: order.status === 'Delivered' ? 'var(--primary-color)' : '#e0e0e0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {order.status === 'Delivered' ? '✓' : '3'}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Delivered</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.status === 'Delivered' ? 'Oct 13, 11:30 AM' : 'Estimated tomorrow'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--primary-color-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
          <User size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Ramesh Farmer</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Delivery Partner</p>
        </div>
        <button className="btn-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}><span style={{ fontSize: '20px' }}>📞</span></button>
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
          A
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Anshul</h2>
          <p style={{ color: 'var(--text-muted)' }}>anshul@farmerdirect.com</p>
        </div>
      </div>

      <div className="banner" style={{ background: 'linear-gradient(135deg, #FBC02D 0%, #F57F17 100%)', borderRadius: '16px', padding: '20px', color: 'white', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><Star size={18} fill="white" /> Farmer Pro</h3>
          <p style={{ fontSize: '13px', opacity: 0.9 }}>0% listing fees & premium features.</p>
        </div>
        <button className="btn" style={{ background: 'white', color: '#F57F17', fontWeight: 600 }}>Active</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px' }}>Settings</h4>
        <ProfileMenuItem icon={<User size={20} />} title="Account Details" />
        <ProfileMenuItem icon={<MapPin size={20} />} title="Farm Address" />
        <ProfileMenuItem icon={<Settings size={20} />} title="Preferences" />
        <ProfileMenuItem icon={<Shield size={20} />} title="Privacy & Security" />
        <div style={{ marginTop: '16px' }}>
          <ProfileMenuItem icon={<LogOut size={20} color="#f44336" />} title="Log Out" color="#f44336" />
        </div>
      </div>
    </div>
  );
}

function ProfileMenuItem({ icon, title, color = '#1a1a1a' }: any) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ color: color }}>{icon}</div>
        <span style={{ fontSize: '16px', fontWeight: 500, color: color }}>{title}</span>
      </div>
      <ChevronRight size={18} color="#bdbdbd" />
    </div>
  );
}

function ProductCard({ product, getEmoji, onAddToCart }: any) {
  // Farmer Trust Badge (SMART UX) Logic
  let trustBadge = "⭐ Verified Farmer";
  let tagColor = '#e8f5e9';
  let tagText = '#2e7d32';
  
  const productName = product.name || 'Product';
  if (productName.toLowerCase().includes('fresh') || productName.toLowerCase().includes('leaf') || productName.toLowerCase().includes('organic')) {
    trustBadge = "🌿 Fresh Produce";
  } else if (Number(product.price) < 50) {
    trustBadge = "🚀 Fast Seller";
    tagColor = '#fff3e0';
    tagText = '#f57c00';
  }

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
      <div style={{ height: '140px', background: '#f0f4f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', position: 'relative' }}>
        {(product.image && product.image.length > 20) ? <img src={product.image} alt={productName} style={{width:'100%', height:'100%', objectFit:'cover'}} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : getEmoji(productName)}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className="badge" style={{ fontSize: '10px', background: tagColor, color: tagText, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{trustBadge}</span>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3, marginBottom: '8px', height: '36px' }}>{productName}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '11px' }}>
          <Star size={10} fill="#FBC02D" color="#FBC02D" /> 4.9 • {product.farmer_name || product.contact || 'Local Farmer'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>₹{product.price}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/kg</span>
          </div>
          <button className="btn btn-primary" onClick={() => onAddToCart && onAddToCart(product)} style={{ padding: '6px', borderRadius: '8px' }}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`nav-item ${active ? 'active' : ''}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '4px', 
        background: 'transparent', 
        border: 'none', 
        cursor: 'pointer', 
        color: active ? '#2E7D32' : '#5e6b61' 
      }}
    >
      <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span className="nav-label" style={{ fontSize: '11px', fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function CartTab({ cart, setCart, updateQuantity, onCheckout }: any) {
  const total = cart.reduce((sum: number, item: any) => sum + (Number(item.price) * (item.cartQuantity || 1)), 0);

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Your Cart</h2>
      </div>
      
      {cart.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <ShoppingBag size={48} color="#e0e0e0" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 500 }}>Your cart is empty</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Add fresh items from the market!</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cart.map((item: any) => (
              <div key={item.id || item._id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px' }}>
                <div style={{ width: '60px', height: '60px', background: '#f0f4f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                  {item.image ? <img src={item.image} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'12px'}} /> : '🥦'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{item.name}</h4>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>{item.quantity || item.unit || '1 kg'}</div>
                  <div style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '15px' }}>₹{item.price} x {item.cartQuantity}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button className="btn-icon" onClick={() => updateQuantity(item, -1)} style={{ background: '#f0f0f0', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={14} color="#333" />
                    </button>
                    <span style={{ fontWeight: 600, fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.cartQuantity}</span>
                    <button className="btn-icon" onClick={() => updateQuantity(item, 1)} style={{ background: '#f0f0f0', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} color="#333" />
                    </button>
                  </div>
                </div>
                <button 
                  className="btn-icon" 
                  onClick={() => setCart(cart.filter((c: any) => c.name !== item.name))}
                  style={{ color: '#f44336', background: '#ffebee', padding: '8px', borderRadius: '8px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)' }}>
              <span>Delivery Fee</span>
              <span>₹20.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f0f0f0', marginBottom: '24px', fontSize: '18px', fontWeight: 700 }}>
              <span>Total:</span>
              <span>₹{(total + 20).toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }} onClick={onCheckout}>
              Checkout & Pay ₹{(total + 20).toFixed(2)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SellSuccessTab({ onContinue }: any) {
  return (
    <div className="fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
      <CheckCircle size={64} color="#2e7d32" style={{ margin: '0 auto 24px', display: 'block' }} />
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Product Listed!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Your product is now live on the marketplace. Customers can start buying it immediately.</p>
      <button className="btn btn-primary" onClick={onContinue} style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
        Back to Marketplace
      </button>
    </div>
  );
}

export default App;
