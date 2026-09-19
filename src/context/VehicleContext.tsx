import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FuelLog, MaintenanceItem, MaintenanceStatus, ServiceLog, Vehicle } from '../types';
import { INITIAL_FUEL_LOGS, INITIAL_SERVICE_LOGS, INITIAL_VEHICLES } from '../utils/dummyData';
import { calculateMaintenanceStatus } from '../utils/formatters';

interface VehicleContextType {
  vehicles: Vehicle[];
  activeVehicleId: string;
  activeVehicle: Vehicle | undefined;
  activeVehicleFuelLogs: FuelLog[];
  activeVehicleServiceLogs: ServiceLog[];
  activeVehicleMaintenanceStatuses: MaintenanceStatus[];
  isLoading: boolean;

  // Action methods
  setActiveVehicleId: (id: string) => void;
  updateOdometer: (vehicleId: string, newKm: number) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Promise<string>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addFuelLog: (log: Omit<FuelLog, 'id'>) => Promise<void>;
  deleteFuelLog: (id: string) => Promise<void>;
  addServiceLog: (
    log: Omit<ServiceLog, 'id'>,
    updatedMaintenanceItemIds?: string[]
  ) => Promise<void>;
  deleteServiceLog: (id: string) => Promise<void>;
  quickServiceItem: (
    vehicleId: string,
    itemId: string,
    cost?: number,
    workshopName?: string
  ) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
}

const STORAGE_KEYS = {
  VEHICLES: '@velocare_vehicles_v1',
  FUEL_LOGS: '@velocare_fuel_logs_v1',
  SERVICE_LOGS: '@velocare_service_logs_v1',
  ACTIVE_VEHICLE: '@velocare_active_vehicle_id_v1',
};

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleIdState] = useState<string>('');
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial data from AsyncStorage or populate with dummy defaults
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedVehicles = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLES);
        const storedFuel = await AsyncStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
        const storedServices = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_LOGS);
        const storedActive = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE);

        if (storedVehicles) {
          const parsedVehicles = JSON.parse(storedVehicles);
          setVehicles(parsedVehicles);
          if (storedActive && parsedVehicles.some((v: Vehicle) => v.id === storedActive)) {
            setActiveVehicleIdState(storedActive);
          } else if (parsedVehicles.length > 0) {
            setActiveVehicleIdState(parsedVehicles[0].id);
          }
        } else {
          // First time launching, seed with realistic Indonesian presets
          setVehicles(INITIAL_VEHICLES);
          setActiveVehicleIdState(INITIAL_VEHICLES[0].id);
          await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
          await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, INITIAL_VEHICLES[0].id);
        }

        if (storedFuel) {
          setFuelLogs(JSON.parse(storedFuel));
        } else {
          setFuelLogs(INITIAL_FUEL_LOGS);
          await AsyncStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(INITIAL_FUEL_LOGS));
        }

        if (storedServices) {
          setServiceLogs(JSON.parse(storedServices));
        } else {
          setServiceLogs(INITIAL_SERVICE_LOGS);
          await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_LOGS, JSON.stringify(INITIAL_SERVICE_LOGS));
        }
      } catch (error) {
        console.error('Error loading VeloCare data from AsyncStorage:', error);
        setVehicles(INITIAL_VEHICLES);
        setActiveVehicleIdState(INITIAL_VEHICLES[0].id);
        setFuelLogs(INITIAL_FUEL_LOGS);
        setServiceLogs(INITIAL_SERVICE_LOGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // Save vehicles whenever changed
  const persistVehicles = async (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(newVehicles));
    } catch (e) {
      console.error('Error saving vehicles:', e);
    }
  };

  // Save fuel logs whenever changed
  const persistFuelLogs = async (newLogs: FuelLog[]) => {
    setFuelLogs(newLogs);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(newLogs));
    } catch (e) {
      console.error('Error saving fuel logs:', e);
    }
  };

  // Save service logs whenever changed
  const persistServiceLogs = async (newLogs: ServiceLog[]) => {
    setServiceLogs(newLogs);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_LOGS, JSON.stringify(newLogs));
    } catch (e) {
      console.error('Error saving service logs:', e);
    }
  };

  const setActiveVehicleId = (id: string) => {
    setActiveVehicleIdState(id);
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, id).catch(console.error);
  };

  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];
  }, [vehicles, activeVehicleId]);

  const activeVehicleFuelLogs = useMemo(() => {
    if (!activeVehicle) return [];
    return fuelLogs
      .filter((log) => log.vehicleId === activeVehicle.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuelLogs, activeVehicle]);

  const activeVehicleServiceLogs = useMemo(() => {
    if (!activeVehicle) return [];
    return serviceLogs
      .filter((log) => log.vehicleId === activeVehicle.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serviceLogs, activeVehicle]);

  const activeVehicleMaintenanceStatuses = useMemo(() => {
    if (!activeVehicle) return [];
    return (activeVehicle.maintenanceItems || []).map((item) =>
      calculateMaintenanceStatus(item, activeVehicle.currentKm)
    );
  }, [activeVehicle]);

  // Update current odometer
  const updateOdometer = async (vehicleId: string, newKm: number) => {
    const updated = vehicles.map((v) => {
      if (v.id === vehicleId) {
        return {
          ...v,
          currentKm: Math.max(v.currentKm, newKm),
        };
      }
      return v;
    });
    await persistVehicles(updated);
  };

  // Add new vehicle
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>): Promise<string> => {
    const newId = 'veh-' + Date.now();
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...vehicles, newVehicle];
    await persistVehicles(updated);
    setActiveVehicleId(newId);
    return newId;
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const updated = vehicles.map((v) => (v.id === vehicle.id ? vehicle : v));
    await persistVehicles(updated);
  };

  const deleteVehicle = async (id: string) => {
    const updated = vehicles.filter((v) => v.id !== id);
    await persistVehicles(updated);
    if (activeVehicleId === id && updated.length > 0) {
      setActiveVehicleId(updated[0].id);
    }
  };

  // Add fuel log with automatic efficiency calculation
  const addFuelLog = async (logData: Omit<FuelLog, 'id'>) => {
    const newId = 'fuel-' + Date.now();

    // Hitung efisiensi BBM jika ada pengisian sebelumnya
    const prevLogs = fuelLogs
      .filter((l) => l.vehicleId === logData.vehicleId && l.odometer < logData.odometer)
      .sort((a, b) => b.odometer - a.odometer);

    let efficiencyKmPerL: number | undefined = undefined;
    let costPerKm: number | undefined = undefined;

    if (prevLogs.length > 0 && logData.liters > 0) {
      const deltaKm = logData.odometer - prevLogs[0].odometer;
      if (deltaKm > 0) {
        efficiencyKmPerL = Number((deltaKm / logData.liters).toFixed(1));
        costPerKm = Number((logData.totalPrice / deltaKm).toFixed(0));
      }
    }

    const newLog: FuelLog = {
      ...logData,
      id: newId,
      efficiencyKmPerL,
      costPerKm,
    };

    const updatedLogs = [newLog, ...fuelLogs];
    await persistFuelLogs(updatedLogs);

    // Otomatis update KM kendaraan jika log bensin lebih tinggi dari KM saat ini
    if (activeVehicle && logData.odometer > activeVehicle.currentKm) {
      await updateOdometer(logData.vehicleId, logData.odometer);
    }
  };

  const deleteFuelLog = async (id: string) => {
    const updated = fuelLogs.filter((l) => l.id !== id);
    await persistFuelLogs(updated);
  };

  // Add Service Log
  const addServiceLog = async (
    logData: Omit<ServiceLog, 'id'>,
    updatedMaintenanceItemIds?: string[]
  ) => {
    const newId = 'serv-' + Date.now();
    const newLog: ServiceLog = {
      ...logData,
      id: newId,
    };

    const updatedServiceLogs = [newLog, ...serviceLogs];
    await persistServiceLogs(updatedServiceLogs);

    // Update maintenance item timestamps & KM jika dicentang
    if (updatedMaintenanceItemIds && updatedMaintenanceItemIds.length > 0) {
      const targetVehicle = vehicles.find((v) => v.id === logData.vehicleId);
      if (targetVehicle) {
        const updatedItems = targetVehicle.maintenanceItems.map((item) => {
          if (updatedMaintenanceItemIds.includes(item.id)) {
            return {
              ...item,
              lastReplacedKm: logData.odometer,
              lastReplacedDate: logData.date,
            };
          }
          return item;
        });

        const updatedVehicles = vehicles.map((v) =>
          v.id === logData.vehicleId
            ? {
                ...v,
                currentKm: Math.max(v.currentKm, logData.odometer),
                maintenanceItems: updatedItems,
              }
            : v
        );
        await persistVehicles(updatedVehicles);
      }
    } else if (activeVehicle && logData.odometer > activeVehicle.currentKm) {
      await updateOdometer(logData.vehicleId, logData.odometer);
    }
  };

  const deleteServiceLog = async (id: string) => {
    const updated = serviceLogs.filter((l) => l.id !== id);
    await persistServiceLogs(updated);
  };

  // Quick 1-tap maintenance update (misal baru saja ganti oli sendiri atau di bengkel)
  const quickServiceItem = async (
    vehicleId: string,
    itemId: string,
    cost: number = 0,
    workshopName: string = 'Servis Mandiri'
  ) => {
    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    if (!targetVehicle) return;

    const targetItem = targetVehicle.maintenanceItems.find((i) => i.id === itemId);
    const itemName = targetItem ? targetItem.name : 'Servis Komponen';
    const now = new Date().toISOString();

    // 1. Update maintenance item di kendaraan
    const updatedItems = targetVehicle.maintenanceItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          lastReplacedKm: targetVehicle.currentKm,
          lastReplacedDate: now,
          targetDate:
            item.category === 'tax'
              ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                  .toISOString()
                  .split('T')[0]
              : item.targetDate,
        };
      }
      return item;
    });

    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicleId ? { ...v, maintenanceItems: updatedItems } : v
    );
    await persistVehicles(updatedVehicles);

    // 2. Buat log servis otomatis
    const newServiceLog: ServiceLog = {
      id: 'serv-quick-' + Date.now(),
      vehicleId,
      date: now,
      odometer: targetVehicle.currentKm,
      workshopName,
      category: 'routine',
      itemsReplaced: [itemName],
      totalCost: cost,
      notes: `Pembaruan cepat servis ${itemName}.`,
    };

    await persistServiceLogs([newServiceLog, ...serviceLogs]);
  };

  // Reset to default presets
  const resetToDefaultData = async () => {
    await persistVehicles(INITIAL_VEHICLES);
    setActiveVehicleId(INITIAL_VEHICLES[0].id);
    await persistFuelLogs(INITIAL_FUEL_LOGS);
    await persistServiceLogs(INITIAL_SERVICE_LOGS);
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        activeVehicleId,
        activeVehicle,
        activeVehicleFuelLogs,
        activeVehicleServiceLogs,
        activeVehicleMaintenanceStatuses,
        isLoading,
        setActiveVehicleId,
        updateOdometer,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addFuelLog,
        deleteFuelLog,
        addServiceLog,
        deleteServiceLog,
        quickServiceItem,
        resetToDefaultData,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};
