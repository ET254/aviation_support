import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StationsPage } from './pages/StationsPage';
import { WeatherPage } from './pages/WeatherPage';
import { ForecastPage } from './pages/ForecastPage';
import { ImpactsPage } from './pages/ImpactsPage';
import ThresholdsPage from "@/pages/ThresholdsPage";
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import MapsPage from "@/pages/MapsPage";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="aviation-theme">
        <Router>
          <AuthProvider>
            <Routes>

    {/* PUBLIC */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/stations" element={<StationsPage />} />

    {/* PRIVATE */}
    <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/impacts" element={<ImpactsPage />} />
            <Route path="/thresholds" element={<ThresholdsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/maps" element={<MapsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

        </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />

</Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;