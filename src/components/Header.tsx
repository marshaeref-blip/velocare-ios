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
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name={activeVehicle.type === 'motor' ? 'bicycle' : 'car-sport'}
            size={16}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.vehicleInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {activeVehicle.name}
            </Text>
            <Ionicons name="chevron-down" size={13} color={COLORS.textSecondary} />
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
        <Ionicons name="speedometer-outline" size={16} color={COLORS.primary} />
        <View style={styles.odometerTextContainer}>
          <Text style={styles.odometerLabel}>ODOMETER</Text>
          <Text style={styles.odometerValue}>{formatKm(activeVehicle.currentKm)}</Text>
        </View>
        <Ionicons name="pencil" size={11} color={COLORS.textMuted} />
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
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.background,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    maxWidth: '58%',
    ...SHADOWS.subtle,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: 110,
  },
  plateNumber: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  odometerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 6,
    ...SHADOWS.subtle,
  },
  odometerTextContainer: {
    alignItems: 'flex-start',
  },
  odometerLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  odometerValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: SPACING.lg,
  },
  dropdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
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
    fontWeight: '800',
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
    backgroundColor: COLORS.primaryMuted,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: COLORS.primaryMuted,
    gap: 6,
  },
  addVehicleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
