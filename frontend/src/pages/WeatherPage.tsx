import React, { useState, useEffect } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, Upload, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const WeatherPage: React.FC = () => {
  const { activeStation } = useStationStore();
  const { currentWeather, historicalData, isLoading, setCurrentWeather, setHistoricalData, setIsLoading } = useWeatherStore();
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
        if (!activeStation || !mounted) return;
        await fetchWeatherData();
    };

    load();

    return () => {
        mounted = false;
    };
}, [activeStation]);

  const fetchWeatherData = async () => {
    if (!activeStation) return;
    
    setIsLoading(true);
    try {
      const [current, historical] = await Promise.all([
        api.getCurrentWeather(activeStation.id),
        api.getHistoricalWeather(activeStation.id, { limit: 48 }),
      ]);
      
      setCurrentWeather(current.data.data);
      setHistoricalData(historical.data.data);
    } catch (error: any) {
  console.error(error);

  toast.error(
    error.response?.data?.message ??
    "Unable to connect to the weather service."
  );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !activeStation) return;
    
    setIsImporting(true);
    try {
      await api.importWeatherData(activeStation.id, file);
      toast.success('Weather data imported successfully');
      await fetchWeatherData();
      setFile(null);
      const input = document.getElementById("file-upload") as HTMLInputElement;

      if (input) {
         input.value = "";
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (!activeStation) return;
    
    try {
      const response = await api.exportCSV({
        stationId: activeStation.id,
        startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        endDate: new Date().toISOString(),
        dataType: 'weather',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weather-data-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV exported successfully');
    } catch (error: any) {
  console.error(error);

  toast.error(
    error.response?.data?.message ??
    "Unable to connect to the weather service."
  );
    }
  };

  const handleExportExcel = async () => {
    if (!activeStation) return;
    
    try {
      const response = await api.exportExcel({
        stationId: activeStation.id,
        startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        endDate: new Date().toISOString(),
        dataType: 'weather',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weather-data-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel exported successfully');
    } catch (error: any) {
  console.error(error);

  toast.error(
    error.response?.data?.message ??
    "Unable to connect to the weather service."
  );
    }
  };

  const formatChartData = () => {
    return historicalData.map(d => ({
      time: format(new Date(d.timestamp), 'HH:mm'),
      temperature: d.temperature || 0,
      windSpeed: d.windSpeed || 0,
      visibility: (d.visibility || 0) / 1000,
      pressure: d.pressureQnh || 0,
    }));
  };

  if (!activeStation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a station to view weather data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weather Data</h1>
          <p className="text-muted-foreground">
            {activeStation.name} ({activeStation.code})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={fetchWeatherData} disabled={isLoading || isImporting}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Conditions</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {currentWeather ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentWeather.temperature?.toFixed(1)}°C</div>
                  <p className="text-xs text-muted-foreground">Dew Point: {currentWeather.dewPoint?.toFixed(1)}°C</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Wind</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentWeather.windSpeed?.toFixed(1)} kt</div>
                  <p className="text-xs text-muted-foreground">
                    Direction: {currentWeather.windDirection?.toFixed(0)}° | Gust: {currentWeather.gustSpeed?.toFixed(1)} kt
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentWeather.visibility?.toFixed(0)} m</div>
                  <p className="text-xs text-muted-foreground">RVR: {currentWeather.rvr?.toFixed(0)} m</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pressure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentWeather.pressureQnh?.toFixed(1)} hPa</div>
                  <p className="text-xs text-muted-foreground">Humidity: {currentWeather.humidity?.toFixed(0)}%</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No weather observations have been received for this station yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle>Historical Weather Data</CardTitle>
              <CardDescription>Last 48 hours of weather observations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                    <p className="text-muted-foreground">
                      Loading weather observations...
                    </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Temp (°C)</TableHead>
                        <TableHead>Wind (kt)</TableHead>
                        <TableHead>Gust (kt)</TableHead>
                        <TableHead>Visibility (m)</TableHead>
                        <TableHead>Pressure (hPa)</TableHead>
                        <TableHead>Humidity (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalData.map((data) => (
                        <TableRow key={data.id}>
                          <TableCell>{format(new Date(data.timestamp), 'MMM dd HH:mm')}</TableCell>
                          <TableCell>{data.temperature?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{data.windSpeed?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{data.gustSpeed?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{data.visibility?.toFixed(0) || '-'}</TableCell>
                          <TableCell>{data.pressureQnh?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{data.humidity?.toFixed(0) || '-'}</TableCell>
                        </TableRow>
                      ))}
                      {historicalData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No weather observations have been recorded for this station yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle>Weather Trends</CardTitle>
              <CardDescription>Visual representation of weather data over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature (°C)" />
                    <Line yAxisId="left" type="monotone" dataKey="windSpeed" stroke="#82ca9d" name="Wind Speed (kt)" />
                    <Line yAxisId="right" type="monotone" dataKey="visibility" stroke="#ffc658" name="Visibility (km)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pressure" fill="#8884d8" name="Pressure (hPa)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Weather Data</CardTitle>
              <CardDescription>
                Upload CSV or Excel files containing weather observations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">Choose a file</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </Label>
                  </div>
                  {file && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-muted-foreground"> ({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleImport} disabled={!file || isImporting}>
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Data
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setFile(null)} disabled={!file}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};