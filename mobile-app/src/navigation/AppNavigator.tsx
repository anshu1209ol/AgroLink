import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, ShoppingBag, User, Package, Settings, PlusCircle } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { app as firebaseApp } from '../services/firebase';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FarmerDashboard from '../screens/FarmerDashboard';
// (Assuming other screens will be created)
const Placeholder = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{name} Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') return <Home size={size} color={color} />;
          if (route.name === 'Market') return <ShoppingBag size={size} color={color} />;
          if (route.name === 'Sell') return <PlusCircle size={size} color={color} />;
          if (route.name === 'Orders') return <Package size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
          return null;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          backgroundColor: '#FFF'
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Market" component={HomeScreen} />
      <Tab.Screen name="Sell" component={FarmerDashboard} />
      <Tab.Screen name="Orders" component={FarmerDashboard} />
      <Tab.Screen name="Profile" component={FarmerDashboard} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  useEffect(() => {
    console.log('AgroLink Mobile: Firebase Connected', firebaseApp.options.projectId);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      {/* Add detail screens here */}
    </Stack.Navigator>
  );
}


