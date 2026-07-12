import React, { useState, useEffect } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Cloud, AlertTriangle, Users, Loader2 } from 'lucide-react';

export const StatsWidget: React.FC = () => {
  const { activeStation } = useStationStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeStation) {
      fetchStats();
    }
  }, [activeStation]);

  const fetchStats = async () => {
    if (!activeStation) return;
    
    setIsLoading(true);
    try {
      const [stationStats, impactStats, alertStats] = await Promise.all([
        api.getStationStats(activeStation.id).catch(() => ({ data: { data: {} } })),
        api.getImpactStats(activeStation.id, { days: 7 }).catch(() => ({ data: { data: {} } })),
        api.getUnreadCount().catch(() => ({ data: { data: { unread: 0 } } })),
      ]);

      setStats({
        station: stationStats.data.data,
        impacts: impactStats.data.data,
        alerts: alertStats.data.data,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Loader2 className="h-4 w-4 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: 'Weather Records',
      value: stats?.station?.totalWeatherData || 0,
      icon: Cloud,
      description: 'Total observations',
      color: 'text-blue-500',
    },
    {
      title: 'Active Alerts',
      value: stats?.alerts?.unread || 0,
      icon: AlertTriangle,
      description: 'Unread alerts',
      color: 'text-red-500',
    },
    {
      title: 'Impacts This Week',
      value: stats?.impacts?.total || 0,
      icon: Activity,
      description: 'Impact events',
      color: 'text-orange-500',
    },
    {
      title: 'Total Users',
      value: '--',
      icon: Users,
      description: 'System users',
      color: 'text-green-500',
    },
  ];

  return (
    <>
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
};