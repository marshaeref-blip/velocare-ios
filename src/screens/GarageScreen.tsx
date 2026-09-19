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
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import { Vehicle } from '../types';
import { formatKm, getFuelTypeName } from '../utils/formatters';

interface GarageScreenProps {
  onOpenAddVehicle: () => void;
  onSelectVehicle: (id: string) => void;
}

export const GarageScreen: React.FC<GarageScreenProps> = ({
  onOpenAddVehicle,
  onSelectVehicle,
}) => {
  const { vehicles, activeVehicleId, setActiveVehicleId, deleteVehicle } = useVehicle();

  const handleDelete = (v: Vehicle) => {
    if (vehicles.length <= 1) {
      Alert.alert('Perhatian', 'Harus ada minimal satu kendaraan di garasi.');
      return;
    }

    Alert.alert(
      'Hapus Kendaraan',
      `Yakin ingin menghapus ${v.name} (${v.plateNumber}) dari garasi Anda? Seluruh riwayatnya juga akan dihapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteVehicle(v.id),
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.title}>Garasi Saya</Text>
          <Text style={styles.subtitle}>
            Kelola seluruh motor dan mobil Anda di satu tempat
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onOpenAddVehicle}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Vehicle }) => {
    const isActive = item.id === activeVehicleId;

    return (
      <TouchableOpacity
        style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
        onPress={() => {
          setActiveVehicleId(item.id);
          onSelectVehicle(item.id);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.vehicleInfoLeft}>
            <View
              style={[
                styles.iconCircle,
                isActive && { backgroundColor: COLORS.primaryMuted },
              ]}
            >
              <Ionicons
                name={item.type === 'motor' ? 'bicycle' : 'car-sport'}
                size={22}
                color={isActive ? COLORS.primary : COLORS.textSecondary}
              />
            </View>

            <View>
              <View style={styles.nameRow}>
                <Text style={styles.vehicleName}>{item.name}</Text>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Aktif</Text>
                  </View>
                )}
              </View>
              <Text style={styles.plateText}>{item.plateNumber}</Text>
            </View>
          </View>

          {vehicles.length > 1 && (
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Specs Grid */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>ODOMETER</Text>
            <Text style={styles.specValue}>{formatKm(item.currentKm)}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>BAHAN BAKAR</Text>
            <Text style={styles.specValue}>
              {getFuelTypeName(item.fuelType).split(' ')[0]}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>KOMPONEN</Text>
            <Text style={styles.specValue}>
              {item.maintenanceItems?.length || 0} Terpantau
            </Text>
          </View>
        </View>

        {/* Action footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.selectPrompt}>
            {isActive
              ? '✓ Kendaraan saat ini ditampilkan di Dashboard'
              : 'Ketuk untuk membuka dashboard kendaraan ini →'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    marginBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
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
    ...SHADOWS.glowPrimary,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  vehicleCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  vehicleInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  plateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  specItem: {
    alignItems: 'flex-start',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  selectPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
