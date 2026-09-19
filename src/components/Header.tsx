import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import { formatKm } from '../utils/formatters';

interface HeaderProps {
  onOpenOdometerModal: () => void;
  onOpenAddVehicleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenOdometerModal,
  onOpenAddVehicleModal,
}) => {
  const { vehicles, activeVehicle, activeVehicleId, setActiveVehicleId } = useVehicle();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!activeVehicle) return null;

  return (
    <View style={styles.container}>
      {/* Vehicle Switcher Pill */}
      <TouchableOpacity
        style={styles.vehiclePill}
        onPress={() => setIsDropdownOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name={activeVehicle.type === 'motor' ? 'bicycle' : 'car-sport'}
            size={18}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.vehicleInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {activeVehicle.name}
            </Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.plateNumber}>{activeVehicle.plateNumber}</Text>
        </View>
      </TouchableOpacity>

      {/* Odometer Quick Action Button */}
      <TouchableOpacity
        style={styles.odometerBadge}
        onPress={onOpenOdometerModal}
        activeOpacity={0.75}
      >
        <Ionicons name="speedometer-outline" size={15} color={COLORS.cyan} />
        <View style={styles.odometerTextContainer}>
          <Text style={styles.odometerLabel}>ODOMETER</Text>
          <Text style={styles.odometerValue}>{formatKm(activeVehicle.currentKm)}</Text>
        </View>
        <View style={styles.editIconBadge}>
          <Ionicons name="pencil" size={10} color={COLORS.textPrimary} />
        </View>
      </TouchableOpacity>

      {/* Switcher Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownCard}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>Pilih Kendaraan</Text>
                  <TouchableOpacity
                    onPress={() => setIsDropdownOpen(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {vehicles.map((v) => {
                  const isSelected = v.id === activeVehicleId;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.vehicleOption,
                        isSelected && styles.vehicleOptionSelected,
                      ]}
                      onPress={() => {
                        setActiveVehicleId(v.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <View
                        style={[
                          styles.optionIconCircle,
                          isSelected && { backgroundColor: COLORS.primaryMuted },
                        ]}
                      >
                        <Ionicons
                          name={v.type === 'motor' ? 'bicycle' : 'car-sport'}
                          size={20}
                          color={isSelected ? COLORS.primary : COLORS.textSecondary}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.optionName,
                            isSelected && { color: COLORS.primary, fontWeight: '700' },
                          ]}
                        >
                          {v.name}
                        </Text>
                        <Text style={styles.optionSub}>
                          {v.plateNumber} • {formatKm(v.currentKm)}
                        </Text>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.addVehicleButton}
                  onPress={() => {
                    setIsDropdownOpen(false);
                    onOpenAddVehicleModal();
                  }}
                >
                  <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.addVehicleText}>Tambah Kendaraan Baru</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    maxWidth: '55%',
    ...SHADOWS.subtle,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  vehicleInfo: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: 110,
  },
  plateNumber: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  odometerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(100, 210, 255, 0.25)',
    gap: 6,
    ...SHADOWS.subtle,
  },
  odometerTextContainer: {
    alignItems: 'flex-start',
  },
  odometerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.cyan,
    letterSpacing: 0.5,
  },
  odometerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editIconBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: SPACING.lg,
  },
  dropdownCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.glowPrimary,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    gap: SPACING.md,
  },
  vehicleOptionSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBackgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  optionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
    backgroundColor: 'rgba(10, 132, 255, 0.05)',
    gap: 6,
  },
  addVehicleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
