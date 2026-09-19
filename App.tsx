import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS, SPACING } from './src/constants/theme';
import { VehicleProvider, useVehicle } from './src/context/VehicleContext';
import { Header } from './src/components/Header';
import { OdometerModal } from './src/components/OdometerModal';
import { AddFuelModal } from './src/components/AddFuelModal';
import { AddServiceModal } from './src/components/AddServiceModal';
import { AddVehicleModal } from './src/components/AddVehicleModal';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { FuelScreen } from './src/screens/FuelScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { GarageScreen } from './src/screens/GarageScreen';
import { StatsScreen } from './src/screens/StatsScreen';

type TabKey = 'dashboard' | 'fuel' | 'history' | 'garage' | 'stats';

interface TabItem {
  key: TabKey;
  label: string;
  icon: any;
  iconActive: any;
}

const TABS: TabItem[] = [
  {
    key: 'dashboard',
    label: 'Beranda',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    key: 'fuel',
    label: 'BBM',
    icon: 'water-outline',
    iconActive: 'water',
  },
  {
    key: 'history',
    label: 'Servis',
    icon: 'construct-outline',
    iconActive: 'construct',
  },
  {
    key: 'garage',
    label: 'Garasi',
    icon: 'car-sport-outline',
    iconActive: 'car-sport',
  },
  {
    key: 'stats',
    label: 'Statistik',
    icon: 'bar-chart-outline',
    iconActive: 'bar-chart',
  },
];

const MainNavigation: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isLoading, activeVehicle } = useVehicle();

  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');

  // Modal states
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [isAddFuelModalOpen, setIsAddFuelModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat VeloCare...</Text>
      </View>
    );
  }

  const renderCurrentScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onOpenOdometer={() => setIsOdometerModalOpen(true)}
            onOpenAddFuel={() => setIsAddFuelModalOpen(true)}
            onOpenAddService={() => setIsAddServiceModalOpen(true)}
            onNavigateToTab={(tab) => setCurrentTab(tab as TabKey)}
          />
        );
      case 'fuel':
        return (
          <FuelScreen onOpenAddFuel={() => setIsAddFuelModalOpen(true)} />
        );
      case 'history':
        return (
          <HistoryScreen onOpenAddService={() => setIsAddServiceModalOpen(true)} />
        );
      case 'garage':
        return (
          <GarageScreen
            onOpenAddVehicle={() => setIsAddVehicleModalOpen(true)}
            onSelectVehicle={() => setCurrentTab('dashboard')}
          />
        );
      case 'stats':
        return <StatsScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* iOS App Top Header */}
      <Header
        onOpenOdometerModal={() => setIsOdometerModalOpen(true)}
        onOpenAddVehicleModal={() => setIsAddVehicleModalOpen(true)}
      />

      {/* Screen Body */}
      <View style={styles.screenContainer}>{renderCurrentScreen()}</View>

      {/* iOS Floating Glass Tab Bar */}
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 14) : 12,
          },
        ]}
      >
        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => setCurrentTab(tab.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabIconBadge,
                  isActive && styles.tabIconBadgeActive,
                ]}
              >
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={20}
                  color={isActive ? COLORS.primary : COLORS.tabBarInactive}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Global Modals */}
      <OdometerModal
        visible={isOdometerModalOpen}
        onClose={() => setIsOdometerModalOpen(false)}
      />
      <AddFuelModal
        visible={isAddFuelModalOpen}
        onClose={() => setIsAddFuelModalOpen(false)}
      />
      <AddServiceModal
        visible={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
      />
      <AddVehicleModal
        visible={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <VehicleProvider>
        <MainNavigation />
      </VehicleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.tabBarBorder,
    paddingTop: 8,
    ...SHADOWS.subtle,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconBadge: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  tabIconBadgeActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: COLORS.tabBarInactive,
    fontWeight: '500',
  },
});
