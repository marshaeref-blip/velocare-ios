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
        return COLORS.warning;
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
      {/* Cockpit Digital Speedometer Hero Card */}
      <View style={styles.heroCard}>
        {/* Top Header of Hero Card */}
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroBrandText}>{activeVehicle.brand.toUpperCase()}</Text>
            <Text style={styles.heroVehicleName}>{activeVehicle.name}</Text>
          </View>
          <View style={styles.plateBadge}>
            <Text style={styles.plateBadgeText}>{activeVehicle.plateNumber}</Text>
          </View>
        </View>

        {/* Digital Speedometer Center Display */}
        <View style={styles.speedoCluster}>
          <View style={styles.speedoRingOuter}>
            <View style={styles.speedoRingInner}>
              <Ionicons name="speedometer" size={20} color={COLORS.primary} />
              <Text style={styles.speedoOdometerNumber}>
                {activeVehicle.currentKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              </Text>
              <Text style={styles.speedoUnit}>KILOMETER</Text>
            </View>
          </View>

          {/* Quick update button */}
          <TouchableOpacity
            style={styles.quickUpdateButton}
            onPress={onOpenOdometer}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-sharp" size={13} color={COLORS.primary} />
            <Text style={styles.quickUpdateText}>Perbarui Odometer</Text>
          </TouchableOpacity>
        </View>

        {/* Specs Badges Row */}
        <View style={styles.specChipsRow}>
          <View style={styles.specChip}>
            <Ionicons
              name={activeVehicle.type === 'motor' ? 'bicycle' : 'car-sport'}
              size={12}
              color={COLORS.primary}
            />
            <Text style={styles.specChipText}>
              {activeVehicle.type === 'motor' ? 'Motor' : 'Mobil'}
            </Text>
          </View>

          <View style={styles.specChip}>
            <Ionicons name="color-palette-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.specChipText}>{activeVehicle.color}</Text>
          </View>

          <View style={styles.specChip}>
            <Ionicons name="flame" size={12} color={COLORS.warning} />
            <Text style={styles.specChipText}>
              {activeVehicle.fuelType.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Urgent Warning Banner if any maintenance is due */}
      {urgentItems.length > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => setSelectedStatusItem(urgentItems[0])}
          activeOpacity={0.85}
        >
          <View style={styles.alertIconCircle}>
            <Ionicons name="warning" size={18} color={COLORS.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>
              {urgentItems.length} Komponen Perlu Perhatian!
            </Text>
            <Text style={styles.alertDescription} numberOfLines={1}>
              {urgentItems[0].item.name}:{' '}
              {urgentItems[0].kmRemaining <= 0
                ? 'Jatuh tempo sekarang'
                : `Sisa ${urgentItems[0].kmRemaining} km lagi`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      {/* Sleek Minimalist Quick Actions (Replacing the 4 big colorful circles!) */}
      <View style={styles.quickActionBar}>
        <TouchableOpacity
          style={styles.actionPill}
          onPress={onOpenAddFuel}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconDot, { backgroundColor: '#EBF4FF' }]}>
            <Ionicons name="water" size={15} color={COLORS.primary} />
          </View>
          <Text style={styles.actionPillText}>Isi BBM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={onOpenAddService}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconDot, { backgroundColor: '#F6ECFA' }]}>
            <Ionicons name="construct" size={15} color={COLORS.purple} />
          </View>
          <Text style={styles.actionPillText}>Servis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={onOpenOdometer}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconDot, { backgroundColor: '#EAF8EE' }]}>
            <Ionicons name="speedometer" size={15} color={COLORS.success} />
          </View>
          <Text style={styles.actionPillText}>Catat KM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => onNavigateToTab('stats')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconDot, { backgroundColor: '#FFF5E6' }]}>
            <Ionicons name="bar-chart" size={15} color={COLORS.warning} />
          </View>
          <Text style={styles.actionPillText}>Analitik</Text>
        </TouchableOpacity>
      </View>

      {/* Maintenance & Component Health Status List (Compact Apple Card Style) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Status Servis & Komponen</Text>
        <Text style={styles.sectionSub}>Ketuk untuk detail / reset</Text>
      </View>

      <View style={styles.maintenanceList}>
        {activeVehicleMaintenanceStatuses.map((statusItem) => {
          const { item, kmRemaining, daysRemaining, percentUsed, status } = statusItem;
          const statusColor = getStatusColor(status);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.maintCard}
              onPress={() => setSelectedStatusItem(statusItem)}
              activeOpacity={0.7}
            >
              <View style={styles.maintCardTop}>
                <View style={styles.maintIconName}>
                  <View
                    style={[
                      styles.maintIconCircle,
                      { backgroundColor: `${statusColor}14` },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(item.category) as any}
                      size={17}
                      color={statusColor}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.maintItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.maintItemCategory}>
                      {item.category === 'tax'
                        ? 'Pajak STNK'
                        : `Interval: ${item.intervalKm > 0 ? formatKm(item.intervalKm) : `${item.intervalMonths} Bulan`}`}
                    </Text>
                  </View>
                </View>

                {/* Status Pill Badge */}
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        status === 'overdue'
                          ? COLORS.dangerMuted
                          : status === 'warning'
                          ? COLORS.warningMuted
                          : COLORS.successMuted,
                    },
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

              {/* Progress Track */}
              <View style={styles.progressBarTrack}>
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

              {/* Footer info */}
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
                        Jatuh tempo!
                      </Text>
                    ) : (
                      `Jatuh tempo: ${daysRemaining} hari lagi`
                    )
                  ) : (
                    `${daysRemaining} hari lagi`
                  )}
                </Text>

                <Text style={styles.maintLastServiced}>
                  Terakhir: {formatDateShort(item.lastReplacedDate)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Activity Snippets */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
      </View>

      <View style={styles.recentRow}>
        {/* Recent Fuel */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <View style={[styles.smallIconCircle, { backgroundColor: COLORS.primaryMuted }]}>
              <Ionicons name="water" size={13} color={COLORS.primary} />
            </View>
            <Text style={styles.recentTitle}>BBM Terakhir</Text>
          </View>
          {activeVehicleFuelLogs.length > 0 ? (
            <View style={{ marginTop: 4 }}>
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
            <Text style={styles.emptyText}>Belum ada catatan</Text>
          )}
        </View>

        {/* Recent Service */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <View style={[styles.smallIconCircle, { backgroundColor: COLORS.purpleMuted }]}>
              <Ionicons name="construct" size={13} color={COLORS.purple} />
            </View>
            <Text style={styles.recentTitle}>Servis Terakhir</Text>
          </View>
          {activeVehicleServiceLogs.length > 0 ? (
            <View style={{ marginTop: 4 }}>
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
            <Text style={styles.emptyText}>Belum ada catatan</Text>
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
    paddingTop: SPACING.xs,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  heroBrandText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  heroVehicleName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  plateBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  plateBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  speedoCluster: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  speedoRingOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    borderColor: '#EAF2FD',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFD',
  },
  speedoRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedoOdometerNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  speedoUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  quickUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    gap: 4,
    marginTop: SPACING.md,
  },
  quickUpdateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  specChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  specChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningMuted,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  alertDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quickActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  actionIconDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  maintenanceList: {
    gap: SPACING.sm + 2,
    marginBottom: SPACING.lg,
  },
  maintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.subtle,
  },
  maintCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  maintIconName: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  maintIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  maintItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  maintItemCategory: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  maintCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  maintFooterText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  maintLastServiced: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  recentRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  recentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.subtle,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  smallIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  recentValue: {
    fontSize: 15,
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
    marginTop: 1,
  },
  efficiencyBadge: {
    backgroundColor: COLORS.successMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  efficiencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});
