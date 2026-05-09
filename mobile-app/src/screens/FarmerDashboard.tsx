import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, ArrowRight, BarChart2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const FarmerDashboard = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ earnings: '45,200', orders: '24' });

  React.useEffect(() => {
    const unsubscribe = firestore()
      .collection('products')
      .orderBy('created_at', 'desc')
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Summary */}
        <View style={styles.profileSection}>
          <Text style={styles.welcomeText}>Farmer Dashboard</Text>
          <Text style={styles.dateText}>Wednesday, 6 May 2026</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <DollarSign size={20} color="#2E7D32" />
            </View>
            <Text style={styles.statValue}>₹{stats.earnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <ShoppingCart size={20} color="#1976D2" />
            </View>
            <Text style={styles.statValue}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
        </View>

        {/* AI Insight Section */}
        <TouchableOpacity style={styles.aiInsightCard}>
          <View style={styles.aiIconContainer}>
            <TrendingUp size={24} color="#FFF" />
          </View>
          <View style={styles.aiTextContainer}>
            <Text style={styles.aiTitle}>Smart Pricing Recommendation</Text>
            <Text style={styles.aiDescription}>Onion prices in Nashik Mandi are projected to rise. Hold stock for 3 more days.</Text>
          </View>
          <ArrowRight size={20} color="#CCC" />
        </TouchableOpacity>

        {/* My Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Inventory</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.productGrid}>
             {products.map((product) => (
               <View key={product.id} style={styles.productItem}>
                  <View style={styles.productImagePlaceholder}>
                    <Text style={{fontSize: 30}}>{getEmoji(product.name)}</Text>
                  </View>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productStock}>Stock: {product.quantity || '0 kg'}</Text>
                  <Text style={styles.productPrice}>₹{product.price}/kg</Text>
               </View>
             ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#FFF',
    width: (width - 55) / 2,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  aiInsightCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  aiDescription: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 6,
  },
  statusBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#EF6C00',
    fontWeight: 'bold',
  },
  orderItems: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 15,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  viewButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    backgroundColor: '#FFF',
    width: (width - 55) / 2,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productStock: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 4,
  }
});

export default FarmerDashboard;
