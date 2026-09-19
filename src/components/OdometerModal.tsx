import React, { useEffect, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import { formatKm } from '../utils/formatters';

interface OdometerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OdometerModal: React.FC<OdometerModalProps> = ({ visible, onClose }) => {
  const { activeVehicle, updateOdometer } = useVehicle();
  const [kmValue, setKmValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (activeVehicle) {
      setKmValue(activeVehicle.currentKm.toString());
      setErrorMsg('');
    }
  }, [activeVehicle, visible]);

  if (!activeVehicle) return null;

  const currentParsed = parseInt(kmValue.replace(/\D/g, '') || '0', 10);
  const diffKm = currentParsed - activeVehicle.currentKm;

  const handleIncrement = (amount: number) => {
    const nextVal = Math.max(activeVehicle.currentKm, currentParsed + amount);
    setKmValue(nextVal.toString());
    setErrorMsg('');
  };

  const handleSave = async () => {
    const parsed = parseInt(kmValue.replace(/\D/g, ''), 10);
    if (isNaN(parsed) || parsed < 0) {
      setErrorMsg('Masukkan angka kilometer yang valid');
      return;
    }

    if (parsed < activeVehicle.currentKm) {
      setErrorMsg(
        `Kilometer baru tidak boleh lebih kecil dari KM saat ini (${formatKm(
          activeVehicle.currentKm
        )})`
      );
      return;
    }

    await updateOdometer(activeVehicle.id, parsed);
    onClose();
  };

  // Formatted digits for preview barrels
  const formattedDigits = (currentParsed || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    .split('');

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

              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Update Jarak Tempuh (Odometer)</Text>
                  <Text style={styles.subtitle}>
                    {activeVehicle.name} • {activeVehicle.plateNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Luxury Digital Calibrator Preview */}
              <View style={styles.calibratorCard}>
                <LinearGradient
                  colors={['#0F172A', '#1E293B']}
                  style={styles.calibratorGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Top Comparator Bar */}
                  <View style={styles.comparatorRow}>
                    <View>
                      <Text style={styles.compLabel}>KM SAAT INI</Text>
                      <Text style={styles.compValueOld}>{formatKm(activeVehicle.currentKm)}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#38BDF8" />
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.compLabel}>KM BARU</Text>
                      <Text style={styles.compValueNew}>{formatKm(currentParsed)}</Text>
                    </View>
                  </View>

                  {/* Digital Barrel Rolling Numbers */}
                  <View style={styles.barrelsWrap}>
                    {formattedDigits.map((char, idx) => (
                      <View
                        key={idx}
                        style={char === '.' ? styles.dotBarrel : styles.numBarrel}
                      >
                        <Text
                          style={char === '.' ? styles.dotBarrelText : styles.numBarrelText}
                        >
                          {char}
                        </Text>
                        {char !== '.' && <View style={styles.barrelGloss} />}
                      </View>
                    ))}
                    <Text style={styles.barrelUnit}>KM</Text>
                  </View>

                  {/* Diff Badge */}
                  <View style={styles.diffBadgeRow}>
                    <View
                      style={[
                        styles.diffBadge,
                        diffKm > 0
                          ? styles.diffBadgePositive
                          : diffKm < 0
                          ? styles.diffBadgeNegative
                          : styles.diffBadgeNeutral,
                      ]}
                    >
                      <Ionicons
                        name={
                          diffKm > 0
                            ? 'trending-up'
                            : diffKm < 0
                            ? 'alert-circle'
                            : 'checkmark-circle'
                        }
                        size={13}
                        color={
                          diffKm > 0
                            ? '#34C759'
                            : diffKm < 0
                            ? COLORS.danger
                            : '#38BDF8'
                        }
                      />
                      <Text
                        style={[
                          styles.diffBadgeText,
                          diffKm > 0
                            ? { color: '#34C759' }
                            : diffKm < 0
                            ? { color: COLORS.danger }
                            : { color: '#38BDF8' },
                        ]}
                      >
                        {diffKm > 0
                          ? `+${diffKm} KM bertambah`
                          : diffKm < 0
                          ? `${diffKm} KM (lebih kecil)`
                          : 'Tidak ada perubahan'}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Direct Input Field */}
              <Text style={styles.inputSectionLabel}>Masukkan Angka Kilometer Tepat:</Text>
              <View style={styles.inputCard}>
                <Ionicons name="speedometer-outline" size={24} color={COLORS.primary} />
                <TextInput
                  style={styles.textInput}
                  value={kmValue}
                  onChangeText={(val) => {
                    setKmValue(val.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  selectTextOnFocus
                />
                <Text style={styles.unitText}>KM</Text>
              </View>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              {/* Quick Increment Chips */}
              <Text style={styles.quickLabel}>Tambah Cepat Jarak Tempuh:</Text>
              <View style={styles.quickGrid}>
                {[
                  { label: '+5 km', val: 5, desc: 'Keliling' },
                  { label: '+10 km', val: 10, desc: 'Harian' },
                  { label: '+25 km', val: 25, desc: 'Kota' },
                  { label: '+50 km', val: 50, desc: 'Luar Kota' },
                  { label: '+100 km', val: 100, desc: 'Touring' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.val}
                    style={styles.quickChip}
                    onPress={() => handleIncrement(item.val)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickChipVal}>{item.label}</Text>
                    <Text style={styles.quickChipDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Action Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Simpan Odometer Baru</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: 40,
    ...SHADOWS.card,
  },
  dragIndicator: {
    width: 36,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: RADIUS.pill,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  calibratorCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#334155',
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  calibratorGradient: {
    padding: SPACING.md,
  },
  comparatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.sm,
  },
  compLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  compValueOld: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  compValueNew: {
    fontSize: 14,
    fontWeight: '900',
    color: '#38BDF8',
    marginTop: 2,
  },
  barrelsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090D16',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 3,
  },
  numBarrel: {
    width: 26,
    height: 36,
    backgroundColor: '#131D31',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#293548',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  numBarrelText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  dotBarrel: {
    width: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  dotBarrelText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#38BDF8',
  },
  barrelGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  barrelUnit: {
    fontSize: 11,
    fontWeight: '900',
    color: '#38BDF8',
    marginLeft: 6,
  },
  diffBadgeRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 5,
  },
  diffBadgePositive: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  diffBadgeNegative: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  diffBadgeNeutral: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: 6,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickChipVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  quickChipDesc: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.glowPrimary,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
