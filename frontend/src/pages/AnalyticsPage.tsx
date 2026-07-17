import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plane,
  CloudRain,
  Wind,
  Thermometer,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  BarChart3
} from 'lucide-react';

import { api } from '@/services/api';
import { useStationStore } from '@/stores/stationStore';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KPI {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change: number;
  color: string;
}

interface MonthlyTrend {
  month: string;
  impacts: number;
  alerts: number;
}

interface WeatherStat {
  parameter: string;
  average: number;
  max: number;
  min: number;
}

const mockKPIs: KPI[] = [
  {
    title: 'Weather Alerts',
    value: 0,
    icon: AlertTriangle,
    change: 0,
    color: 'text-red-500',
  },
  {
    title: 'Operational Impacts',
    value: 87,
    icon: Plane,
    change: -6,
    color: 'text-blue-500',
  },
  {
    title: 'Forecast Accuracy',
    value: '94%',
    icon: Activity,
    change: 4,
    color: 'text-green-500',
  },
  {
    title: 'Safety Score',
    value: '98%',
    icon: TrendingUp,
    change: 2,
    color: 'text-emerald-500',
  },
];

const mockMonthly: MonthlyTrend[] = [
  { month: 'Jan', impacts: 0, alerts: 0 },
  { month: 'Feb', impacts: 40, alerts: 51 },
  { month: 'Mar', impacts: 28, alerts: 37 },
  { month: 'Apr', impacts: 62, alerts: 70 },
  { month: 'May', impacts: 49, alerts: 55 },
  { month: 'Jun', impacts: 71, alerts: 88 },
];

const mockWeatherStats: WeatherStat[] = [
  {
    parameter: 'Visibility',
    average: 0,
    max: 0,
    min: 0,
  },
  {
    parameter: 'Wind Speed',
    average: 18,
    max: 42,
    min: 4,
  },
  {
    parameter: 'Temperature',
    average: 22,
    max: 31,
    min: 12,
  },
  {
    parameter: 'Ceiling',
    average: 4500,
    max: 9000,
    min: 400,
  },
];

export const AnalyticsPage: React.FC = () => {
  const { activeStation } = useStationStore();

  const [loading, setLoading] = useState(false);

  const [period, setPeriod] = useState('30days');

  const [kpis, setKpis] = useState<KPI[]>(mockKPIs);
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>(mockMonthly);
  const [weatherStats, setWeatherStats] = useState<WeatherStat[]>(mockWeatherStats);
  const [stationStats, setStationStats] = useState<any>(null);
  const [impactStats, setImpactStats] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [activeStation, period]);

  const loadAnalytics = async () => {
    if (!activeStation) return;

    setLoading(true);

    try {
      const [stationStatsResponse, weatherStatsResponse, impactStatsResponse] = await Promise.allSettled([
        api.getStationStats(activeStation.id),
        api.getWeatherStats(activeStation.id, { days: period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365 }),
        api.getImpactStats(activeStation.id, { days: period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365 }),
      ]);

      const stationStatsData = stationStatsResponse.status === 'fulfilled' ? stationStatsResponse.value.data.data : null;
      const weatherStatsData = weatherStatsResponse.status === 'fulfilled' ? weatherStatsResponse.value.data.data : null;
      const impactStatsData = impactStatsResponse.status === 'fulfilled' ? impactStatsResponse.value.data.data : null;

      setStationStats(stationStatsData);
      setImpactStats(impactStatsData);

      const safetyScore = impactStatsData?.total
        ? Math.max(
            50,
            100 -
              ((impactStatsData.bySeverity?.find((s: any) => s.severity === 'SEVERE')?.count || 0) * 5 +
                (impactStatsData.bySeverity?.find((s: any) => s.severity === 'CRITICAL')?.count || 0) * 10)
          )
        : 98;

      setKpis([
        {
          title: 'Weather Alerts',
          value: impactStatsData?.total || 0,
          icon: AlertTriangle,
          change: 0,
          color: 'text-red-500',
        },
        {
          title: 'Operational Impacts',
          value: stationStatsData?.alertsGenerated || 0,
          icon: Plane,
          change: 0,
          color: 'text-blue-500',
        },
        {
          title: 'Forecast Records',
          value: stationStatsData?.totalForecasts || 0,
          icon: Activity,
          change: 0,
          color: 'text-green-500',
        },
        {
          title: 'Safety Score',
          value: `${safetyScore}%`,
          icon: TrendingUp,
          change: 0,
          color: 'text-emerald-500',
        },
      ]);

      setWeatherStats([
        {
          parameter: 'Temperature',
          average: weatherStatsData?.averages?.temperature || 0,
          max: weatherStatsData?.extremes?.temperature?.max || 0,
          min: weatherStatsData?.extremes?.temperature?.min || 0,
        },
        {
          parameter: 'Wind Speed',
          average: weatherStatsData?.averages?.windSpeed || 0,
          max: weatherStatsData?.extremes?.windSpeed?.max || 0,
          min: 0,
        },
        {
          parameter: 'Visibility',
          average: weatherStatsData?.averages?.visibility || 0,
          max: weatherStatsData?.extremes?.visibility?.max || 0,
          min: weatherStatsData?.extremes?.visibility?.min || 0,
        },
        {
          parameter: 'Pressure',
          average: weatherStatsData?.averages?.pressureQnh || 0,
          max: weatherStatsData?.extremes?.pressureQnh?.max || 0,
          min: weatherStatsData?.extremes?.pressureQnh?.min || 0,
        },
      ]);

      setMonthlyData([
        { month: 'Week 1', impacts: impactStatsData?.bySeverity?.reduce((acc: number, item: any) => acc + item.count, 0) || 0, alerts: impactStatsData?.total || 0 },
        { month: 'Week 2', impacts: Math.round((impactStatsData?.total || 0) * 0.8), alerts: Math.round((impactStatsData?.total || 0) * 0.9) },
        { month: 'Week 3', impacts: Math.round((impactStatsData?.total || 0) * 0.6), alerts: Math.round((impactStatsData?.total || 0) * 0.7) },
        { month: 'Week 4', impacts: Math.round((impactStatsData?.total || 0) * 0.9), alerts: impactStatsData?.total || 0 },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
    if (!activeStation) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-lg">
          <CardContent className="py-12 text-center">
            <Plane className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Active Station</h2>
            <p className="text-muted-foreground mt-2">
              Please select an airport station before viewing analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Aviation Analytics Dashboard
          </h1>

          <p className="text-muted-foreground mt-1">
            Operational analytics for{" "}
            <span className="font-semibold">
              {activeStation.name}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}

            Refresh
          </Button>

          <Button>

            <Download className="mr-2 h-4 w-4" />

            Export Report

          </Button>

        </div>

      </div>

      {/* KPI Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {kpis.map((kpi) => {

          const Icon = kpi.icon;

          return (

            <Card key={kpi.title}>

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>

                <Icon className={`h-5 w-5 ${kpi.color}`} />

              </CardHeader>

              <CardContent>

                <div className="text-3xl font-bold">

                  {kpi.value}

                </div>

                <div className="flex items-center mt-3">

                  {kpi.change >= 0 ? (

                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />

                  ) : (

                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />

                  )}

                  <span
                    className={
                      kpi.change >= 0
                        ? "text-green-600 text-sm"
                        : "text-red-600 text-sm"
                    }
                  >
                    {Math.abs(kpi.change)}%
                  </span>

                  <span className="text-muted-foreground text-sm ml-2">
                    compared to previous period
                  </span>

                </div>

              </CardContent>

            </Card>

          );

        })}

      </div>

      {/* Summary Cards */}

      <div className="grid gap-6 lg:grid-cols-3">

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <CloudRain className="h-5 w-5" />

              Weather Events

            </CardTitle>

            <CardDescription>

              Current reporting period

            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-3">

            <div className="flex justify-between">

              <span>Thunderstorms</span>

              <Badge variant="destructive">
                17
              </Badge>

            </div>

            <div className="flex justify-between">

              <span>Heavy Rain</span>

              <Badge>
                28
              </Badge>

            </div>

            <div className="flex justify-between">

              <span>Fog Events</span>

              <Badge variant="secondary">
                12
              </Badge>

            </div>

            <div className="flex justify-between">

              <span>Low Visibility</span>

              <Badge variant="outline">
                31
              </Badge>

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <Wind className="h-5 w-5" />

              Wind Summary

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-3">

            <div className="flex justify-between">

              <span>Strong Winds</span>

              <span className="font-semibold">
                24
              </span>

            </div>

            <div className="flex justify-between">

              <span>Crosswind Alerts</span>

              <span className="font-semibold">
                19
              </span>

            </div>

            <div className="flex justify-between">

              <span>Wind Shear</span>

              <span className="font-semibold">
                5
              </span>

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <Calendar className="h-5 w-5" />

              Operational Summary

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-3">

            <div className="flex justify-between">

              <span>Flight Delays</span>

              <span className="font-semibold">
                34
              </span>

            </div>

            <div className="flex justify-between">

              <span>Diversions</span>

              <span className="font-semibold">
                7
              </span>

            </div>

            <div className="flex justify-between">

              <span>Cancelled Flights</span>

              <span className="font-semibold">
                3
              </span>

            </div>

          </CardContent>

        </Card>

      </div>
            {/* Weather Statistics */}

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <BarChart3 className="h-5 w-5" />

              Weather Statistics

            </CardTitle>

            <CardDescription>
              Average values recorded during the selected period
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              {weatherStats.map((stat) => (

                <div
                  key={stat.parameter}
                  className="border rounded-lg p-4"
                >

                  <div className="flex justify-between items-center">

                    <h3 className="font-semibold">
                      {stat.parameter}
                    </h3>

                    <Badge>
                      Average {stat.average}
                    </Badge>

                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">

                    <div>

                      <span className="text-muted-foreground">
                        Minimum
                      </span>

                      <div className="font-bold">
                        {stat.min}
                      </div>

                    </div>

                    <div>

                      <span className="text-muted-foreground">
                        Maximum
                      </span>

                      <div className="font-bold">
                        {stat.max}
                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardHeader>

            <CardTitle>

              Monthly Trend Summary

            </CardTitle>

            <CardDescription>

              Alerts versus operational impacts

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              {monthlyData.map((item) => (

                <div
                  key={item.month}
                  className="border rounded-lg p-4"
                >

                  <div className="flex justify-between items-center">

                    <div>

                      <div className="font-semibold">
                        {item.month}
                      </div>

                    </div>

                    <Badge variant="secondary">
                      {item.alerts} Alerts
                    </Badge>

                  </div>

                  <div className="mt-3">

                    <div className="flex justify-between text-sm mb-1">

                      <span>Operational Impacts</span>

                      <span>{item.impacts}</span>

                    </div>

                    <div className="w-full h-2 rounded bg-muted overflow-hidden">

                      <div
                        className="h-2 bg-primary rounded"
                        style={{
                          width: `${Math.min(
                            item.impacts,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>

      </div>

      {/* Operational Metrics */}

      <Card>

        <CardHeader>

          <CardTitle>

            Aviation Operational Metrics

          </CardTitle>

          <CardDescription>

            Overall airport performance indicators

          </CardDescription>

        </CardHeader>

        <CardContent>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <Card>

              <CardContent className="pt-6 text-center">

                <Plane className="mx-auto h-10 w-10 text-blue-500 mb-3" />

                <div className="text-3xl font-bold">
                  96%
                </div>

                <p className="text-sm text-muted-foreground">
                  Flight Completion Rate
                </p>

              </CardContent>

            </Card>

            <Card>

              <CardContent className="pt-6 text-center">

                <Eye className="mx-auto h-10 w-10 text-green-600 mb-3" />

                <div className="text-3xl font-bold">
                  91%
                </div>

                <p className="text-sm text-muted-foreground">
                  Visibility Compliance
                </p>

              </CardContent>

            </Card>

            <Card>

              <CardContent className="pt-6 text-center">

                <Thermometer className="mx-auto h-10 w-10 text-orange-500 mb-3" />

                <div className="text-3xl font-bold">
                  24°C
                </div>

                <p className="text-sm text-muted-foreground">
                  Average Temperature
                </p>

              </CardContent>

            </Card>

            <Card>

              <CardContent className="pt-6 text-center">

                <AlertTriangle className="mx-auto h-10 w-10 text-red-500 mb-3" />

                <div className="text-3xl font-bold">
                  12
                </div>

                <p className="text-sm text-muted-foreground">
                  Critical Alerts
                </p>

              </CardContent>

            </Card>

          </div>

        </CardContent>

      </Card>

    </div>

  );

};

export default AnalyticsPage;