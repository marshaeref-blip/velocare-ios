import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import { MaintenanceStatus } from '../types';
import { formatDateShort, formatKm, formatRupiah } from '../utils/formatters';

interface MaintenanceDetailModalProps {
  statusItem: MaintenanceStatus | null;
  visible: boolean;
  onClose: () => void;
}

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  statusItem,
  visible,
  onClose,
}) => {
  const { activeVehicle, quickServiceItem } = useVehicle();
  const [costInput, setCostInput] = useState('');
  const [workshopInput, setWorkshopInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!statusItem || !activeVehicle) return null;

  const { item, kmRemaining, daysRemaining, percentUsed, status } = statusItem;

  const handleMarkAsServiced = async () => {
    setIsSubmitting(true);
    try {
      const cost = parseInt(costInput.replace(/\D/g, ''), 10) || 0;
      const workshop = workshopInput.trim() || 'Servis Mandiri / Bengkel';
      await quickServiceItem(activeVehicle.id, item.id, cost, workshop);
      setCostInput('');
      setWorkshopInput('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'overdue':
        return {
          label: 'Sudah Jatuh Tempo (Overdue)',
          color: COLORS.danger,
          bg: COLORS.dangerMuted,
          icon: 'alert-circle' as const,
        };
      case 'warning':
        return {
          label: 'Perlu Perhatian Segera',
          color: COLORS.warningOrange,
          bg: COLORS.warningMuted,
          icon: 'warning' as const,
        };
      default:
        return {
          label: 'Kondisi Baik & Aman',
          color: COLORS.success,
          bg: COLORS.successMuted,
          icon: 'checkmark-circle' as const,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheet}
            >
              <View style={styles.dragIndicator} />

              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.subtitle}>
                    {activeVehicle.name} • {activeVehicle.plateNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Status Alert Badge */}
              <View style={[styles.badgeContainer, { backgroundColor: badge.bg }]}>
                <Ionicons name={badge.icon} size={20} color={badge.color} />
                <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>

              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                {item.intervalKm > 0 && (
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>SISA KILOMETER</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        kmRemaining <= 0 ? { color: COLORS.danger } : { color: COLORS.textPrimary },
                      ]}
                    >
                      {kmRemaining <= 0
                        ? `Terlewat ${Math.abs(kmRemaining)} km`
                        : formatKm(kmRemaining)}
                    </Text>
                    <Text style={styles.metricSub}>
                      Interval: {formatKm(item.intervalKm)}
                    </Text>
                  </View>
                )}

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>SISA WAKTU</Text>
                  <Text
                    style={[
                      styles.metricValue,
                      daysRemaining <= 0 ? { color: COLORS.danger } : { color: COLORS.textPrimary },
                    ]}
                  >
                    {daysRemaining <= 0
                      ? `Terlewat ${Math.abs(daysRemaining)} hari`
                      : `${daysRemaining} hari lagi`}
                  </Text>
                  <Text style={styles.metricSub}>
                    {item.targetDate ? `Jatuh Tempo: ${formatDateShort(item.targetDate)}` : `Per ${item.intervalMonths} Bulan`}
                  </Text>
                </View>
              </View>

              {/* Last service details */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Terakhir Diganti / Servis:</Text>
                  <Text style={styles.infoValue}>
                    {item.lastReplacedKm > 0 ? formatKm(item.lastReplacedKm) : '-'} •{' '}
                    {formatDateShort(item.lastReplacedDate)}
                  </Text>
                </View>
                {item.notes ? (
                  <View style={[styles.infoRow, { marginTop: 8 }]}>
                    <Text style={styles.infoLabel}>Catatan Suku Cadang:</Text>
                    <Text style={[styles.infoValue, { fontStyle: 'italic', color: COLORS.textLight }]}>
                      {item.notes}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Quick Update Section */}
              <View style={styles.actionSection}>
                <Text style={styles.actionSectionTitle}>
                  Sudah mengganti atau servis komponen ini?
                </Text>

                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.smallInput, { flex: 1 }]}
                    placeholder="Nama Bengkel (opsional)"
                    placeholderTextColor={COLORS.textMuted}
                    value={workshopInput}
                    onChangeText={setWorkshopInput}
                  />
                  <TextInput
                    style={[styles.smallInput, { width: 140 }]}
                    placeholder="Biaya (Rp)"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={costInput}
                    onChangeText={(val) => setCostInput(val.replace(/\D/g, ''))}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.markDoneButton,
                    isSubmitting && { opacity: 0.6 },
                  ]}
                  onPress={handleMarkAsServiced}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                  <Text style={styles.markDoneText}>
                    {isSubmitting
                      ? 'Menyimpan...'
                      : 'Tandai Sudah Diservis Hari Ini'}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.glowPrimary,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 8,
    marginBottom: SPACING.md,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackgroundSecondary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  metricSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'column',
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
  },
  actionSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  smallInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  markDoneButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.glowSuccess,
  },
  markDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
