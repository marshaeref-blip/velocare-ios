import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useVehicle } from '../context/VehicleContext';
import { FuelType } from '../types';
import { formatRupiah, getFuelTypeName } from '../utils/formatters';

interface AddFuelModalProps {
  visible: boolean;
  onClose: () => void;
}

const FUEL_OPTIONS: { type: FuelType; label: string; defaultPrice: number }[] = [
  { type: 'pertamax', label: 'Pertamax (RON 92)', defaultPrice: 12950 },
  { type: 'pertalite', label: 'Pertalite (RON 90)', defaultPrice: 10000 },
  { type: 'pertamax_turbo', label: 'Pertamax Turbo (RON 98)', defaultPrice: 14400 },
  { type: 'shell_super', label: 'Shell Super (RON 92)', defaultPrice: 13250 },
  { type: 'shell_vpower', label: 'Shell V-Power (RON 95)', defaultPrice: 14280 },
  { type: 'dexlite', label: 'Dexlite (CN 51)', defaultPrice: 13700 },
  { type: 'pertamina_dex', label: 'Pertamina Dex (CN 53)', defaultPrice: 14650 },
];

export const AddFuelModal: React.FC<AddFuelModalProps> = ({ visible, onClose }) => {
  const { activeVehicle, addFuelLog } = useVehicle();

  const [odometer, setOdometer] = useState('');
  const [liters, setLiters] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [selectedFuel, setSelectedFuel] = useState<FuelType>('pertamax');
  const [gasStation, setGasStation] = useState('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (activeVehicle) {
      setOdometer(activeVehicle.currentKm.toString());
      setSelectedFuel(activeVehicle.fuelType);
      setLiters('');
      setTotalPrice('');
      setGasStation('');
      setIsFullTank(true);
      setNotes('');
      setErrorMsg('');
    }
  }, [activeVehicle, visible]);

  if (!activeVehicle) return null;

  // Auto-calculate total price when liters changes based on default fuel price
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const parsedLiters = parseFloat(val.replace(',', '.'));
    if (!isNaN(parsedLiters) && parsedLiters > 0) {
      const fuelPreset = FUEL_OPTIONS.find((f) => f.type === selectedFuel);
      const unitPrice = fuelPreset ? fuelPreset.defaultPrice : 12950;
      const total = Math.round(parsedLiters * unitPrice);
      setTotalPrice(total.toString());
    }
  };

  const handleSubmit = async () => {
    const odoNum = parseInt(odometer.replace(/\D/g, ''), 10);
    const litNum = parseFloat(liters.replace(',', '.'));
    const totalNum = parseInt(totalPrice.replace(/\D/g, ''), 10);

    if (isNaN(odoNum) || odoNum <= 0) {
      setErrorMsg('Masukkan angka odometer yang valid');
      return;
    }
    if (isNaN(litNum) || litNum <= 0) {
      setErrorMsg('Masukkan jumlah liter bensin');
      return;
    }
    if (isNaN(totalNum) || totalNum <= 0) {
      setErrorMsg('Masukkan total biaya pengisian');
      return;
    }

    const pricePerLiter = Math.round(totalNum / litNum);

    await addFuelLog({
      vehicleId: activeVehicle.id,
      date: new Date().toISOString(),
      odometer: odoNum,
      liters: litNum,
      totalPrice: totalNum,
      pricePerLiter,
      fuelType: selectedFuel,
      gasStationName: gasStation.trim() || undefined,
      isFullTank,
      notes: notes.trim() || undefined,
    });

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
                  <Text style={styles.title}>Catat Isi Bensin</Text>
                  <Text style={styles.subtitle}>
                    {activeVehicle.name} • {activeVehicle.plateNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                {/* Odometer & Liters in 2 columns */}
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Odometer (KM)</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={odometer}
                        onChangeText={setOdometer}
                        keyboardType="numeric"
                        placeholder="Contoh: 14250"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Jumlah Liter</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={liters}
                        onChangeText={handleLitersChange}
                        keyboardType="decimal-pad"
                        placeholder="Contoh: 4.5"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                </View>

                {/* Total Price */}
                <Text style={styles.fieldLabel}>Total Biaya (Rp)</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.prefixText}>Rp</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={totalPrice}
                    onChangeText={(val) => setTotalPrice(val.replace(/\D/g, ''))}
                    keyboardType="numeric"
                    placeholder="Contoh: 55000"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {/* Jenis BBM Selector */}
                <Text style={styles.fieldLabel}>Jenis Bahan Bakar</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.fuelPillsRow}
                >
                  {FUEL_OPTIONS.map((f) => {
                    const isSelected = selectedFuel === f.type;
                    return (
                      <TouchableOpacity
                        key={f.type}
                        style={[
                          styles.fuelPill,
                          isSelected && styles.fuelPillSelected,
                        ]}
                        onPress={() => setSelectedFuel(f.type)}
                      >
                        <Text
                          style={[
                            styles.fuelPillText,
                            isSelected && styles.fuelPillTextSelected,
                          ]}
                        >
                          {f.label.split(' ')[0]}
                        </Text>
                        <Text style={styles.fuelPillSub}>
                          {formatRupiah(f.defaultPrice)}/L
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Full Tank Toggle */}
                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.toggleTitle}>Isi Full Tank</Text>
                    <Text style={styles.toggleSub}>
                      Diperlukan untuk kalkulasi efisiensi KM/Liter yang akurat
                    </Text>
                  </View>
                  <Switch
                    value={isFullTank}
                    onValueChange={setIsFullTank}
                    trackColor={{ false: COLORS.inputBackground, true: COLORS.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* SPBU Name */}
                <Text style={styles.fieldLabel}>Lokasi / Nama SPBU (Opsional)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={gasStation}
                    onChangeText={setGasStation}
                    placeholder="Contoh: SPBU Pertamina Kuningan"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {/* Notes */}
                <Text style={styles.fieldLabel}>Catatan (Opsional)</Text>
                <View style={[styles.inputContainer, { height: 70, alignItems: 'flex-start' }]}>
                  <TextInput
                    style={[styles.input, { flex: 1, textAlignVertical: 'top' }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Contoh: Perjalanan luar kota, tarikan enteng"
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                >
                  <Ionicons name="water" size={18} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Simpan Pengisian BBM</Text>
                </TouchableOpacity>
              </ScrollView>
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
    maxHeight: '90%',
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
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 8,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
    padding: 0,
  },
  fuelPillsRow: {
    gap: SPACING.sm,
    paddingVertical: 4,
    marginBottom: SPACING.sm,
  },
  fuelPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fuelPillSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  fuelPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  fuelPillTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  fuelPillSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginVertical: SPACING.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    maxWidth: 240,
    marginTop: 2,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xl,
    ...SHADOWS.glowPrimary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
