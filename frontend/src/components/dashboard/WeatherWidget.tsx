import React from 'react';
import { useWeatherStore } from '@/stores/weatherStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Wind, Eye, Droplets, Gauge, CloudRain } from 'lucide-react';
import { format } from 'date-fns';

export const WeatherWidget: React.FC = () => {
  const { currentWeather, isLoading } = useWeatherStore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>Loading weather data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentWeather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
          <CardDescription>No weather data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No current weather data available for this station
          </p>
        </CardContent>
      </Card>
    );
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getVisibilityStatus = (visibility: number) => {
    if (visibility > 10000) return { label: 'Excellent', color: 'bg-green-500' };
    if (visibility > 5000) return { label: 'Good', color: 'bg-green-400' };
    if (visibility > 3000) return { label: 'Moderate', color: 'bg-yellow-500' };
    if (visibility > 1000) return { label: 'Poor', color: 'bg-orange-500' };
    return { label: 'Very Poor', color: 'bg-red-500' };
  };

  const visibilityStatus = currentWeather.visibility ? getVisibilityStatus(currentWeather.visibility) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Current Weather</CardTitle>
          <Badge variant="outline">
            {format(new Date(currentWeather.timestamp), 'HH:mm')}
          </Badge>
        </div>
        <CardDescription>
          Real-time weather conditions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="font-semibold">{currentWeather.temperature?.toFixed(1)}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-semibold">
                {currentWeather.windSpeed?.toFixed(0)} kt
                {currentWeather.windDirection && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {getWindDirection(currentWeather.windDirection)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="font-semibold">
                {currentWeather.visibility?.toFixed(0)}m
                {visibilityStatus && (
                  <Badge className={`ml-1 ${visibilityStatus.color} text-white text-[10px] px-1 py-0`}>
                    {visibilityStatus.label}
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-semibold">{currentWeather.humidity?.toFixed(0)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="font-semibold">{currentWeather.pressureQnh?.toFixed(1)} hPa</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <CloudRain className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Clouds</p>
              <p className="font-semibold">
                {currentWeather.cloudAmount}/8
                {currentWeather.cloudType && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {currentWeather.cloudType}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        {currentWeather.crosswindComponent !== undefined && currentWeather.crosswindComponent !== null && (
          <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Crosswind</p>
                <p className="font-semibold">{currentWeather.crosswindComponent?.toFixed(1)} kt</p>
              </div>
              <div>
                <p className="text-muted-foreground">Headwind</p>
                <p className="font-semibold">{currentWeather.headwindComponent?.toFixed(1)} kt</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tailwind</p>
                <p className="font-semibold">{currentWeather.tailwindComponent?.toFixed(1)} kt</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};