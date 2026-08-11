import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import WatchAdsScreen from '../screens/WatchAdsScreen';
import SpinWinScreen from '../screens/SpinWinScreen';
import WalletScreen from '../screens/WalletScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import MyWithdrawalsScreen from '../screens/MyWithdrawalsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 5 Main Tabs (Matching UI Mockup Bottom Nav Bar: Home, Wallet, Spin, Activity, Profile)
export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primaryViolet,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 64,
          paddingBottom: 10,
          paddingTop: 6
        }
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Spin" component={SpinWinScreen} />
      <Tab.Screen name="Activity" component={MyWithdrawalsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="WatchAds" component={WatchAdsScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
    </Stack.Navigator>
  );
}
