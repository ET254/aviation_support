import { useNavigate } from "react-router-dom";
import {
  Plane,
  CloudSun,
  ShieldCheck,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 opacity-95" />

        <div className="relative max-w-7xl mx-auto px-8 py-28">

          <div className="max-w-3xl">

            <div className="flex items-center gap-3 mb-8">

              <Plane className="w-10 h-10 text-cyan-400"/>

              <h1 className="text-5xl font-bold">
                Aviation Weather Impact
                <br />
                Decision Support System
              </h1>

            </div>

            <p className="text-xl text-slate-300 leading-8">

              A modern aviation weather platform providing
              real-time observations,
              forecasts,
              operational impacts,
              alerts,
              and decision support for
              airports,
              airstrips,
              airlines,
              pilots,
              ATC,
              dispatchers,
              and meteorologists.

            </p>

            <div className="mt-10 flex gap-4">

              <button
                onClick={() => navigate("/stations")}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-600 px-8 py-4 text-lg font-semibold flex items-center gap-3"
              >
                Choose Station
                <ArrowRight size={20}/>
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* Statistics */}

      <section className="max-w-7xl mx-auto px-8 py-16">

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-slate-900 rounded-xl p-6">

            <CloudSun className="text-cyan-400 mb-4"/>

            <h2 className="text-3xl font-bold">38</h2>

            <p className="text-slate-400">
              Active Weather Stations
            </p>

          </div>

          <div className="bg-slate-900 rounded-xl p-6">

            <Activity className="text-green-400 mb-4"/>

            <h2 className="text-3xl font-bold">
              1,248
            </h2>

            <p className="text-slate-400">
              Today's Observations
            </p>

          </div>

          <div className="bg-slate-900 rounded-xl p-6">

            <Plane className="text-yellow-400 mb-4"/>

            <h2 className="text-3xl font-bold">

              14

            </h2>

            <p className="text-slate-400">

              Active Forecasts

            </p>

          </div>

          <div className="bg-slate-900 rounded-xl p-6">

            <ShieldCheck className="text-red-400 mb-4"/>

            <h2 className="text-3xl font-bold">

              2

            </h2>

            <p className="text-slate-400">

              Operational Alerts

            </p>

          </div>

        </div>

      </section>

      {/* Features */}

      <section className="max-w-7xl mx-auto px-8 pb-24">

        <h2 className="text-3xl font-bold mb-10">

          Platform Capabilities

        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-slate-900 rounded-xl p-6">

            <h3 className="font-bold text-xl mb-4">
              Weather Monitoring
            </h3>

            <ul className="space-y-2 text-slate-300">

              <li>✔ Surface observations</li>
              <li>✔ METAR</li>
              <li>✔ SYNOP</li>
              <li>✔ Visibility</li>
              <li>✔ Wind</li>

            </ul>

          </div>

          <div className="bg-slate-900 rounded-xl p-6">

            <h3 className="font-bold text-xl mb-4">

              Forecasting

            </h3>

            <ul className="space-y-2 text-slate-300">

              <li>✔ TAF</li>
              <li>✔ SIGMET</li>
              <li>✔ Upper Air</li>
              <li>✔ Radar</li>
              <li>✔ Satellite</li>

            </ul>

          </div>

          <div className="bg-slate-900 rounded-xl p-6">

            <h3 className="font-bold text-xl mb-4">

              Decision Support

            </h3>

            <ul className="space-y-2 text-slate-300">

              <li>✔ Threshold Monitoring</li>
              <li>✔ Operational Impacts</li>
              <li>✔ Alerts</li>
              <li>✔ Risk Assessment</li>
              <li>✔ Decision Ladder</li>

            </ul>

          </div>

        </div>

      </section>

    </div>
  );
}