import { create } from 'zustand';
import { WeatherData } from '@/types';

interface WeatherState {
  currentWeather: WeatherData | null;
  historicalData: WeatherData[];
  isLoading: boolean;
  error: string | null;

  setCurrentWeather: (weather: WeatherData | null) => void;
  setHistoricalData: (data: WeatherData[]) => void;
  addWeatherData: (data: WeatherData) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  clearWeather: () => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  currentWeather: null,
  historicalData: [],
  isLoading: false,
  error: null,

  setCurrentWeather: (weather) =>
    set({
      currentWeather: weather,
    }),

  setHistoricalData: (data) =>
    set({
      historicalData: [...data].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      ),
    }),

  addWeatherData: (data) =>
    set((state) => {
      const exists = state.historicalData.some((item) => item.id === data.id);

      if (exists) {
        return {};
      }

      const updated = [data, ...state.historicalData]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        )
        .slice(0, 500);

      return {
        historicalData: updated,
        currentWeather: data,
      };
    }),

  setIsLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (message) =>
    set({
      error: message,
    }),

  clearWeather: () =>
    set({
      currentWeather: null,
      historicalData: [],
      isLoading: false,
      error: null,
    }),
}));