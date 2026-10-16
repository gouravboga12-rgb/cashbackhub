import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Wallet, Disc, Clock, User } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import TopHeader from '../components/TopHeader';
import NotificationsModal from '../components/NotificationsModal';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WalletScreen from '../screens/WalletScreen';
import SpinWinScreen from '../screens/SpinWinScreen';
import MyWithdrawalsScreen from '../screens/MyWithdrawalsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WatchAdsScreen from '../screens/WatchAdsScreen';
import PlayDiceScreen from '../screens/PlayDiceScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import MysteryBoxScreen from '../screens/MysteryBoxScreen';

import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 5 Main Tabs (Matching UI Navbar: Home, Wallet, Spin, Activity, Profile)
function BottomTabNavigator({ navigation }: any) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifTrigger, setNotifTrigger] = React.useState(0);

  return (
    <View style={{ flex: 1 }}>
      <TopHeader
        onOpenNotifications={() => setShowNotifications(true)}
        onNavigateToWallet={() => navigation.navigate('Wallet')}
        onNavigateToProfile={() => navigation.navigate('Profile')}
        refreshTrigger={notifTrigger}
      />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primaryViolet,
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
          }}
        />
        <Tab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Wallet color={color} size={22} />,
          }}
        />
        <Tab.Screen
          name="Spin"
          component={SpinWinScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Disc color={color} size={24} />,
            tabBarLabel: 'Spin & Win',
          }}
        />
        <Tab.Screen
          name="Activity"
          component={MyWithdrawalsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Clock color={color} size={22} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
          }}
        />
      </Tab.Navigator>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationsChanged={() => setNotifTrigger((t) => t + 1)}
        navigation={navigation}
      />
    </View>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryViolet} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="WatchAds" component={WatchAdsScreen} />
          <Stack.Screen name="PlayDice" component={PlayDiceScreen} />
          <Stack.Screen name="SpinWin" component={SpinWinScreen} />
          <Stack.Screen name="Withdraw" component={WithdrawScreen} />
          <Stack.Screen name="MysteryBox" component={MysteryBoxScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
