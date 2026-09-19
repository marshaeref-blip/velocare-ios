import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
import { FuelType, MaintenanceItem, VehicleType } from '../types';

interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ visible, onClose }) => {
  const { addVehicle } = useVehicle();

  const [type, setType] = useState<VehicleType>('motor');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [currentKm, setCurrentKm] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('pertamax');
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setType('motor');
    setName('');
    setBrand('');
    setModel('');
    setPlateNumber('');
    setCurrentKm('');
    setColor('');
    setFuelType('pertamax');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Masukkan nama panggilan kendaraan (contoh: Vario Hitam / Innova)');
      return;
    }
    if (!plateNumber.trim()) {
      setErrorMsg('Masukkan nomor polisi / plat kendaraan');
      return;
    }
    const odo = parseInt(currentKm.replace(/\D/g, ''), 10);
    if (isNaN(odo) || odo < 0) {
      setErrorMsg('Masukkan angka odometer kilometer saat ini');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split('T')[0];
    const fiveYearsLater = new Date(new Date().setFullYear(new Date().getFullYear() + 5))
      .toISOString()
      .split('T')[0];

    // Otomatis buat template item perawatan bawaan sesuai tipe Motor atau Mobil
    const defaultMaintenanceItems: MaintenanceItem[] =
      type === 'motor'
        ? [
            {
              id: 'maint-gen-' + Date.now() + '-1',
              name: 'Oli Mesin',
              category: 'oil',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 2500,
              intervalMonths: 3,
              notes: 'Ganti rutin setiap 2.000 - 2.500 km',
            },
            {
              id: 'maint-gen-' + Date.now() + '-2',
              name: 'Oli Gardan / Transmisi',
              category: 'transmission',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 8000,
              intervalMonths: 6,
              notes: 'Ganti setiap 2-3 kali ganti oli mesin',
            },
            {
              id: 'maint-gen-' + Date.now() + '-3',
              name: 'Filter Udara',
              category: 'filter',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 10000,
              intervalMonths: 12,
            },
            {
              id: 'maint-gen-' + Date.now() + '-4',
              name: 'Busi',
              category: 'general',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 8000,
              intervalMonths: 12,
            },
            {
              id: 'maint-gen-' + Date.now() + '-5',
              name: 'Kampas Rem Depan & Belakang',
              category: 'brakes',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 10000,
              intervalMonths: 12,
            },
            {
              id: 'maint-gen-' + Date.now() + '-6',
              name: 'Pajak STNK Tahunan',
              category: 'tax',
              lastReplacedKm: 0,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 0,
              intervalMonths: 12,
              targetDate: oneYearLater,
            },
          ]
        : [
            {
              id: 'maint-gen-' + Date.now() + '-1',
              name: 'Oli Mesin Synthetic',
              category: 'oil',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 10000,
              intervalMonths: 6,
              notes: 'Ganti rutin setiap 10.000 km atau 6 bulan',
            },
            {
              id: 'maint-gen-' + Date.now() + '-2',
              name: 'Filter Oli Mesin',
              category: 'filter',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 10000,
              intervalMonths: 6,
            },
            {
              id: 'maint-gen-' + Date.now() + '-3',
              name: 'Filter Udara & AC Kabin',
              category: 'filter',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 10000,
              intervalMonths: 12,
            },
            {
              id: 'maint-gen-' + Date.now() + '-4',
              name: 'Rotasi Ban & Spooring Balancing',
              category: 'general',
              lastReplacedKm: odo,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 10000,
              intervalMonths: 6,
            },
            {
              id: 'maint-gen-' + Date.now() + '-5',
              name: 'Pajak STNK Tahunan',
              category: 'tax',
              lastReplacedKm: 0,
              lastReplacedDate: new Date().toISOString(),
              intervalKm: 0,
              intervalMonths: 12,
              targetDate: oneYearLater,
            },
          ];

    await addVehicle({
      name: name.trim(),
      brand: brand.trim() || (type === 'motor' ? 'Honda' : 'Toyota'),
      model: model.trim() || name.trim(),
      year: new Date().getFullYear(),
      type,
      plateNumber: plateNumber.trim().toUpperCase(),
      currentKm: odo,
      fuelType,
      tankCapacityLiters: type === 'motor' ? 5.5 : 45,
      color: color.trim() || 'Hitam',
      taxExpiryDate: oneYearLater,
      tax5YearExpiryDate: fiveYearsLater,
      maintenanceItems: defaultMaintenanceItems,
    });

    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheet}
            >
              <View style={styles.dragIndicator} />

              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Tambah Kendaraan</Text>
                  <Text style={styles.subtitle}>Daftarkan motor atau mobil ke garasi</Text>
                </View>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 28 }}
              >
                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                {/* Jenis Kendaraan (Motor / Mobil) */}
                <Text style={styles.fieldLabel}>Tipe Kendaraan</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      type === 'motor' && styles.typeButtonActive,
                    ]}
                    onPress={() => setType('motor')}
                  >
                    <Ionicons
                      name="bicycle"
                      size={22}
                      color={type === 'motor' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        type === 'motor' && styles.typeTextActive,
                      ]}
                    >
                      Sepeda Motor
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      type === 'mobil' && styles.typeButtonActive,
                    ]}
                    onPress={() => setType('mobil')}
                  >
                    <Ionicons
                      name="car-sport"
                      size={22}
                      color={type === 'mobil' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        type === 'mobil' && styles.typeTextActive,
                      ]}
                    >
                      Mobil
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Nama Kendaraan */}
                <Text style={styles.fieldLabel}>Nama Panggilan Kendaraan *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder={type === 'motor' ? 'Contoh: Vario 160 Hitam' : 'Contoh: Avanza Putih'}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {/* Plat Nomor & KM Saat Ini */}
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Plat Nomor *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={plateNumber}
                        onChangeText={setPlateNumber}
                        placeholder="B 1234 XYZ"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Odometer KM Saat Ini *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={currentKm}
                        onChangeText={(val) => setCurrentKm(val.replace(/\D/g, ''))}
                        keyboardType="numeric"
                        placeholder="12000"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                </View>

                {/* Brand & Warna */}
                <View style={styles.rowTwo}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Merk / Pabrikan</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={brand}
                        onChangeText={setBrand}
                        placeholder={type === 'motor' ? 'Honda / Yamaha' : 'Toyota / Daihatsu'}
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Warna</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={color}
                        onChangeText={setColor}
                        placeholder="Hitam / Putih"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Tambahkan ke Garasi</Text>
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
    maxHeight: '92%',
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: SPACING.md,
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
  },
  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
    padding: 0,
    flex: 1,
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
