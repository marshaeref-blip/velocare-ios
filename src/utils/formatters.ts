import { FuelType, MaintenanceItem, MaintenanceStatus, VehicleType } from '../types';

/**
 * Format angka ke format mata uang Rupiah (contoh: Rp 85.000)
 */
export const formatRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Format angka ribuan (contoh: 12.500)
 */
export const formatKm = (km: number): string => {
  if (isNaN(km) || km === null || km === undefined) return '0 km';
  return Math.round(km).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' km';
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num) || num === null || num === undefined) return '0';
  if (decimals > 0) {
    return Number(num).toFixed(decimals).replace('.', ',');
  }
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Format tanggal Indonesia pendek (contoh: 19 Sep 2026)
 */
export const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Hitung sisa hari dari tanggal target (positif = belum lewat, negatif = lewat)
 */
export const calculateDaysRemaining = (targetDateStr: string): number => {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  const today = new Date();
  // Reset jam ke 00:00:00
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Menghitung status servis berdasarkan KM dan Waktu
 */
export const calculateMaintenanceStatus = (
  item: MaintenanceItem,
  currentKm: number
): MaintenanceStatus => {
  // Hitung interval KM jika ada
  let kmRemaining = 999999;
  let percentKm = 0;
  let isDueKm = false;

  if (item.intervalKm > 0) {
    const nextDueKm = item.lastReplacedKm + item.intervalKm;
    kmRemaining = nextDueKm - currentKm;
    const kmPassed = currentKm - item.lastReplacedKm;
    percentKm = Math.min(Math.max((kmPassed / item.intervalKm) * 100, 0), 100);
    if (kmRemaining <= 0) isDueKm = true;
  }

  // Hitung interval Waktu (hari)
  let daysRemaining = 9999;
  let percentTime = 0;
  let isDueTime = false;

  if (item.targetDate) {
    daysRemaining = calculateDaysRemaining(item.targetDate);
    if (daysRemaining <= 0) isDueTime = true;
  } else if (item.intervalMonths > 0) {
    const lastDate = new Date(item.lastReplacedDate);
    const nextDueDate = new Date(lastDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + item.intervalMonths);
    daysRemaining = calculateDaysRemaining(nextDueDate.toISOString().split('T')[0]);
    if (daysRemaining <= 0) isDueTime = true;
  }

  // Menentukan status akhir
  let status: 'good' | 'warning' | 'overdue' = 'good';
  const percentUsed = Math.max(percentKm, item.targetDate ? (daysRemaining <= 30 ? 90 : 20) : percentKm);

  if (kmRemaining <= 0 || daysRemaining <= 0) {
    status = 'overdue';
  } else if (kmRemaining <= 300 || daysRemaining <= 14) {
    status = 'warning';
  } else {
    status = 'good';
  }

  return {
    item,
    kmRemaining,
    daysRemaining,
    percentUsed: Math.min(Math.round(percentUsed), 100),
    isDueKm,
    isDueTime,
    status,
  };
};

export const getFuelTypeName = (type: FuelType): string => {
  switch (type) {
    case 'pertalite':
      return 'Pertalite (RON 90)';
    case 'pertamax':
      return 'Pertamax (RON 92)';
    case 'pertamax_turbo':
      return 'Pertamax Turbo (RON 98)';
    case 'dexlite':
      return 'Dexlite (CN 51)';
    case 'pertamina_dex':
      return 'Pertamina Dex (CN 53)';
    case 'shell_super':
      return 'Shell Super (RON 92)';
    case 'shell_vpower':
      return 'Shell V-Power (RON 95)';
    case 'shell_diesel':
      return 'Shell V-Power Diesel';
    case 'bp_92':
      return 'BP 92';
    case 'bp_ultimate':
      return 'BP Ultimate';
    case 'listrik':
      return 'Listrik (EV / PLN)';
    default:
      return 'Bahan Bakar Umum';
  }
};

export const getVehicleTypeLabel = (type: VehicleType): string => {
  return type === 'motor' ? 'Sepeda Motor' : 'Mobil';
};
