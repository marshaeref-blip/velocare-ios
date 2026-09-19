export type VehicleType = 'motor' | 'mobil';

export type FuelType =
  | 'pertalite'
  | 'pertamax'
  | 'pertamax_turbo'
  | 'dexlite'
  | 'pertamina_dex'
  | 'shell_super'
  | 'shell_vpower'
  | 'shell_diesel'
  | 'bp_92'
  | 'bp_ultimate'
  | 'listrik'
  | 'lainnya';

export type MaintenanceCategory = 'oil' | 'filter' | 'brakes' | 'tax' | 'transmission' | 'general';

export interface MaintenanceItem {
  id: string;
  name: string;
  category: MaintenanceCategory;
  lastReplacedKm: number;
  lastReplacedDate: string; // ISO date string
  intervalKm: number; // e.g. 2500 for motor oil, 10000 for car oil (0 if time-only like tax)
  intervalMonths: number; // e.g. 3 months, 12 months for tax
  targetDate?: string; // specific deadline for tax (YYYY-MM-DD)
  notes?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  plateNumber: string;
  currentKm: number;
  fuelType: FuelType;
  tankCapacityLiters: number;
  color: string;
  taxExpiryDate: string; // Tanggal Pajak Tahunan (YYYY-MM-DD)
  tax5YearExpiryDate: string; // Tanggal Pajak 5 Tahunan / Ganti Plat (YYYY-MM-DD)
  maintenanceItems: MaintenanceItem[];
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string; // ISO date string
  odometer: number;
  liters: number;
  totalPrice: number;
  pricePerLiter: number;
  fuelType: FuelType;
  gasStationName?: string;
  isFullTank: boolean;
  notes?: string;
  efficiencyKmPerL?: number; // Calculated efficiency
  costPerKm?: number;
}

export type ServiceCategory = 'routine' | 'repair' | 'modification' | 'wash_detail';

export interface ServiceLog {
  id: string;
  vehicleId: string;
  date: string; // ISO date string
  odometer: number;
  workshopName: string;
  category: ServiceCategory;
  itemsReplaced: string[];
  totalCost: number;
  notes?: string;
}

export interface MaintenanceStatus {
  item: MaintenanceItem;
  kmRemaining: number;
  daysRemaining: number;
  percentUsed: number; // 0% (baru diservis) to 100%+ (sudah lewat)
  isDueKm: boolean;
  isDueTime: boolean;
  status: 'good' | 'warning' | 'overdue';
}
