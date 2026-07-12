import React, { useState, useEffect } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Wind, Thermometer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const ForecastWidget: React.FC = () => {
  const { activeStation } = useStationStore();
  const [forecast, setForecast] = useState<any>(null);
  const [taf, setTaf] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeStation) {
      fetchForecast();
    }
  }, [activeStation]);

  const fetchForecast = async () => {
    if (!activeStation) return;
    
    setIsLoading(true);
    try {
      const [forecastData, tafData] = await Promise.all([
        api.getCurrentForecast(activeStation.id).catch(() => null),
        api.getTAF(activeStation.id).catch(() => null),
      ]);
      
      setForecast(forecastData?.data?.data || null);
      setTaf(tafData?.data?.data || null);
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTurbulenceColor = (turbulence: string) => {
    const colors: Record<string, string> = {
      LIGHT: 'bg-green-500',
      MODERATE: 'bg-yellow-500',
      SEVERE: 'bg-red-500',
    };
    return colors[turbulence] || 'bg-gray-500';
  };

  const getIcingColor = (icing: string) => {
    const colors: Record<string, string> = {
      NONE: 'bg-green-500',
      LIGHT: 'bg-yellow-500',
      MODERATE: 'bg-orange-500',
      SEVERE: 'bg-red-500',
    };
    return colors[icing] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forecast</CardTitle>
          <CardDescription>Loading forecast data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Forecast</CardTitle>
        <CardDescription>
          {forecast ? (
            `Valid until ${format(new Date(forecast.validTo), 'MMM dd HH:mm')}`
          ) : (
            'No active forecast'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {forecast ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Freezing Level</p>
                <p className="font-semibold">
                  {forecast.freezingLevel ? `${forecast.freezingLevel} ft` : 'N/A'}
                </p>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Source</p>
                <Badge variant="outline" className="mt-1">
                  {forecast.source}
                </Badge>
              </div>
            </div>
            {(forecast.turbulenceForecast || forecast.icingForecast) && (
              <div className="grid grid-cols-2 gap-2">
                {forecast.turbulenceForecast && (
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Turbulence</p>
                    <Badge className={`${getTurbulenceColor(forecast.turbulenceForecast)} text-white`}>
                      {forecast.turbulenceForecast}
                    </Badge>
                  </div>
                )}
                {forecast.icingForecast && (
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Icing</p>
                    <Badge className={`${getIcingColor(forecast.icingForecast)} text-white`}>
                      {forecast.icingForecast}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            {taf && (
              <div className="p-2 bg-muted/30 rounded-lg border border-muted">
                <p className="text-xs text-muted-foreground mb-1">TAF</p>
                <p className="text-xs font-mono truncate">{taf.taf}</p>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Valid from: {format(new Date(forecast.validFrom), 'MMM dd HH:mm')}</span>
              <span>Valid to: {format(new Date(forecast.validTo), 'MMM dd HH:mm')}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Cloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No forecast data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};