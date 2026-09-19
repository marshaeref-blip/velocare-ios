import React, { useState } from 'react';
import {
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
import { MaintenanceStatus } from '../types';
import { formatDateShort, formatKm, formatRupiah } from '../utils/formatters';
import { MaintenanceDetailModal } from '../components/MaintenanceDetailModal';

interface DashboardScreenProps {
  onOpenOdometer: () => void;
  onOpenAddFuel: () => void;
  onOpenAddService: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenOdometer,
  onOpenAddFuel,
  onOpenAddService,
  onNavigateToTab,
}) => {
  const {
    activeVehicle,
    activeVehicleMaintenanceStatuses,
    activeVehicleFuelLogs,
    activeVehicleServiceLogs,
  } = useVehicle();

  const [selectedStatusItem, setSelectedStatusItem] = useState<MaintenanceStatus | null>(null);

  if (!activeVehicle) return null;

  // Temukan item yang butuh perhatian (warning atau overdue)
  const urgentItems = activeVehicleMaintenanceStatuses.filter(
    (s) => s.status === 'overdue' || s.status === 'warning'
  );

  const getStatusColor = (status: 'good' | 'warning' | 'overdue') => {
    switch (status) {
      case 'overdue':
        return COLORS.danger;
      case 'warning':
        return COLORS.warningOrange;
      default:
        return COLORS.success;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'oil':
        return 'water-outline';
      case 'transmission':
        return 'cog-outline';
      case 'filter':
        return 'funnel-outline';
      case 'brakes':
        return 'disc-outline';
      case 'tax':
        return 'calendar-outline';
      default:
        return 'construct-outline';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Vehicle Card with iOS Glassmorphism styling */}
      <LinearGradient
        colors={COLORS.gradientHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroBrandText}>
              {activeVehicle.brand.toUpperCase()}
            </Text>
            <Text style={styles.heroVehicleName}>{activeVehicle.name}</Text>
          </View>
          <View style={styles.plateBadge}>
            <Text style={styles.plateBadgeText}>{activeVehicle.plateNumber}</Text>
          </View>
        </View>

        {/* Odometer Display */}
        <View style={styles.odometerDisplayContainer}>
          <View>
            <Text style={styles.odometerSubLabel}>TOTAL JARAK TEMPUH</Text>
            <Text style={styles.odometerBigNumber}>
              {formatKm(activeVehicle.currentKm)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.quickUpdateOdoButton}
            onPress={onOpenOdometer}
            activeOpacity={0.8}
          >
            <Ionicons name="speedometer-outline" size={16} color="#FFFFFF" />
            <Text style={styles.quickUpdateOdoText}>Update KM</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle spec chips */}
        <View style={styles.specChipsRow}>
          <View style={styles.specChip}>
            <Ionicons
              name={activeVehicle.type === 'motor' ? 'bicycle' : 'car-sport'}
              size={12}
              color={COLORS.primaryLight}
            />
            <Text style={styles.specChipText}>
              {activeVehicle.type === 'motor' ? 'Motor' : 'Mobil'}
            </Text>
          </View>
          <View style={styles.specChip}>
            <Ionicons name="color-palette-outline" size={12} color={COLORS.cyan} />
            <Text style={styles.specChipText}>{activeVehicle.color}</Text>
          </View>
          <View style={styles.specChip}>
            <Ionicons name="flame-outline" size={12} color={COLORS.warningOrange} />
            <Text style={styles.specChipText}>
              {activeVehicle.fuelType === 'pertamax'
                ? 'Pertamax'
                : activeVehicle.fuelType.toUpperCase()}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Urgent Warning Banner if any maintenance is due */}
      {urgentItems.length > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => setSelectedStatusItem(urgentItems[0])}
          activeOpacity={0.85}
        >
          <View style={styles.alertIconCircle}>
            <Ionicons name="alert-circle" size={20} color={COLORS.warningOrange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>
              {urgentItems.length} Komponen Perlu Diperhatikan!
            </Text>
            <Text style={styles.alertDescription} numberOfLines={1}>
              {urgentItems[0].item.name}:{' '}
              {urgentItems[0].kmRemaining <= 0
                ? 'Jatuh tempo sekarang'
                : `Sisa ${urgentItems[0].kmRemaining} km lagi`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Quick Action Shortcuts */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOpenAddFuel}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0A84FF', '#0055D4']}
            style={styles.actionIconCircle}
          >
            <Ionicons name="water" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.actionButtonLabel}>Isi Bensin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOpenAddService}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#BF5AF2', '#8F26C9']}
            style={styles.actionIconCircle}
          >
            <Ionicons name="construct" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.actionButtonLabel}>Catat Servis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOpenOdometer}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#30D158', '#1E8E3E']}
            style={styles.actionIconCircle}
          >
            <Ionicons name="speedometer" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.actionButtonLabel}>Update KM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onNavigateToTab('stats')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF9F0A', '#D47400']}
            style={styles.actionIconCircle}
          >
            <Ionicons name="pie-chart" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.actionButtonLabel}>Analitik</Text>
        </TouchableOpacity>
      </View>

      {/* Maintenance & Component Health Status List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Status Komponen & Servis</Text>
        <Text style={styles.sectionSub}>Ketuk untuk melihat detail atau reset</Text>
      </View>

      <View style={styles.maintenanceGrid}>
        {activeVehicleMaintenanceStatuses.map((statusItem) => {
          const { item, kmRemaining, daysRemaining, percentUsed, status } = statusItem;
          const statusColor = getStatusColor(status);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.maintCard}
              onPress={() => setSelectedStatusItem(statusItem)}
              activeOpacity={0.75}
            >
              <View style={styles.maintCardTop}>
                <View style={styles.maintCardIconName}>
                  <View
                    style={[
                      styles.maintIconWrapper,
                      { backgroundColor: `${statusColor}20` },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(item.category) as any}
                      size={18}
                      color={statusColor}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.maintItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.maintItemCategory}>
                      {item.category === 'tax'
                        ? 'Pajak Kendaraan'
                        : `Interval: ${item.intervalKm > 0 ? formatKm(item.intervalKm) : `${item.intervalMonths} Bulan`}`}
                    </Text>
                  </View>
                </View>

                {/* Status Indicator Pill */}
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}40` },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusPillText, { color: statusColor }]}>
                    {status === 'overdue'
                      ? 'Jatuh Tempo'
                      : status === 'warning'
                      ? 'Perlu Dicek'
                      : 'Aman'}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${percentUsed}%`,
                      backgroundColor: statusColor,
                    },
                  ]}
                />
              </View>

              {/* Card Footer with remaining info */}
              <View style={styles.maintCardFooter}>
                <Text style={styles.maintFooterText}>
                  {item.intervalKm > 0 ? (
                    kmRemaining <= 0 ? (
                      <Text style={{ color: COLORS.danger, fontWeight: '700' }}>
                        Lewat {Math.abs(kmRemaining)} km
                      </Text>
                    ) : (
                      `Sisa ${formatKm(kmRemaining)}`
                    )
                  ) : item.targetDate ? (
                    daysRemaining <= 0 ? (
                      <Text style={{ color: COLORS.danger, fontWeight: '700' }}>
                        Pajak jatuh tempo!
                      </Text>
                    ) : (
                      `Jatuh tempo: ${daysRemaining} hari lagi`
                    )
                  ) : (
                    `${daysRemaining} hari lagi`
                  )}
                </Text>

                <Text style={styles.maintLastServiced}>
                  Servis: {formatDateShort(item.lastReplacedDate)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Summary Cards: Recent Fuel and Recent Service */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Aktivitas Terkini</Text>
      </View>

      <View style={styles.recentRow}>
        {/* Recent Fuel */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Ionicons name="water-outline" size={16} color={COLORS.primary} />
            <Text style={styles.recentTitle}>BBM Terakhir</Text>
          </View>
          {activeVehicleFuelLogs.length > 0 ? (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.recentValue}>
                {formatRupiah(activeVehicleFuelLogs[0].totalPrice)}
              </Text>
              <Text style={styles.recentSub}>
                {activeVehicleFuelLogs[0].liters} L •{' '}
                {formatDateShort(activeVehicleFuelLogs[0].date)}
              </Text>
              {activeVehicleFuelLogs[0].efficiencyKmPerL ? (
                <View style={styles.efficiencyBadge}>
                  <Text style={styles.efficiencyBadgeText}>
                    ⚡ {activeVehicleFuelLogs[0].efficiencyKmPerL} km/L
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.emptyText}>Belum ada catatan BBM</Text>
          )}
        </View>

        {/* Recent Service */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Ionicons name="construct-outline" size={16} color={COLORS.purple} />
            <Text style={styles.recentTitle}>Servis Terakhir</Text>
          </View>
          {activeVehicleServiceLogs.length > 0 ? (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.recentValue}>
                {formatRupiah(activeVehicleServiceLogs[0].totalCost)}
              </Text>
              <Text style={styles.recentSub} numberOfLines={1}>
                {activeVehicleServiceLogs[0].workshopName}
              </Text>
              <Text style={styles.recentSubDate}>
                {formatDateShort(activeVehicleServiceLogs[0].date)}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Belum ada riwayat servis</Text>
          )}
        </View>
      </View>

      {/* Maintenance Detail Modal */}
      <MaintenanceDetailModal
        visible={!!selectedStatusItem}
        statusItem={selectedStatusItem}
        onClose={() => setSelectedStatusItem(null)}
      />
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
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: SPACING.lg,
    ...SHADOWS.glowPrimary,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  heroBrandText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1.5,
  },
  heroVehicleName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  plateBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  plateBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  odometerDisplayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  odometerSubLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  odometerBigNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  quickUpdateOdoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  quickUpdateOdoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  specChipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  specChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 10, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 10, 0.35)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 159, 10, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warningOrange,
  },
  alertDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionButton: {
    alignItems: 'center',
    width: '23%',
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    ...SHADOWS.subtle,
  },
  actionButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  maintenanceGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  maintCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.subtle,
  },
  maintCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  maintCardIconName: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  maintIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  maintItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  maintItemCategory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.cardBackgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  maintCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  maintLastServiced: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  recentRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  recentCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  recentValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  recentSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentSubDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  efficiencyBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  efficiencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});
