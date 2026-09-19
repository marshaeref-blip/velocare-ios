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

  const handleIncrement = (amount: number) => {
    const current = parseInt(kmValue || '0', 10);
    const updated = Math.max(activeVehicle.currentKm, current + amount);
    setKmValue(updated.toString());
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
                <View>
                  <Text style={styles.title}>Update Odometer (KM)</Text>
                  <Text style={styles.subtitle}>
                    {activeVehicle.name} • {activeVehicle.plateNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputCard}>
                <Ionicons name="speedometer" size={28} color={COLORS.primary} />
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
                  autoFocus
                  selectTextOnFocus
                />
                <Text style={styles.unitText}>KM</Text>
              </View>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              {/* Quick Increment Buttons */}
              <Text style={styles.quickLabel}>Tambah Cepat Jarak Tempuh:</Text>
              <View style={styles.quickButtonRow}>
                {[10, 25, 50, 100].map((inc) => (
                  <TouchableOpacity
                    key={inc}
                    style={styles.quickButton}
                    onPress={() => handleIncrement(inc)}
                  >
                    <Text style={styles.quickButtonText}>+{inc} km</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />
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
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  quickButtonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.glowPrimary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
