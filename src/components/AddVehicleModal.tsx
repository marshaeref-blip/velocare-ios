import React, { useMemo, useState } from 'react';
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
import {
  CAR_CATEGORIES,
  CatalogVehicle,
  MOTOR_CATEGORIES,
  POPULAR_CAR_BRANDS,
  POPULAR_MOTOR_BRANDS,
  VEHICLE_CATALOG,
} from '../constants/vehicleCatalog';
import { useVehicle } from '../context/VehicleContext';
import { FuelType, MaintenanceItem, VehicleType } from '../types';

interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ visible, onClose }) => {
  const { addVehicle } = useVehicle();

  const [type, setType] = useState<VehicleType>('motor');
  const [selectedBrand, setSelectedBrand] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected or Custom Vehicle Data
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogVehicle | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2026);
  const [plateNumber, setPlateNumber] = useState('');
  const [currentKm, setCurrentKm] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('pertamax');
  const [tankCapacity, setTankCapacity] = useState<number>(5.0);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter Catalog Items
  const filteredCatalog = useMemo(() => {
    return VEHICLE_CATALOG.filter((item) => {
      if (item.type !== type) return false;
      if (selectedBrand !== 'Semua' && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }
      if (selectedCategory !== 'Semua' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.model.toLowerCase().includes(query);
        const matchBrand = item.brand.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchCat) return false;
      }
      return true;
    });
  }, [type, selectedBrand, selectedCategory, searchQuery]);

  // Handle Model Selection
  const handleSelectCatalogItem = (item: CatalogVehicle) => {
    setSelectedCatalogItem(item);
    setIsCustomMode(false);
    setName(item.model.split(' (')[0]);
    setBrand(item.brand);
    setModel(item.model);
    setFuelType(item.defaultFuel);
    setTankCapacity(item.tankCapacityLiters);
    setColor(item.popularColors[0] || 'Hitam');
    setErrorMsg('');
  };

  const handleCustomModeToggle = () => {
    setIsCustomMode(true);
    setSelectedCatalogItem(null);
    setName('');
    setBrand('');
    setModel('');
    setColor('Hitam');
    setFuelType(type === 'motor' ? 'pertamax' : 'pertalite');
    setTankCapacity(type === 'motor' ? 5.0 : 45.0);
    setErrorMsg('');
  };

  const resetForm = () => {
    setType('motor');
    setSelectedBrand('Semua');
    setSelectedCategory('Semua');
    setSearchQuery('');
    setSelectedCatalogItem(null);
    setIsCustomMode(false);
    setName('');
    setBrand('');
    setModel('');
    setYear(2026);
    setPlateNumber('');
    setCurrentKm('');
    setColor('');
    setFuelType('pertamax');
    setTankCapacity(5.0);
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeChange = (newType: VehicleType) => {
    setType(newType);
    setSelectedBrand('Semua');
    setSelectedCategory('Semua');
    setSearchQuery('');
    setSelectedCatalogItem(null);
    setIsCustomMode(false);
    setFuelType(newType === 'motor' ? 'pertamax' : 'pertalite');
    setTankCapacity(newType === 'motor' ? 5.0 : 45.0);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Pilih model kendaraan dari daftar atau masukkan nama kendaraan');
      return;
    }
    if (!plateNumber.trim()) {
      setErrorMsg('Masukkan nomor polisi / plat kendaraan (misal: B 1234 ABC)');
      return;
    }
    const odo = parseInt(currentKm.replace(/\D/g, ''), 10);
    if (isNaN(odo) || odo < 0) {
      setErrorMsg('Masukkan angka kilometer odometer saat ini');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split('T')[0];
    const fiveYearsLater = new Date(new Date().setFullYear(new Date().getFullYear() + 5))
      .toISOString()
      .split('T')[0];

    // Build intelligent maintenance items based on selected catalog item or fallback
    let maintenanceItems: MaintenanceItem[] = [];
    if (selectedCatalogItem && selectedCatalogItem.services.length > 0) {
      maintenanceItems = selectedCatalogItem.services.map((svc, idx) => ({
        id: `maint-auto-${Date.now()}-${idx + 1}`,
        name: svc.name,
        category: svc.category,
        lastReplacedKm: svc.intervalKm > 0 ? odo : 0,
        lastReplacedDate: new Date().toISOString(),
        intervalKm: svc.intervalKm,
        intervalMonths: svc.intervalMonths,
        targetDate: svc.category === 'tax' ? oneYearLater : undefined,
        notes: svc.notes,
      }));
    } else {
      // Fallback custom
      maintenanceItems = [
        {
          id: `maint-custom-${Date.now()}-1`,
          name: type === 'motor' ? 'Oli Mesin' : 'Oli Mesin & Filter Oli',
          category: 'oil',
          lastReplacedKm: odo,
          lastReplacedDate: new Date().toISOString(),
          intervalKm: type === 'motor' ? 2500 : 10000,
          intervalMonths: type === 'motor' ? 3 : 6,
        },
        {
          id: `maint-custom-${Date.now()}-2`,
          name: type === 'motor' ? 'Oli Gardan / Rantai' : 'Filter Udara & AC',
          category: type === 'motor' ? 'transmission' : 'filter',
          lastReplacedKm: odo,
          lastReplacedDate: new Date().toISOString(),
          intervalKm: type === 'motor' ? 8000 : 20000,
          intervalMonths: 12,
        },
        {
          id: `maint-custom-${Date.now()}-3`,
          name: 'Kampas Rem',
          category: 'brakes',
          lastReplacedKm: odo,
          lastReplacedDate: new Date().toISOString(),
          intervalKm: type === 'motor' ? 10000 : 30000,
          intervalMonths: 12,
        },
        {
          id: `maint-custom-${Date.now()}-4`,
          name: 'Pajak STNK Tahunan',
          category: 'tax',
          lastReplacedKm: 0,
          lastReplacedDate: new Date().toISOString(),
          intervalKm: 0,
          intervalMonths: 12,
          targetDate: oneYearLater,
        },
      ];
    }

    await addVehicle({
      name: name.trim(),
      brand: brand.trim() || (type === 'motor' ? 'Yamaha' : 'Toyota'),
      model: model.trim() || name.trim(),
      year,
      type,
      plateNumber: plateNumber.trim().toUpperCase(),
      currentKm: odo,
      fuelType,
      tankCapacityLiters: tankCapacity,
      color: color.trim() || 'Hitam',
      taxExpiryDate: oneYearLater,
      tax5YearExpiryDate: fiveYearsLater,
      maintenanceItems,
    });

    handleClose();
  };

  const brandOptions = type === 'motor' ? POPULAR_MOTOR_BRANDS : POPULAR_CAR_BRANDS;
  const categoryOptions = type === 'motor' ? MOTOR_CATEGORIES : CAR_CATEGORIES;
  const years = [
    2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
    2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000,
    1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991, 1990, 1985, 1980, 1975, 1970,
  ];

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

              {/* Modal Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Tambah Kendaraan</Text>
                  <Text style={styles.subtitle}>
                    Katalog lengkap motor & mobil s/d 2026 dengan preset servis otomatis
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={26} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.formContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* 1. Vehicle Type Segmented Toggle */}
                <View style={styles.typeSegment}>
                  <TouchableOpacity
                    style={[styles.typeButton, type === 'motor' && styles.typeButtonActive]}
                    onPress={() => handleTypeChange('motor')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="bicycle"
                      size={18}
                      color={type === 'motor' ? '#FFFFFF' : COLORS.textSecondary}
                    />
                    <Text
                      style={[styles.typeButtonText, type === 'motor' && styles.typeButtonTextActive]}
                    >
                      Sepeda Motor
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeButton, type === 'mobil' && styles.typeButtonActive]}
                    onPress={() => handleTypeChange('mobil')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="car-sport"
                      size={18}
                      color={type === 'mobil' ? '#FFFFFF' : COLORS.textSecondary}
                    />
                    <Text
                      style={[styles.typeButtonText, type === 'mobil' && styles.typeButtonTextActive]}
                    >
                      Mobil
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Search & Filter Header */}
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={18} color={COLORS.primary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={
                      type === 'motor'
                        ? 'Cari motor: NMAX Turbo, Vario, Scoopy, ZX-25R...'
                        : 'Cari mobil: Avanza, Zenix, Brio, Xpander, Ioniq...'
                    }
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Brand Selector Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterChipScroll}
                >
                  {brandOptions.map((b) => (
                    <TouchableOpacity
                      key={b}
                      style={[styles.filterChip, selectedBrand === b && styles.filterChipActive]}
                      onPress={() => setSelectedBrand(b)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedBrand === b && styles.filterChipTextActive,
                        ]}
                      >
                        {b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Category Selector Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterChipScrollCategory}
                >
                  {categoryOptions.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.categoryChip, selectedCategory === c && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(c)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategory === c && styles.categoryChipTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Catalog Card Selector Carousel/List */}
                <Text style={styles.sectionTitle}>
                  Pilih Model {type === 'motor' ? 'Sepeda Motor' : 'Mobil'} ({filteredCatalog.length})
                </Text>

                <View style={styles.catalogGrid}>
                  {filteredCatalog.map((item) => {
                    const isSelected = selectedCatalogItem?.id === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.catalogCard, isSelected && styles.catalogCardActive]}
                        onPress={() => handleSelectCatalogItem(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.catalogCardHeader}>
                          <Text style={styles.catalogBrandText}>{item.brand.toUpperCase()}</Text>
                          <View style={styles.catalogCategoryBadge}>
                            <Text style={styles.catalogCategoryText}>{item.category}</Text>
                          </View>
                        </View>
                        <Text style={styles.catalogModelText} numberOfLines={2}>
                          {item.model}
                        </Text>
                        <View style={styles.catalogSpecsRow}>
                          <Text style={styles.catalogFuelText}>
                            ⛽ {item.defaultFuel.toUpperCase()}
                          </Text>
                          {item.tankCapacityLiters > 0 ? (
                            <Text style={styles.catalogTankText}>
                              {item.tankCapacityLiters}L
                            </Text>
                          ) : (
                            <Text style={styles.catalogTankText}>⚡ EV</Text>
                          )}
                        </View>
                        {isSelected ? (
                          <View style={styles.selectedCheckmark}>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                            <Text style={styles.selectedText}>Terpilih</Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}

                  {/* Option for Custom Model */}
                  <TouchableOpacity
                    style={[styles.catalogCard, styles.customCard, isCustomMode && styles.catalogCardActive]}
                    onPress={handleCustomModeToggle}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.customCardTitle}>Model Lainnya</Text>
                    <Text style={styles.customCardSub}>Ketik manual nama kendaraan Anda</Text>
                  </TouchableOpacity>
                </View>

                {/* Selected Vehicle Auto-configuration Preview */}
                {selectedCatalogItem || isCustomMode ? (
                  <View style={styles.autoConfigBox}>
                    <View style={styles.autoConfigHeader}>
                      <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                      <Text style={styles.autoConfigTitle}>
                        {selectedCatalogItem
                          ? 'Konfigurasi Otomatis Diterapkan'
                          : 'Konfigurasi Model Kustom'}
                      </Text>
                    </View>

                    {/* Vehicle Name Input */}
                    <Text style={styles.inputLabel}>Nama Panggilan Kendaraan *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Contoh: NMAX Turbo / Xride Harian / Innova Zenix"
                      placeholderTextColor={COLORS.textMuted}
                    />

                    {/* Brand & Model (Custom Only) */}
                    {isCustomMode ? (
                      <View style={styles.rowTwoInputs}>
                        <View style={styles.halfInput}>
                          <Text style={styles.inputLabel}>Merk / Brand *</Text>
                          <TextInput
                            style={styles.textInput}
                            value={brand}
                            onChangeText={setBrand}
                            placeholder="Contoh: Yamaha"
                            placeholderTextColor={COLORS.textMuted}
                          />
                        </View>
                        <View style={styles.halfInput}>
                          <Text style={styles.inputLabel}>Tipe / Model *</Text>
                          <TextInput
                            style={styles.textInput}
                            value={model}
                            onChangeText={setModel}
                            placeholder="Contoh: Xride 125"
                            placeholderTextColor={COLORS.textMuted}
                          />
                        </View>
                      </View>
                    ) : null}

                    {/* Year Selector with Direct Input & Scroll Chips */}
                    <View style={styles.yearHeaderRow}>
                      <Text style={styles.inputLabelNoMargin}>Tahun Pembuatan Kendaraan</Text>
                      <View style={styles.yearInputWrap}>
                        <TextInput
                          style={styles.yearInputBox}
                          value={year.toString()}
                          onChangeText={(val) => {
                            const parsed = parseInt(val.replace(/\D/g, ''), 10);
                            if (!isNaN(parsed)) setYear(parsed);
                          }}
                          keyboardType="numeric"
                          maxLength={4}
                        />
                      </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
                      {years.map((y) => (
                        <TouchableOpacity
                          key={y}
                          style={[styles.yearChip, year === y && styles.yearChipActive]}
                          onPress={() => setYear(y)}
                        >
                          <Text style={[styles.yearChipText, year === y && styles.yearChipTextActive]}>
                            {y}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Color Chips */}
                    <Text style={styles.inputLabel}>Warna Kendaraan</Text>
                    {selectedCatalogItem && selectedCatalogItem.popularColors.length > 0 ? (
                      <View style={styles.colorsWrap}>
                        {selectedCatalogItem.popularColors.map((c) => (
                          <TouchableOpacity
                            key={c}
                            style={[styles.colorChip, color === c && styles.colorChipActive]}
                            onPress={() => setColor(c)}
                          >
                            <Text style={[styles.colorChipText, color === c && styles.colorChipTextActive]}>
                              {c}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                    <TextInput
                      style={[styles.textInput, { marginTop: 6 }]}
                      value={color}
                      onChangeText={setColor}
                      placeholder="Atau ketik warna (misal: Putih Mutiara / Matte Black)"
                      placeholderTextColor={COLORS.textMuted}
                    />

                    {/* Fuel Type & Tank */}
                    <View style={styles.rowTwoInputs}>
                      <View style={styles.halfInput}>
                        <Text style={styles.inputLabel}>Bahan Bakar</Text>
                        <TextInput
                          style={styles.textInput}
                          value={fuelType.toUpperCase()}
                          editable={false}
                        />
                      </View>
                      <View style={styles.halfInput}>
                        <Text style={styles.inputLabel}>Kapasitas Tangki</Text>
                        <TextInput
                          style={styles.textInput}
                          value={tankCapacity > 0 ? `${tankCapacity} Liter` : 'Listrik (EV)'}
                          editable={false}
                        />
                      </View>
                    </View>

                    {/* Plate Number & Initial Odometer */}
                    <Text style={styles.inputLabel}>Nomor Polisi / Plat *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={plateNumber}
                      onChangeText={(val) => setPlateNumber(val.toUpperCase())}
                      placeholder="Contoh: B 1234 ABC atau W 4857 QM"
                      placeholderTextColor={COLORS.textMuted}
                      autoCapitalize="characters"
                    />

                    <Text style={styles.inputLabel}>Kilometer Odometer Saat Ini *</Text>
                    <View style={styles.odoInputWrapper}>
                      <Ionicons name="speedometer-outline" size={20} color={COLORS.primary} />
                      <TextInput
                        style={styles.odoInput}
                        value={currentKm}
                        onChangeText={(val) => setCurrentKm(val.replace(/\D/g, ''))}
                        placeholder="Contoh: 50000"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                      />
                      <Text style={styles.odoUnit}>KM</Text>
                    </View>

                    {/* Auto-generated Maintenance Schedule Indicator */}
                    <View style={styles.presetServicesBox}>
                      <View style={styles.presetTitleRow}>
                        <Ionicons name="construct" size={14} color={COLORS.success} />
                        <Text style={styles.presetTitle}>
                          Jadwal Servis Otomatis (
                          {selectedCatalogItem?.services.length || 4} Komponen Terpasang)
                        </Text>
                      </View>
                      <Text style={styles.presetDescription}>
                        {type === 'motor'
                          ? '✓ Oli Mesin (2.500 km), Oli Gardan/Transmisi, Filter Udara, Busi, Kampas Rem & Pajak STNK'
                          : '✓ Oli Mesin Synthetic (10.000 km), Filter Udara, AC, ATF/CVT, Busi & Pajak STNK'}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                {/* Save Button */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!name.trim() || !plateNumber.trim() || !currentKm.trim()) && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Simpan & Masukkan ke Garasi</Text>
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
    maxHeight: '92%',
    ...SHADOWS.card,
  },
  dragIndicator: {
    width: 36,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: RADIUS.pill,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  formScroll: {
    flexGrow: 1,
  },
  formContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 40,
  },
  typeSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.subtle,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 8,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  filterChipScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryMuted,
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
  filterChipScrollCategory: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  catalogCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.subtle,
  },
  catalogCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primaryMuted,
  },
  catalogCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catalogBrandText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  catalogCategoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  catalogCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  catalogModelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minHeight: 34,
  },
  catalogSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 4,
  },
  catalogFuelText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catalogTankText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },
  selectedCheckmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  selectedText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  customCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
  },
  customCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  customCardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  autoConfigBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.lg,
  },
  autoConfigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  autoConfigTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  yearHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  inputLabelNoMargin: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  yearInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    minWidth: 64,
  },
  yearScroll: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  yearChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  yearChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  yearChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  colorsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  colorChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colorChipActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  colorChipText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  colorChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  odoInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  odoInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  odoUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  presetServicesBox: {
    backgroundColor: '#EAF8EE',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#C7EED0',
  },
  presetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  presetDescription: {
    fontSize: 10,
    color: '#166534',
    lineHeight: 14,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.lg,
    ...SHADOWS.glowPrimary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
