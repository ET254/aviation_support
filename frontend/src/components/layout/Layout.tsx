import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStationStore } from '@/stores/stationStore';
import { useAlertStore } from '@/stores/alertStore';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  MapPin,
  Map,
  Cloud,
  CloudRain,
  AlertTriangle,
  Activity,
  Bell,
  BellDot,
  FileText,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Plane,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },

  { name: 'Stations', href: '/stations', icon: MapPin },

  { name: 'Weather', href: '/weather', icon: Cloud },

  { name: 'Forecast', href: '/forecast', icon: CloudRain },

  { name: 'Impacts', href: '/impacts', icon: AlertTriangle },

  { name: 'Analytics', href: '/analytics', icon: Activity },

  { name: 'Notifications', href: '/notifications', icon: BellDot },

  { name: 'Maps', href: '/maps', icon: Map },

  { name: 'Alerts', href: '/alerts', icon: Bell },

  { name: 'Reports', href: '/reports', icon: FileText },

  { name: 'Users', href: '/users', icon: Users },

  { name: 'Profile', href: '/profile', icon: User },

  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeStation } = useStationStore();
  const { unreadCount } = useAlertStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Aviation Dashboard</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = window.location.pathname === item.href;
              const isAlerts = item.name === 'Alerts';
              
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isAlerts && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                {activeStation && (
                  <p className="text-xs text-muted-foreground truncate">
                    {activeStation.code}
                  </p>
                )}
              </div>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-red-500 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {navigation.find(n => n.href === window.location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/alerts')}
              >
                <BellDot className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            )}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};