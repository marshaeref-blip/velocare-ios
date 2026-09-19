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

        {/* Luxury Automotive Digital Instrument Cluster */}
        <View style={styles.instrumentClusterCard}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.tftScreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Cluster Top Status Bar */}
            <View style={styles.clusterStatusBar}>
              <View style={styles.clusterStatusItem}>
                <View style={styles.statusLiveDot} />
                <Text style={styles.clusterStatusText}>SYSTEM READY</Text>
              </View>
              <View style={styles.clusterStatusItem}>
                <Ionicons name="flash" size={11} color="#38BDF8" />
                <Text style={styles.clusterStatusText}>12.6V</Text>
              </View>
              <View style={styles.clusterStatusItem}>
                <Ionicons name="shield-checkmark" size={11} color="#34C759" />
                <Text style={styles.clusterStatusText}>HEALTH 100%</Text>
              </View>
            </View>

            {/* Gauge Dial & Main Odometer Display */}
            <View style={styles.clusterMainSection}>
              {/* Left Gauge Power Bar */}
              <View style={styles.gaugeSideColumn}>
                <Text style={styles.gaugeSideLabel}>PWR</Text>
                <View style={styles.gaugeBarTrack}>
                  <View style={[styles.gaugeBarFill, { height: '65%', backgroundColor: '#38BDF8' }]} />
                </View>
                <Text style={styles.gaugeSideSub}>ECO</Text>
              </View>

              {/* Center Digital Odometer Display */}
              <View style={styles.odometerCenterBox}>
                <Text style={styles.odometerMicroLabel}>TOTAL ODOMETER</Text>

                {/* Rolling Digit Barrel Row */}
                <View style={styles.digitBarrelRow}>
                  {activeVehicle.currentKm
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                    .split('')
                    .map((char, idx) => (
                      <View
                        key={idx}
                        style={char === '.' ? styles.digitDotBarrel : styles.digitBarrel}
                      >
                        <Text
                          style={char === '.' ? styles.digitDotText : styles.digitBarrelText}
                        >
                          {char}
                        </Text>
                        {char !== '.' && <View style={styles.digitGlossHighlight} />}
                      </View>
                    ))}
                  <View style={styles.kmUnitBox}>
                    <Text style={styles.kmUnitText}>KM</Text>
                  </View>
                </View>

                {/* Sub-Trip & Telemetry */}
                <View style={styles.tripRow}>
                  <Text style={styles.tripText}>
                    TRIP A: <Text style={styles.tripHighlight}>{formatKm(activeVehicle.currentKm % 1000)}</Text>
                  </Text>
                  <Text style={styles.tripDot}>•</Text>
                  <Text style={styles.tripText}>
                    KONDISI: <Text style={styles.tripHighlightGood}>PRIMA</Text>
                  </Text>
                </View>
              </View>

              {/* Right Gauge Fuel Bar */}
              <View style={styles.gaugeSideColumn}>
                <Text style={styles.gaugeSideLabel}>FUEL</Text>
                <View style={styles.gaugeBarTrack}>
                  <View style={[styles.gaugeBarFill, { height: '80%', backgroundColor: '#34C759' }]} />
                </View>
                <Text style={styles.gaugeSideSub}>
                  {activeVehicle.fuelType === 'listrik' ? 'EV' : 'FULL'}
                </Text>
              </View>
            </View>

            {/* Quick Calibrate / Update Odometer Button */}
            <TouchableOpacity
              style={styles.cockpitUpdateButton}
              onPress={onOpenOdometer}
              activeOpacity={0.8}
            >
              <Ionicons name="speedometer" size={13} color="#38BDF8" />
              <Text style={styles.cockpitUpdateText}>Perbarui Odometer</Text>
              <Ionicons name="chevron-forward" size={12} color="#38BDF8" />
            </TouchableOpacity>
          </LinearGradient>
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
  instrumentClusterCard: {
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#334155',
    ...SHADOWS.subtle,
  },
  tftScreen: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  clusterStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.sm,
  },
  clusterStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  clusterStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  clusterMainSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  gaugeSideColumn: {
    alignItems: 'center',
    width: 38,
  },
  gaugeSideLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  gaugeBarTrack: {
    width: 10,
    height: 48,
    backgroundColor: '#090D16',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  gaugeBarFill: {
    width: '100%',
    borderRadius: 3,
  },
  gaugeSideSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 4,
  },
  odometerCenterBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  odometerMicroLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  digitBarrelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090D16',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    gap: 3,
  },
  digitBarrel: {
    width: 28,
    height: 38,
    backgroundColor: '#131D31',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#293548',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  digitBarrelText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0,
  },
  digitDotBarrel: {
    width: 10,
    height: 38,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  digitDotText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#38BDF8',
  },
  digitGlossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  kmUnitBox: {
    paddingLeft: 4,
  },
  kmUnitText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  tripText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  tripHighlight: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  tripHighlightGood: {
    color: '#34C759',
    fontWeight: '800',
  },
  tripDot: {
    color: '#475569',
    fontSize: 10,
  },
  cockpitUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: RADIUS.pill,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 6,
    marginTop: SPACING.md,
    alignSelf: 'center',
  },
  cockpitUpdateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
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
