import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import {
  calculateDaysRemaining,
  formatDateShort,
  formatKm,
  formatNumber,
  formatRupiah,
} from '../utils/formatters';

export const StatsScreen: React.FC = () => {
  const {
    activeVehicle,
    activeVehicleFuelLogs,
    activeVehicleServiceLogs,
    resetToDefaultData,
  } = useVehicle();

  if (!activeVehicle) return null;

  const totalFuelCost = activeVehicleFuelLogs.reduce((acc, c) => acc + c.totalPrice, 0);
  const totalServiceCost = activeVehicleServiceLogs.reduce((acc, c) => acc + c.totalCost, 0);
  const totalOwnershipCost = totalFuelCost + totalServiceCost;

  const fuelPercent =
    totalOwnershipCost > 0 ? Math.round((totalFuelCost / totalOwnershipCost) * 100) : 0;
  const servicePercent =
    totalOwnershipCost > 0 ? 100 - fuelPercent : 0;

  const totalLiters = activeVehicleFuelLogs.reduce((acc, c) => acc + c.liters, 0);
  const taxDays = calculateDaysRemaining(activeVehicle.taxExpiryDate);

  const handleReset = () => {
    Alert.alert(
      'Reset Data Contoh',
      'Apakah Anda ingin mereset seluruh data kembali ke data preset bawaan (Honda Vario & Avanza Veloz)? Tindakan ini akan mengembalikan data awal.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaultData();
            Alert.alert('Sukses', 'Data berhasil direset ke pengaturan awal.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* TCO Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>TOTAL BIAYA KEPEMILIKAN (TCO)</Text>
        <Text style={styles.heroTotal}>{formatRupiah(totalOwnershipCost)}</Text>
        <Text style={styles.heroSub}>
          Akumulasi pengeluaran BBM dan servis untuk {activeVehicle.name}
        </Text>

        {/* Breakdown bar */}
        <View style={styles.breakdownBar}>
          <View style={[styles.barFuel, { width: `${fuelPercent}%` }]} />
          <View style={[styles.barService, { width: `${servicePercent}%` }]} />
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>
              BBM ({fuelPercent}%): {formatRupiah(totalFuelCost)}
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.purple }]} />
            <Text style={styles.legendText}>
              Bengkel ({servicePercent}%): {formatRupiah(totalServiceCost)}
            </Text>
          </View>
        </View>
      </View>

      {/* Overview Stat Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ringkasan Kendaraan</Text>
      </View>

      <View style={styles.grid}>
        {/* Total Odometer */}
        <View style={styles.statCard}>
          <View style={styles.statIconCircle}>
            <Ionicons name="speedometer" size={18} color={COLORS.cyan} />
          </View>
          <Text style={styles.statCardLabel}>TOTAL JARAK</Text>
          <Text style={styles.statCardValue}>{formatKm(activeVehicle.currentKm)}</Text>
        </View>

        {/* Total Liter BBM */}
        <View style={styles.statCard}>
          <View style={styles.statIconCircle}>
            <Ionicons name="water" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.statCardLabel}>TOTAL BBM</Text>
          <Text style={styles.statCardValue}>
            {formatNumber(totalLiters, 1)} Liter
          </Text>
        </View>

        {/* Jumlah Servis */}
        <View style={styles.statCard}>
          <View style={styles.statIconCircle}>
            <Ionicons name="construct" size={18} color={COLORS.purple} />
          </View>
          <Text style={styles.statCardLabel}>LOG SERVIS</Text>
          <Text style={styles.statCardValue}>
            {activeVehicleServiceLogs.length} Kali
          </Text>
        </View>

        {/* Pajak STNK */}
        <View style={styles.statCard}>
          <View style={styles.statIconCircle}>
            <Ionicons name="calendar" size={18} color={COLORS.warningOrange} />
          </View>
          <Text style={styles.statCardLabel}>PAJAK STNK</Text>
          <Text
            style={[
              styles.statCardValue,
              taxDays <= 30 && { color: COLORS.warningOrange },
            ]}
          >
            {taxDays <= 0 ? 'Jatuh Tempo' : `${taxDays} Hari`}
          </Text>
        </View>
      </View>

      {/* Tax Details Card */}
      <View style={styles.taxCard}>
        <View style={styles.taxHeader}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.primaryLight} />
          <Text style={styles.taxTitle}>Informasi Pajak Kendaraan</Text>
        </View>
        <View style={styles.taxRow}>
          <Text style={styles.taxRowLabel}>Pajak Tahunan (PKB):</Text>
          <Text style={styles.taxRowValue}>
            {formatDateShort(activeVehicle.taxExpiryDate)} ({taxDays > 0 ? `${taxDays} hari lagi` : 'Sudah jatuh tempo'})
          </Text>
        </View>
        <View style={styles.taxRow}>
          <Text style={styles.taxRowLabel}>Pajak 5 Tahunan (Plat Nomor):</Text>
          <Text style={styles.taxRowValue}>
            {formatDateShort(activeVehicle.tax5YearExpiryDate)}
          </Text>
        </View>
      </View>

      {/* App Info & Reset Tools */}
      <View style={styles.appInfoCard}>
        <View style={styles.appTitleRow}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <Text style={styles.appTitle}>VeloCare iOS • Offline-First</Text>
        </View>
        <Text style={styles.appDesc}>
          Seluruh data tersimpan secara lokal dan aman di memori iPhone Anda (AsyncStorage). Tidak memerlukan koneksi internet untuk melihat status kendaraan atau mencatat riwayat.
        </Text>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={16} color={COLORS.danger} />
          <Text style={styles.resetButtonText}>Reset Data ke Preset Bawaan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  heroTotal: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  breakdownBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  barFuel: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  barService: {
    height: '100%',
    backgroundColor: COLORS.purple,
  },
  legendRow: {
    flexDirection: 'column',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.subtle,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  taxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xl,
    ...SHADOWS.subtle,
  },
  taxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  taxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  taxRow: {
    flexDirection: 'column',
    gap: 2,
    marginBottom: 8,
  },
  taxRowLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  taxRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  appInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.subtle,
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  appDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
    gap: 6,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
