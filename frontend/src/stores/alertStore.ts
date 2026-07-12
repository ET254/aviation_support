import { create } from 'zustand';
import { Alert } from '@/types';

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),
  markRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, readStatus: true } : a
      ),
      unreadCount: state.unreadCount - 1,
    })),
  markAllRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, readStatus: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));