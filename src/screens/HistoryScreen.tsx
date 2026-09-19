import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import { ServiceCategory, ServiceLog } from '../types';
import { formatDateShort, formatKm, formatRupiah } from '../utils/formatters';

interface HistoryScreenProps {
  onOpenAddService: () => void;
}

const FILTER_TABS: { key: 'all' | ServiceCategory; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'routine', label: 'Rutin' },
  { key: 'repair', label: 'Perbaikan' },
  { key: 'modification', label: 'Modifikasi' },
  { key: 'wash_detail', label: 'Cuci/Detail' },
];

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onOpenAddService }) => {
  const { activeVehicle, activeVehicleServiceLogs, deleteServiceLog } = useVehicle();
  const [selectedFilter, setSelectedFilter] = useState<'all' | ServiceCategory>('all');

  if (!activeVehicle) return null;

  const filteredLogs = activeVehicleServiceLogs.filter((log) => {
    if (selectedFilter === 'all') return true;
    return log.category === selectedFilter;
  });

  const totalServiceCost = activeVehicleServiceLogs.reduce(
    (acc, curr) => acc + curr.totalCost,
    0
  );

  const handleDelete = (log: ServiceLog) => {
    Alert.alert(
      'Hapus Riwayat Servis',
      `Yakin ingin menghapus catatan bengkel ${log.workshopName} (${formatRupiah(
        log.totalCost
      )})?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteServiceLog(log.id),
        },
      ]
    );
  };

  const getCategoryBadge = (cat: ServiceCategory) => {
    switch (cat) {
      case 'routine':
        return { label: 'Rutin', color: COLORS.primary, bg: COLORS.primaryMuted };
      case 'repair':
        return { label: 'Perbaikan', color: COLORS.warningOrange, bg: COLORS.warningMuted };
      case 'modification':
        return { label: 'Modifikasi', color: COLORS.purple, bg: COLORS.purpleMuted };
      default:
        return { label: 'Cuci/Detail', color: COLORS.cyan, bg: COLORS.cyanMuted };
    }
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Total Service Cost Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>TOTAL PENGELUARAN BENGKEL</Text>
          <Text style={styles.summaryTotal}>{formatRupiah(totalServiceCost)}</Text>
          <Text style={styles.summarySub}>
            {activeVehicleServiceLogs.length} kali catatan servis terdaftar
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onOpenAddService}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => {
          const isSelected = selectedFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ServiceLog }) => {
    const badge = getCategoryBadge(item.category);

    return (
      <View style={styles.logCard}>
        <View style={styles.logCardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.workshopName}>{item.workshopName}</Text>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>
                  {badge.label}
                </Text>
              </View>
            </View>
            <Text style={styles.logDateOdo}>
              {formatDateShort(item.date)} • Odometer {formatKm(item.odometer)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Replaced items list */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsHeader}>Pengerjaan / Suku Cadang:</Text>
          <View style={styles.tagWrap}>
            {item.itemsReplaced.map((part, idx) => (
              <View key={idx} style={styles.partTag}>
                <Ionicons name="checkmark" size={12} color={COLORS.success} />
                <Text style={styles.partTagText}>{part}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Notes if any */}
        {item.notes ? (
          <Text style={styles.logNotes}>Catatan: "{item.notes}"</Text>
        ) : null}

        {/* Card Footer with Cost */}
        <View style={styles.cardFooter}>
          <Text style={styles.costLabel}>Biaya Servis:</Text>
          <Text style={styles.costValue}>
            {item.totalCost > 0 ? formatRupiah(item.totalCost) : 'Gratis / Garansi'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Belum Ada Riwayat Servis</Text>
            <Text style={styles.emptySub}>
              Catat servis berkala dan penggantian suku cadang agar buku riwayat kendaraan tersusun rapi.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={onOpenAddService}
            >
              <Text style={styles.emptyAddButtonText}>Catat Servis Pertama</Text>
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },
  summaryTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  summarySub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.cardBackgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  workshopName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logDateOdo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  itemsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  itemsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  partTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  partTagText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  logNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: COLORS.divider,
    paddingTop: SPACING.sm,
    marginTop: 4,
  },
  costLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryLight,
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
