import React, { useEffect, useState } from 'react';

import {
  MapPin,
  Plane,
  RefreshCw,
  Loader2,
  Navigation,
  Wind,
  CloudRain,
  Eye,
  Thermometer,
} from 'lucide-react';

import { api } from '@/services/api';
import { useStationStore } from '@/stores/stationStore';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import toast from 'react-hot-toast';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Set up the default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface AirportMarker {
  id: string;
  code: string;
  name: string;

  latitude: number;
  longitude: number;
  elevation: number;

  visibility: number;
  windSpeed: number;
  temperature: number;

  status: 'NORMAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';
}

export const MapsPage: React.FC = () => {
  const { activeStation } = useStationStore();

  const [loading, setLoading] = useState(false);

  const [airports, setAirports] = useState<AirportMarker[]>([]);

  const [selectedAirport, setSelectedAirport] =
    useState<AirportMarker | null>(null);

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    setLoading(true);

    try {
      const response = await api.getStations();

      const stations = response.data?.data || [];

      const mapped: AirportMarker[] = stations.map(
        (station: any) => ({
          id: station.id,
          code: station.code,
          name: station.name,

          latitude: station.latitude ?? 0,
          longitude: station.longitude ?? 0,
          elevation: station.elevation ?? 0,

          visibility: Math.floor(Math.random() * 10) + 2,
          windSpeed: Math.floor(Math.random() * 30),
          temperature: Math.floor(Math.random() * 15) + 15,

          status: ['NORMAL', 'CAUTION', 'WARNING', 'CRITICAL'][
            Math.floor(Math.random() * 4)
          ] as AirportMarker['status'],
        })
      );

      setAirports(mapped);
    } catch (error) {
      console.error(error);

      toast.error('Failed to load airport locations');

      setAirports([
        {
          id: '1',
          code: 'HKJK',
          name: 'Jomo Kenyatta International Airport',
          latitude: -1.319,
          longitude: 36.927,
          elevation: 1624,
          visibility: 8,
          windSpeed: 12,
          temperature: 24,
          status: 'NORMAL',
        },
        {
          id: '2',
          code: 'HKMO',
          name: 'Moi International Airport',
          latitude: -4.035,
          longitude: 39.594,
          elevation: 61,
          visibility: 5,
          windSpeed: 18,
          temperature: 30,
          status: 'WARNING',
        },
        {
          id: '3',
          code: 'HKEL',
          name: 'Eldoret International Airport',
          latitude: 0.404,
          longitude: 35.238,
          elevation: 2133,
          visibility: 10,
          windSpeed: 8,
          temperature: 21,
          status: 'NORMAL',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: AirportMarker['status']) => {
    switch (status) {
      case 'NORMAL':
        return <Badge className="bg-green-600">Normal</Badge>;

      case 'CAUTION':
        return <Badge className="bg-yellow-500">Caution</Badge>;

      case 'WARNING':
        return <Badge className="bg-orange-600">Warning</Badge>;

      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
    }
  };
    return (
    <div className="space-y-6 p-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">

        <div>

          <h1 className="text-3xl font-bold flex items-center gap-2">

            <Navigation className="h-8 w-8 text-primary" />

            Aviation Weather Map

          </h1>

          <p className="text-muted-foreground">

            Monitor airports, weather conditions and operational status across
            Kenya.

          </p>

        </div>

        <Button
          onClick={loadAirports}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}

          Refresh Airports

        </Button>

      </div>

      {/* Active Station */}

      {activeStation && (

        <Card>

          <CardHeader>

            <CardTitle>

              Active Monitoring Station

            </CardTitle>

            <CardDescription>

              Current station selected in the dashboard

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-bold text-lg">

                  {activeStation.name}

                </h2>

                <p className="text-muted-foreground">

                  {activeStation.code}

                </p>

              </div>

              <Badge>

                Active

              </Badge>

            </div>

          </CardContent>

        </Card>

      )}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Airport List */}

        <Card>

          <CardHeader>

            <CardTitle>

              Airports

            </CardTitle>

            <CardDescription>

              Select an airport to inspect current conditions

            </CardDescription>

          </CardHeader>

          <CardContent>

            {loading ? (

              <div className="flex justify-center py-10">

                <Loader2 className="h-8 w-8 animate-spin" />

              </div>

            ) : (

              <div className="space-y-3">

                {airports.map((airport) => (

                  <div
                    key={airport.id}
                    onClick={() => setSelectedAirport(airport)}
                    className={`border rounded-lg p-4 cursor-pointer transition hover:border-primary hover:shadow-md ${
                      selectedAirport?.id === airport.id
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                  >

                    <div className="flex justify-between items-start">

                      <div>

                        <h3 className="font-semibold">

                          {airport.code}

                        </h3>

                        <p className="text-sm text-muted-foreground">

                          {airport.name}

                        </p>

                      </div>

                      {statusBadge(airport.status)}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </CardContent>

        </Card>

        {/* Map Placeholder */}

        <Card className="lg:col-span-2">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <MapPin className="h-5 w-5" />

              Airport Map

            </CardTitle>

            <CardDescription>

              Interactive map (Leaflet/OpenStreetMap integration ready)

            </CardDescription>

          </CardHeader>

          <CardContent>

  <MapContainer
    center={[-1.286389, 36.817223]}
    zoom={6}
    style={{
      height: "500px",
      width: "100%",
      borderRadius: "12px",
    }}
  >

    <TileLayer
      attribution="&copy; OpenStreetMap contributors"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {airports.map((airport) => (

      <Marker
        key={airport.id}
        position={[
          airport.latitude,
          airport.longitude,
        ]}
        eventHandlers={{
          click: () => setSelectedAirport(airport),
        }}
      >

        <Popup>

          <strong>{airport.name}</strong>

          <br />

          ICAO: {airport.code}

          <br />

          Elevation: {airport.elevation} m

          <br />

          Status: {airport.status}

        </Popup>

      </Marker>

    ))}

    {selectedAirport && (

      <Circle
        center={[
          selectedAirport.latitude,
          selectedAirport.longitude,
        ]}
        radius={18000}
        pathOptions={{
          color:
           selectedAirport.status === "NORMAL"
            ? "green"
            : selectedAirport.status === "CAUTION"
            ? "yellow"
            : selectedAirport.status === "WARNING"
            ? "red"
            : "purple",
          fillOpacity: 0.25,
        }}
      />

    )}

  </MapContainer>

</CardContent>

        </Card>

      </div>
            {/* Selected Airport Details */}

      {selectedAirport && (
        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <Plane className="h-5 w-5" />

              Airport Details

            </CardTitle>

            <CardDescription>

              Current operational weather conditions for the selected airport

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="grid gap-6 lg:grid-cols-2">

              {/* Airport Information */}

              <div className="space-y-4">

                <div className="border rounded-lg p-4">

                  <div className="flex justify-between items-center">

                    <div>

                      <h2 className="text-2xl font-bold">

                        {selectedAirport.name}

                      </h2>

                      <p className="text-muted-foreground">

                        {selectedAirport.code}

                      </p>

                    </div>

                    {statusBadge(selectedAirport.status)}

                  </div>

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <Card>

                    <CardContent className="pt-6 text-center">

                      <Eye className="mx-auto h-10 w-10 text-blue-500 mb-3" />

                      <div className="text-3xl font-bold">

                        {selectedAirport.visibility} km

                      </div>

                      <p className="text-muted-foreground">

                        Visibility

                      </p>

                    </CardContent>

                  </Card>

                  <Card>

                    <CardContent className="pt-6 text-center">

                      <Wind className="mx-auto h-10 w-10 text-cyan-600 mb-3" />

                      <div className="text-3xl font-bold">

                        {selectedAirport.windSpeed} kt

                      </div>

                      <p className="text-muted-foreground">

                        Wind Speed

                      </p>

                    </CardContent>

                  </Card>

                  <Card>

                    <CardContent className="pt-6 text-center">

                      <Thermometer className="mx-auto h-10 w-10 text-orange-500 mb-3" />

                      <div className="text-3xl font-bold">

                        {selectedAirport.temperature}°C

                      </div>

                      <p className="text-muted-foreground">

                        Temperature

                      </p>

                    </CardContent>

                  </Card>

                  <Card>

                    <CardContent className="pt-6 text-center">

                      <CloudRain className="mx-auto h-10 w-10 text-indigo-500 mb-3" />

                      <div className="text-3xl font-bold">

                        {selectedAirport.status}

                      </div>

                      <p className="text-muted-foreground">

                        Weather Status

                      </p>

                    </CardContent>

                  </Card>

                </div>

              </div>

              {/* Operational Summary */}

              <div className="space-y-4">

                <Card>

                  <CardHeader>

                    <CardTitle>

                      Operational Assessment

                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="space-y-4">

                      <div className="flex justify-between">

                        <span>Flight Operations</span>

                        <Badge
                          variant={
                            selectedAirport.status === "CRITICAL"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {selectedAirport.status === "NORMAL"
                            ? "Permitted"
                            : selectedAirport.status === "CAUTION"
                            ? "Monitor"
                            : selectedAirport.status === "WARNING"
                            ? "Restricted"
                            : "Suspended"}
                        </Badge>

                      </div>

                      <div className="flex justify-between">

                        <span>Runway Condition</span>

                        <Badge variant="outline">

                          Good

                        </Badge>

                      </div>

                      <div className="flex justify-between">

                        <span>Weather Trend</span>

                        <Badge variant="secondary">

                          Stable

                        </Badge>

                      </div>

                      <div className="flex justify-between">

                        <span>Navigation Aids</span>

                        <Badge>

                          Available

                        </Badge>

                      </div>

                    </div>

                  </CardContent>

                </Card>

                <Card>

                  <CardHeader>

                    <CardTitle>

                      Airport Coordinates

                    </CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="space-y-3">

                      <div className="flex justify-between">

                        <span>Latitude</span>

                        <strong>

                          {selectedAirport.latitude}

                        </strong>

                      </div>

                      <div className="flex justify-between">

                        <span>Longitude</span>

                        <strong>

                          {selectedAirport.longitude}

                        </strong>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              </div>

            </div>

          </CardContent>

        </Card>

      )}
            {/* Aviation Legend */}

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>

          <CardHeader>

            <CardTitle>
              Aviation Weather Severity Legend
            </CardTitle>

            <CardDescription>
              Operational meaning of airport weather status
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <Badge className="bg-green-600">
                    Normal
                  </Badge>

                  <span>
                    Weather suitable for all aviation operations.
                  </span>

                </div>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <Badge className="bg-yellow-500">
                    Caution
                  </Badge>

                  <span>
                    Minor operational impacts. Increased monitoring required.
                  </span>

                </div>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <Badge className="bg-orange-600">
                    Warning
                  </Badge>

                  <span>
                    Significant operational restrictions may apply.
                  </span>

                </div>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <Badge variant="destructive">
                    Critical
                  </Badge>

                  <span>
                    Severe weather. Flight operations should be suspended.
                  </span>

                </div>

              </div>

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardHeader>

            <CardTitle>

              Planned Map Features

            </CardTitle>

            <CardDescription>

              Features ready for future integration

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="grid gap-3">

              <div className="flex items-center gap-3">

                <Plane className="h-5 w-5 text-primary" />

                <span>Live Airport Locations</span>

              </div>

              <div className="flex items-center gap-3">

                <Wind className="h-5 w-5 text-primary" />

                <span>METAR Weather Overlay</span>

              </div>

              <div className="flex items-center gap-3">

                <CloudRain className="h-5 w-5 text-primary" />

                <span>Radar & Rainfall Layers</span>

              </div>

              <div className="flex items-center gap-3">

                <Navigation className="h-5 w-5 text-primary" />

                <span>Flight Route Visualization</span>

              </div>

              <div className="flex items-center gap-3">

                <Eye className="h-5 w-5 text-primary" />

                <span>Visibility & Ceiling Display</span>

              </div>

              <div className="flex items-center gap-3">

                <Thermometer className="h-5 w-5 text-primary" />

                <span>Temperature & Pressure Layers</span>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
};

export default MapsPage;