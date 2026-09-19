import React, { useEffect, useState } from 'react';
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
import { ServiceCategory } from '../types';

interface AddServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: { key: ServiceCategory; label: string; icon: any }[] = [
  { key: 'routine', label: 'Servis Rutin', icon: 'construct' },
  { key: 'repair', label: 'Perbaikan / Sparepart', icon: 'build' },
  { key: 'modification', label: 'Modifikasi / Upgrade', icon: 'flash' },
  { key: 'wash_detail', label: 'Cuci & Detailing', icon: 'sparkles' },
];

export const AddServiceModal: React.FC<AddServiceModalProps> = ({ visible, onClose }) => {
  const { activeVehicle, addServiceLog } = useVehicle();

  const [odometer, setOdometer] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('routine');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [customItemText, setCustomItemText] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (activeVehicle) {
      setOdometer(activeVehicle.currentKm.toString());
      setWorkshopName('');
      setCategory('routine');
      setSelectedItemIds([]);
      setCustomItemText('');
      setTotalCost('');
      setNotes('');
      setErrorMsg('');
    }
  }, [activeVehicle, visible]);

  if (!activeVehicle) return null;

  const toggleItemSelection = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleSubmit = async () => {
    const odoNum = parseInt(odometer.replace(/\D/g, ''), 10);
    const costNum = parseInt(totalCost.replace(/\D/g, ''), 10) || 0;

    if (isNaN(odoNum) || odoNum <= 0) {
      setErrorMsg('Masukkan angka odometer yang valid');
      return;
    }

    if (!workshopName.trim()) {
      setErrorMsg('Masukkan nama bengkel atau lokasi servis');
      return;
    }

    // Kumpulkan nama-nama item yang diganti
    const replacedItemNames: string[] = [];
    activeVehicle.maintenanceItems.forEach((m) => {
      if (selectedItemIds.includes(m.id)) {
        replacedItemNames.push(m.name);
      }
    });

    if (customItemText.trim()) {
      replacedItemNames.push(customItemText.trim());
    }

    if (replacedItemNames.length === 0) {
      replacedItemNames.push('Pengecekan & Servis Berkala');
    }

    await addServiceLog(
      {
        vehicleId: activeVehicle.id,
        date: new Date().toISOString(),
        odometer: odoNum,
        workshopName: workshopName.trim(),
        category,
        itemsReplaced: replacedItemNames,
        totalCost: costNum,
        notes: notes.trim() || undefined,
      },
      selectedItemIds
    );

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
                  <Text style={styles.title}>Catat Servis / Bengkel</Text>
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
                contentContainerStyle={{ paddingBottom: 28 }}
              >
                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                {/* Kategori Servis */}
                <Text style={styles.fieldLabel}>Kategori Servis</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          styles.categoryCard,
                          isSelected && styles.categoryCardSelected,
                        ]}
                        onPress={() => setCategory(cat.key)}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={18}
                          color={isSelected ? COLORS.primary : COLORS.textSecondary}
                        />
                        <Text
                          style={[
                            styles.categoryLabel,
                            isSelected && styles.categoryLabelSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Odometer & Bengkel */}
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

                  <View style={{ flex: 1.3 }}>
                    <Text style={styles.fieldLabel}>Nama Bengkel</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={workshopName}
                        onChangeText={setWorkshopName}
                        placeholder="AHASS / Auto2000"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                </View>

                {/* Checklist Komponen yang Diservis (Otomatis Reset Countdown) */}
                <Text style={styles.fieldLabel}>
                  Pilih Komponen yang Diganti / Diservis:
                </Text>
                <Text style={styles.fieldHint}>
                  (Komponen terpilih akan otomatis direset jadwal servisnya)
                </Text>

                <View style={styles.itemsChecklist}>
                  {activeVehicle.maintenanceItems.map((m) => {
                    const isChecked = selectedItemIds.includes(m.id);
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.checkItem,
                          isChecked && styles.checkItemSelected,
                        ]}
                        onPress={() => toggleItemSelection(m.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isChecked ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={isChecked ? COLORS.primary : COLORS.textSecondary}
                        />
                        <Text
                          style={[
                            styles.checkItemText,
                            isChecked && styles.checkItemTextSelected,
                          ]}
                        >
                          {m.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Item tambahan */}
                <Text style={styles.fieldLabel}>Pengerjaan Tambahan (Opsional)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={customItemText}
                    onChangeText={setCustomItemText}
                    placeholder="Contoh: Bersih injector, stel klep, ganti ban"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {/* Total Biaya */}
                <Text style={styles.fieldLabel}>Total Biaya Servis (Rp)</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.prefixText}>Rp</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={totalCost}
                    onChangeText={(val) => setTotalCost(val.replace(/\D/g, ''))}
                    keyboardType="numeric"
                    placeholder="Contoh: 185000"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {/* Catatan */}
                <Text style={styles.fieldLabel}>Catatan Teknisi / Keluhan (Opsional)</Text>
                <View style={[styles.inputContainer, { height: 70, alignItems: 'flex-start' }]}>
                  <TextInput
                    style={[styles.input, { flex: 1, textAlignVertical: 'top' }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Kondisi sparepart lama, garansi bengkel, dll."
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
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Simpan Riwayat Servis</Text>
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
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
    marginBottom: 4,
    marginTop: SPACING.sm,
  },
  fieldHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
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
    flex: 1,
  },
  itemsChecklist: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    gap: 8,
  },
  checkItemSelected: {
    backgroundColor: COLORS.primaryMuted,
  },
  checkItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  checkItemTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: '600',
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
