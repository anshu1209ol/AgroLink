import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Search, ShoppingBag, MapPin, TrendingUp, Star, Mic, Bell, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import firestore from '@react-native-firebase/firestore';

const HomeScreen = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = firestore()
      .collection('products')
      .orderBy('created_at', 'desc')
      .limit(10)
      .onSnapshot(querySnapshot => {
        const items: any[] = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setProducts(items);
        setLoading(false);
      }, error => {
        console.error('Firestore Error:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const getEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('tomato')) return '🍅';
    if (n.includes('onion')) return '🧅';
    if (n.includes('potato')) return '🥔';
    if (n.includes('apple')) return '🍎';
    if (n.includes('carrot')) return '🥕';
    return '🥦';
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste, Farmer! 🙏</Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>Nashik, Maharashtra</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileInitial}>AS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Search "Organic Tomatoes"</Text>
            <Mic size={20} color="#2E7D32" />
          </View>
        </View>

        {/* AI Insight Card */}
        <LinearGradient colors={['#2E7D32', '#1B5E20']} style={styles.aiCard}>
          <View style={styles.aiCardContent}>
            <View style={styles.aiTag}>
              <Star size={12} color="#FFF" />
              <Text style={styles.aiTagText}>AI INSIGHT</Text>
            </View>
            <Text style={styles.aiTitle}>Smart Pricing</Text>
            <Text style={styles.aiSubtitle}>Based on current demand in Mumbai, your tomatoes could sell for 15% more this week.</Text>
            <TouchableOpacity style={styles.aiButton}>
              <Text style={styles.aiButtonText}>Check Analysis</Text>
            </TouchableOpacity>
          </View>
          <TrendingUp size={100} color="#FFF" style={styles.aiIllustration} />
        </LinearGradient>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Honey'].map((cat, idx) => (
            <View key={idx} style={styles.categoryItem}>
              <View style={[styles.categoryIcon, { backgroundColor: '#E8F5E9' }]}>
                <Text style={{ fontSize: 24 }}>{['🥬', '🍎', '🥛', '🌾', '🍯'][idx]}</Text>
              </View>
              <Text style={styles.categoryLabel}>{cat}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Trending Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fresh from Farms</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
        ) : (
          products.map((product) => (
            <TouchableOpacity key={product.id} style={styles.farmerCard}>
              <View style={styles.farmerInfo}>
                <View style={styles.farmerAvatar}>
                  <Text style={{ fontSize: 24 }}>{getEmoji(product.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.farmerName}>{product.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.priceText}>₹{product.price}/kg</Text>
                    <Text style={styles.ratingText}> • {product.contact || 'Local Farmer'}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.addButtonSmall}>
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button for Farmers */}
      <TouchableOpacity style={styles.fab}>
        <Plus size={30} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    color: '#9CA3AF',
    fontSize: 16,
  },
  aiCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  aiCardContent: {
    flex: 1,
    zIndex: 2,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  aiTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  aiTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
  },
  aiButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 13,
  },
  aiIllustration: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAll: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 30,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 65,
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  farmerCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  farmerAvatarText: {
    fontWeight: 'bold',
    color: '#6B7280',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addButtonSmall: {
    backgroundColor: '#2E7D32',
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmerProducts: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  productTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  }
});

export default HomeScreen;
