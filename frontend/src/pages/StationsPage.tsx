import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plane } from "lucide-react";
import { api } from "@/services/api";
import { useStationStore } from "@/stores/stationStore";
import { useAuth } from '@/contexts/AuthContext';
import type { Station } from "@/types";

export const StationsPage = () => {
  const navigate = useNavigate();

  const { setActiveStation } = useStationStore();
  const { isAuthenticated } = useAuth();

  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const response = await api.getStations();

      setStations(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter((station) => {
    return (
      station.name.toLowerCase().includes(search.toLowerCase()) ||
      station.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const chooseStation = (station: Station) => {
    setActiveStation(station);

    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="bg-blue-900 text-white py-10">

        <div className="max-w-6xl mx-auto px-6">

          <h1 className="text-4xl font-bold">
            Choose Your Aviation Weather Station
          </h1>

          <p className="mt-2 opacity-80">
            Select the airport or aerodrome you want to monitor.
          </p>

        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="relative mb-8">

          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-500"/>

          <input
            className="w-full rounded-lg border pl-12 pr-4 py-3"
            placeholder="Search airport..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

        </div>

        {loading ? (

          <div className="text-center py-20">

            Loading stations...

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredStations.map((station)=>(

              <div
                key={station.id}
                className="rounded-xl bg-white shadow-lg overflow-hidden"
              >

                <img
                  src="https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=900"
                  className="h-48 w-full object-cover"
                />

                <div className="p-5">

                  <div className="flex items-center gap-2">

                    <Plane className="w-5 h-5 text-blue-700"/>

                    <h2 className="font-bold text-lg">
                      {station.name}
                    </h2>

                  </div>

                  <div className="mt-4 space-y-2 text-sm">

                    <p><strong>ICAO:</strong> {station.code}</p>

                    <p><strong>WMO:</strong> {station.wmoId || "-"}</p>

                    <p><strong>Elevation:</strong> {station.elevation || "-"} m</p>

                    <p><strong>Category:</strong> {station.category}</p>

                  </div>

                  <button

                    onClick={()=>chooseStation(station)}

                    className="mt-6 w-full rounded-lg bg-blue-700 hover:bg-blue-800 text-white py-3"

                  >
                    Choose Station
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};