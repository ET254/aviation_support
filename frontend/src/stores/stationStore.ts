import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Station } from '@/types';

interface StationState {
  stations: Station[];
  activeStation: Station | null;
  isLoading: boolean;
  setStations: (stations: Station[]) => void;
  setActiveStation: (station: Station | null) => void;
  addStation: (station: Station) => void;
  updateStation: (id: string, data: Partial<Station>) => void;
  removeStation: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useStationStore = create<StationState>()(
  persist(
    (set) => ({
      stations: [],
      activeStation: null,
      isLoading: false,
      setStations: (stations) => set({ stations }),
      setActiveStation: (station) => set({ activeStation: station }),
      addStation: (station) =>
        set((state) => ({
          stations: [...state.stations, station],
        })),
      updateStation: (id, data) =>
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),
      removeStation: (id) =>
        set((state) => ({
          stations: state.stations.filter((s) => s.id !== id),
        })),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'station-storage',
    }
  )
);