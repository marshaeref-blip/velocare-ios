import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import { FuelLog } from '../types';
import {
  formatDateShort,
  formatKm,
  formatNumber,
  formatRupiah,
  getFuelTypeName,
} from '../utils/formatters';

interface FuelScreenProps {
  onOpenAddFuel: () => void;
}

export const FuelScreen: React.FC<FuelScreenProps> = ({ onOpenAddFuel }) => {
  const { activeVehicle, activeVehicleFuelLogs, deleteFuelLog } = useVehicle();

  if (!activeVehicle) return null;

  // Hitung rata-rata efisiensi (KM/L)
  const logsWithEfficiency = activeVehicleFuelLogs.filter(
    (l) => l.efficiencyKmPerL && l.efficiencyKmPerL > 0
  );
  const avgEfficiency =
    logsWithEfficiency.length > 0
      ? Number(
          (
            logsWithEfficiency.reduce((acc, curr) => acc + (curr.efficiencyKmPerL || 0), 0) /
            logsWithEfficiency.length
          ).toFixed(1)
        )
      : null;

  // Hitung total pengeluaran bensin & total liter
  const totalSpent = activeVehicleFuelLogs.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalLiters = activeVehicleFuelLogs.reduce((acc, curr) => acc + curr.liters, 0);

  // Rata-rata biaya per KM
  const logsWithCostPerKm = activeVehicleFuelLogs.filter((l) => l.costPerKm && l.costPerKm > 0);
  const avgCostPerKm =
    logsWithCostPerKm.length > 0
      ? Math.round(
          logsWithCostPerKm.reduce((acc, curr) => acc + (curr.costPerKm || 0), 0) /
            logsWithCostPerKm.length
        )
      : null;

  const handleDelete = (log: FuelLog) => {
    Alert.alert(
      'Hapus Catatan Bensin',
      `Yakin ingin menghapus catatan bensin ${formatDateShort(log.date)} (${formatRupiah(
        log.totalPrice
      )})?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteFuelLog(log.id),
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Stats Summary Card */}
      <LinearGradient
        colors={['#162846', '#0E1728']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
      >
        <View style={styles.statsHeaderRow}>
          <Text style={styles.statsCardTitle}>EFISIENSI & KONSUMSI BBM</Text>
          <View style={styles.fuelBadge}>
            <Ionicons name="flame" size={12} color={COLORS.primaryLight} />
            <Text style={styles.fuelBadgeText}>
              {activeVehicle.fuelType.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {/* Rata-rata KM/L */}
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Rata-rata Konsumsi</Text>
            <View style={styles.statValRow}>
              <Text style={styles.statValBig}>
                {avgEfficiency ? avgEfficiency : '-'}
              </Text>
              {avgEfficiency ? <Text style={styles.statUnit}>km/L</Text> : null}
            </View>
            <Text style={styles.statHint}>
              {avgEfficiency
                ? avgEfficiency > 35
                  ? 'Sangat Irit'
                  : 'Konsumsi Normal'
                : 'Belum cukup data'}
            </Text>
          </View>

          <View style={styles.statDivider} />

          {/* Biaya per KM */}
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Biaya per KM</Text>
            <View style={styles.statValRow}>
              <Text style={styles.statValBig}>
                {avgCostPerKm ? formatRupiah(avgCostPerKm) : '-'}
              </Text>
            </View>
            <Text style={styles.statHint}>Estimasi operasional/km</Text>
          </View>
        </View>

        {/* Total Spending Subrow */}
        <View style={styles.statsFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerItemLabel}>Total Pengeluaran BBM</Text>
            <Text style={styles.footerItemValue}>{formatRupiah(totalSpent)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerItemLabel}>Total Liter</Text>
            <Text style={styles.footerItemValue}>
              {formatNumber(totalLiters, 1)} Liter
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Add Fuel Action Row */}
      <View style={styles.actionRow}>
        <Text style={styles.listTitle}>Riwayat Pengisian Bensin</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onOpenAddFuel}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Catat Isi Bensin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: FuelLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logCardTop}>
        <View style={styles.logLeft}>
          <View style={styles.fuelIconWrapper}>
            <Ionicons name="water" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.logPrice}>{formatRupiah(item.totalPrice)}</Text>
            <Text style={styles.logSubDetails}>
              {item.liters} Liter • {getFuelTypeName(item.fuelType).split(' ')[0]}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Middle info */}
      <View style={styles.logMiddle}>
        <View style={styles.middleItem}>
          <Ionicons name="speedometer-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.middleItemText}>{formatKm(item.odometer)}</Text>
        </View>

        <View style={styles.middleItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.middleItemText}>{formatDateShort(item.date)}</Text>
        </View>

        {item.isFullTank && (
          <View style={styles.fullTankBadge}>
            <Text style={styles.fullTankText}>Full Tank</Text>
          </View>
        )}
      </View>

      {/* Gas station & efficiency footer */}
      <View style={styles.logBottom}>
        <View style={{ flex: 1 }}>
          {item.gasStationName ? (
            <View style={styles.stationRow}>
              <Ionicons name="location-sharp" size={12} color={COLORS.textMuted} />
              <Text style={styles.stationText} numberOfLines={1}>
                {item.gasStationName}
              </Text>
            </View>
          ) : null}
          {item.notes ? (
            <Text style={styles.logNotes} numberOfLines={1}>
              "{item.notes}"
            </Text>
          ) : null}
        </View>

        {item.efficiencyKmPerL ? (
          <View style={styles.efficiencyBadge}>
            <Ionicons name="flash" size={11} color={COLORS.success} />
            <Text style={styles.efficiencyText}>
              {item.efficiencyKmPerL} km/L
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activeVehicleFuelLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="water-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Belum Ada Catatan Bensin</Text>
            <Text style={styles.emptySub}>
              Mulai catat pengisian bensin untuk memantau konsumsi KM/L dan biaya harian.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={onOpenAddFuel}
            >
              <Text style={styles.emptyAddButtonText}>Catat Bensin Pertama</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  headerArea: {
    paddingTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  statsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statsCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
  },
  fuelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  fuelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statCol: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  statValBig: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  statHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  footerItem: {
    flex: 1,
  },
  footerItemLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  footerItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  logCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  fuelIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  logSubDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
    marginVertical: 4,
  },
  middleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  middleItemText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  fullTankBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fullTankText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  logBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stationText: {
    fontSize: 11,
    color: COLORS.textMuted,
    maxWidth: 200,
  },
  logNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  efficiencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  efficiencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
  },
  emptyAddButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
