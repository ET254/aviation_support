import React, { useState, useEffect } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, RefreshCw, Loader2, Plus, Edit, Trash2, Cloud, Wind, Thermometer } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const ForecastPage: React.FC = () => {
  const { activeStation } = useStationStore();
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [currentForecast, setCurrentForecast] = useState<any>(null);
  const [taf, setTaf] = useState<any>(null);
  const [sigmet, setSigmet] = useState<any>(null);
  const [upperAir, setUpperAir] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForecast, setEditingForecast] = useState<any>(null);
  const [formData, setFormData] = useState({
    validFrom: '',
    validTo: '',
    taf: '',
    sigmetData: '',
    upperWind: '',
    upperTemp: '',
    freezingLevel: '',
    turbulenceForecast: '',
    icingForecast: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  if (!activeStation?.id) return;

  fetchForecastData();
}, [activeStation?.id]);

  const fetchForecastData = async () => {
    if (!activeStation) return;
    
    setIsLoading(true);
    try {
      const [current, tafData, sigmetData, upperAirData, timeline] = await Promise.all([
        api.getCurrentForecast(activeStation.id).catch(() => null),
        api.getTAF(activeStation.id).catch(() => null),
        api.getSIGMET(activeStation.id).catch(() => null),
        api.getUpperAir(activeStation.id).catch(() => null),
        api.getForecastTimeline(activeStation.id, { hours: 24 }).catch(() => null),
      ]);

      setCurrentForecast(current?.data?.data || null);
      setTaf(tafData?.data?.data || null);
      setSigmet(sigmetData?.data?.data || null);
      setUpperAir(upperAirData?.data?.data || null);
      setForecasts(timeline?.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch forecast data:', error);
      toast.error('Failed to load forecast data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!activeStation) {
  toast.error("Please select an active station first.");
  return;
}
  if (!formData.validFrom || !formData.validTo) {
  toast.error("Please select both Valid From and Valid To.");
  return;
}

if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
  toast.error("Valid To must be after Valid From.");
  return;
}

  let sigmetData;
  let upperWind;
  let upperTemp;

  // Validate JSON fields first
  try {
    sigmetData = formData.sigmetData
      ? JSON.parse(formData.sigmetData)
      : undefined;

    upperWind = formData.upperWind
      ? JSON.parse(formData.upperWind)
      : undefined;

    upperTemp = formData.upperTemp
      ? JSON.parse(formData.upperTemp)
      : undefined;
  } catch (err) {
    toast.error('One or more JSON fields contain invalid JSON.');
    return;
  }

  setIsSaving(true);

  try {
    const data = {
      ...formData,
      stationId: activeStation.id,
      validFrom: new Date(formData.validFrom),
      validTo: new Date(formData.validTo),
      freezingLevel: formData.freezingLevel
        ? parseFloat(formData.freezingLevel)
        : undefined,
      sigmetData,
      upperWind,
      upperTemp,
    };

    if (editingForecast) {
      await api.updateForecast(editingForecast.id, data);
      toast.success('Forecast updated successfully');
    } else {
      await api.createForecast(data);
      toast.success('Forecast created successfully');
    }

    await fetchForecastData();
    setIsDialogOpen(false);
    resetForm();
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to save forecast'
    );
  }
};

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this forecast?')) return;
    
    try {
      await api.deleteForecast(id);
      toast.success('Forecast deleted successfully');
      await fetchForecastData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete forecast');
    }
  };

  const handleImportNetCDF = async () => {
  if (!activeStation) {
    toast.error("Please select an active station first.");
    return;
  }

  if (!file) {
    toast.error("Please select a NetCDF file to import.");
    return;
  }

  setIsImporting(true);

  try {
    await api.importNetCDF(activeStation.id, file);

    toast.success("NetCDF data imported successfully.");

    await fetchForecastData();

    // Clear the selected file
    setFile(null);

  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to import NetCDF data."
    );
  } finally {
    setIsImporting(false);
  }
};
  const resetForm = () => {
    setFormData({
      validFrom: '',
      validTo: '',
      taf: '',
      sigmetData: '',
      upperWind: '',
      upperTemp: '',
      freezingLevel: '',
      turbulenceForecast: '',
      icingForecast: '',
    });
    setEditingForecast(null);
  };

  const openEditDialog = (forecast: any) => {
    setEditingForecast(forecast);
    setFormData({
      validFrom: format(new Date(forecast.validFrom), "yyyy-MM-dd'T'HH:mm"),
      validTo: format(new Date(forecast.validTo), "yyyy-MM-dd'T'HH:mm"),
      taf: forecast.taf || '',
      sigmetData: forecast.sigmetData ? JSON.stringify(forecast.sigmetData, null, 2) : '',
      upperWind: forecast.upperWind ? JSON.stringify(forecast.upperWind, null, 2) : '',
      upperTemp: forecast.upperTemp ? JSON.stringify(forecast.upperTemp, null, 2) : '',
      freezingLevel: forecast.freezingLevel?.toString() || '',
      turbulenceForecast: forecast.turbulenceForecast || '',
      icingForecast: forecast.icingForecast || '',
    });
    setIsDialogOpen(true);
  };

  if (!activeStation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a station to view forecast data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forecast Data</h1>
          <p className="text-muted-foreground">
            {activeStation.name} ({activeStation.code})
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingForecast ? 'Edit Forecast' : 'Add New Forecast'}</DialogTitle>
                <DialogDescription>
                  Enter the forecast details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="validFrom">Valid From *</Label>
                      <Input
                        id="validFrom"
                        type="datetime-local"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validTo">Valid To *</Label>
                      <Input
                        id="validTo"
                        type="datetime-local"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taf">TAF</Label>
                    <Textarea
                      id="taf"
                      value={formData.taf}
                      onChange={(e) => setFormData({ ...formData, taf: e.target.value })}
                      placeholder="Enter TAF data"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sigmetData">SIGMET Data (JSON)</Label>
                    <Textarea
                      id="sigmetData"
                      value={formData.sigmetData}
                      onChange={(e) => setFormData({ ...formData, sigmetData: e.target.value })}
                      placeholder='{"type": "TS", "severity": "SEV"}'
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freezingLevel">Freezing Level (ft)</Label>
                      <Input
                        id="freezingLevel"
                        type="number"
                        value={formData.freezingLevel}
                        onChange={(e) => setFormData({ ...formData, freezingLevel: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="turbulenceForecast">Turbulence</Label>
                      <Input
                        id="turbulenceForecast"
                        value={formData.turbulenceForecast}
                        onChange={(e) => setFormData({ ...formData, turbulenceForecast: e.target.value })}
                        placeholder="LIGHT/MODERATE/SEVERE"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icingForecast">Icing</Label>
                      <Input
                        id="icingForecast"
                        value={formData.icingForecast}
                        onChange={(e) => setFormData({ ...formData, icingForecast: e.target.value })}
                        placeholder="NONE/LIGHT/MODERATE"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upperWind">Upper Wind Data (JSON)</Label>
                    <Textarea
                      id="upperWind"
                      value={formData.upperWind}
                      onChange={(e) => setFormData({ ...formData, upperWind: e.target.value })}
                      placeholder='{"850": {"direction": 230, "speed": 25}}'
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upperTemp">Upper Temperature Data (JSON)</Label>
                    <Textarea
                      id="upperTemp"
                      value={formData.upperTemp}
                      onChange={(e) => setFormData({ ...formData, upperTemp: e.target.value })}
                      placeholder='{"850": 10.5, "700": 2.3}'
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingForecast ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button onClick={fetchForecastData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Forecast</TabsTrigger>
          <TabsTrigger value="taf">TAF</TabsTrigger>
          <TabsTrigger value="sigmet">SIGMET</TabsTrigger>
          <TabsTrigger value="upper-air">Upper Air</TabsTrigger>
          <TabsTrigger value="import">Import NetCDF</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {currentForecast ? (
            <Card>
              <CardHeader>
                <CardTitle>Active Forecast</CardTitle>
                <CardDescription>
                  Valid from {format(new Date(currentForecast.validFrom), 'MMM dd HH:mm')} to {format(new Date(currentForecast.validTo), 'MMM dd HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Freezing Level</h4>
                    <p>{currentForecast.freezingLevel ? `${currentForecast.freezingLevel} ft` : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Turbulence</h4>
                    <Badge variant={currentForecast.turbulenceForecast === 'SEVERE' ? 'destructive' : 'default'}>
                      {currentForecast.turbulenceForecast || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Icing</h4>
                    <Badge variant={currentForecast.icingForecast === 'MODERATE' || currentForecast.icingForecast === 'SEVERE' ? 'destructive' : 'default'}>
                      {currentForecast.icingForecast || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Source</h4>
                    <Badge variant="outline">{currentForecast.source}</Badge>
                  </div>
                </div>
                {currentForecast.taf && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">TAF</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      {currentForecast.taf}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(currentForecast)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(currentForecast.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active forecast available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="taf">
          {taf ? (
            <Card>
              <CardHeader>
                <CardTitle>Terminal Aerodrome Forecast (TAF)</CardTitle>
                <CardDescription>
                  Valid from {format(new Date(taf.validFrom), 'MMM dd HH:mm')} to {format(new Date(taf.validTo), 'MMM dd HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {taf.taf}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No TAF available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sigmet">
          {sigmet ? (
            <Card>
              <CardHeader>
                <CardTitle>SIGMET Warnings</CardTitle>
                <CardDescription>Significant Meteorological Information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(sigmet) ? (
                    sigmet.map((s, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant={s.severity === 'SEV' ? 'destructive' : 'default'}>
                            {s.type} - {s.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(s.validFrom), 'MMM dd HH:mm')} - {format(new Date(s.validTo), 'MMM dd HH:mm')}
                          </span>
                        </div>
                        <p className="mt-2">{s.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                      {JSON.stringify(sigmet, null, 2)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No SIGMET warnings available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upper-air">
          {upperAir ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upper Wind</CardTitle>
                  <CardDescription>Wind speed and direction at various levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level (hPa)</TableHead>
                        <TableHead>Direction (°)</TableHead>
                        <TableHead>Speed (kt)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upperAir.upperWind && Object.entries(upperAir.upperWind).map(([level, data]: [string, any]) => (
                        <TableRow key={level}>
                          <TableCell>{level}</TableCell>
                          <TableCell>{data.direction}</TableCell>
                          <TableCell>{data.speed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Upper Temperature</CardTitle>
                  <CardDescription>Temperature at various pressure levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level (hPa)</TableHead>
                        <TableHead>Temperature (°C)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upperAir.upperTemp && Object.entries(upperAir.upperTemp).map(([level, temp]: [string, any]) => (
                        <TableRow key={level}>
                          <TableCell>{level}</TableCell>
                          <TableCell>{temp.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No upper air data available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import NetCDF Forecast Data</CardTitle>
              <CardDescription>
                Upload NetCDF files containing forecast data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Cloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Label htmlFor="netcdf-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">Choose a NetCDF file</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                      <Input
                        id="netcdf-upload"
                        type="file"
                        accept=".nc,.netcdf"
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
                  <Button onClick={handleImportNetCDF} disabled={!file || isImporting}>
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import NetCDF
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

      {forecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Forecast Timeline</CardTitle>
            <CardDescription>24-hour forecast timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Wind</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Cloud</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.map((point, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(point.timestamp), 'HH:mm')}</TableCell>
                    <TableCell>{point.conditions?.status || 'N/A'}</TableCell>
                    <TableCell>
                      {point.conditions?.windSpeed ? `${point.conditions.windSpeed} kt` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {point.conditions?.visibility ? `${point.conditions.visibility} m` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {point.conditions?.cloudType || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};