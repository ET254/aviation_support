import React, { useEffect, useState } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { useAlertStore } from '@/stores/alertStore';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { ImpactWidget } from '@/components/dashboard/ImpactWidget';
import { AlertWidget } from '@/components/dashboard/AlertWidget';
import { ForecastWidget } from '@/components/dashboard/ForecastWidget';
import { DecisionLadderWidget } from '@/components/dashboard/DecisionLadderWidget';
import { StatsWidget } from '@/components/dashboard/StatsWidget';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { activeStation, setActiveStation } = useStationStore();
  const { user } = useAuth();

  const {
    setCurrentWeather,
    setHistoricalData,
    setIsLoading: setWeatherLoading,
  } = useWeatherStore();

  const {
    setAlerts,
    setUnreadCount,
  } = useAlertStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!activeStation && user?.stationId && user.role !== 'ADMIN') {
      fetchUserStation();
    }
  }, [activeStation, user?.stationId, user?.role]);

  useEffect(() => {
    if (activeStation) {
      fetchDashboardData();
    }
  }, [activeStation]);

  const fetchUserStation = async () => {
    if (!user?.stationId) return;

    try {
      const response = await api.getStation(user.stationId);
      setActiveStation(response.data.data);
    } catch (error) {
      console.error('Failed to load assigned station:', error);
      toast.error('Failed to load assigned station.');
    }
  };

  const fetchDashboardData = async () => {
    if (!activeStation) return;

    setWeatherLoading(true);
    setIsRefreshing(true);

    try {
      const results = await Promise.allSettled([
        api.getCurrentWeather(activeStation.id),
        api.getHistoricalWeather(activeStation.id, { limit: 24 }),
        api.getAlerts({ limit: 10 }),
        api.getUnreadCount(),
      ]);

      let failedServices = 0;

      // Weather
      if (results[0].status === 'fulfilled') {
        setCurrentWeather(results[0].value.data.data);
      } else {
        failedServices++;
        console.error('Weather request failed:', results[0].reason);
      }

      // Historical Weather
      if (results[1].status === 'fulfilled') {
        setHistoricalData(results[1].value.data.data);
      } else {
        failedServices++;
        console.error('Historical weather request failed:', results[1].reason);
      }

      // Alerts
      if (results[2].status === 'fulfilled') {
        setAlerts(results[2].value.data.data);
      } else {
        failedServices++;
        console.error('Alerts request failed:', results[2].reason);
      }

      // Unread Count
      if (results[3].status === 'fulfilled') {
        setUnreadCount(results[3].value.data.data.unread);
      } else {
        failedServices++;
        console.error('Unread count request failed:', results[3].reason);
      }

      if (failedServices > 0) {
        toast.error(
          `${failedServices} dashboard service${failedServices > 1 ? 's' : ''} failed to load.`
        );
      }
    } catch (error) {
      console.error('Unexpected dashboard error:', error);
      toast.error('Unexpected error while loading dashboard.');
    } finally {
      setWeatherLoading(false);
      setIsRefreshing(false);
    }
  };

  if (!activeStation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-xl border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold">No station selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a station on the Stations page or ensure your user account is linked to a station.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

  <div>

    <h1 className="text-4xl font-bold">
      Kenya Aviation Weather Decision Support System
    </h1>

    <p className="text-muted-foreground mt-2">
      Aviation Operations Dashboard
    </p>

  </div>

  <div className="flex gap-4 items-center">

    <div className="rounded-xl border p-4 min-w-[240px] bg-card">

      <div className="text-sm text-muted-foreground">
        Active Station
      </div>

      <div className="text-2xl font-bold">
        {activeStation?.code ?? "--"}
      </div>

      <div className="text-sm">
        {activeStation?.name ?? "No Station Selected"}
      </div>

    </div>

    <Button
      onClick={fetchDashboardData}
      disabled={isRefreshing}
      className="gap-2"
    >
      <RefreshCw
        className={`h-4 w-4 ${
          isRefreshing ? "animate-spin" : ""
        }`}
      />

      Refresh

    </Button>

  </div>

</div>

      <div className="grid gap-4 lg:grid-cols-6">

  <div className="rounded-xl border bg-card p-5">

    <p className="text-sm text-muted-foreground">
      Temperature
    </p>

    <h2 className="text-3xl font-bold">
      --
      <span className="text-lg">°C</span>
    </h2>

  </div>

  <div className="rounded-xl border bg-card p-5">

    <p className="text-sm text-muted-foreground">
      Wind
    </p>

    <h2 className="text-3xl font-bold">
      --
      <span className="text-lg"> kt</span>
    </h2>

  </div>

  <div className="rounded-xl border bg-card p-5">

    <p className="text-sm text-muted-foreground">
      Visibility
    </p>

    <h2 className="text-3xl font-bold">
      --
      <span className="text-lg"> km</span>
    </h2>

  </div>

  <div className="rounded-xl border bg-card p-5">

    <p className="text-sm text-muted-foreground">
      Pressure
    </p>

    <h2 className="text-3xl font-bold">
      --
      <span className="text-lg"> hPa</span>
    </h2>

  </div>

  <div className="rounded-xl border bg-card p-5">

    <p className="text-sm text-muted-foreground">
      Flight Rules
    </p>

    <h2 className="text-2xl font-bold text-green-600">
      VFR
    </h2>

  </div>

  <div className="rounded-xl border bg-card p-5">

    <p className="text-sm text-muted-foreground">
      Airport Status
    </p>

    <h2 className="text-2xl font-bold text-green-600">
      NORMAL
    </h2>

  </div>

</div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsWidget />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <WeatherWidget />
        </div>

        <div>
          <ForecastWidget />
        </div>

        <div>
          <AlertWidget />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ImpactWidget />
        <DecisionLadderWidget />
      </div>
    </div>
  );
};