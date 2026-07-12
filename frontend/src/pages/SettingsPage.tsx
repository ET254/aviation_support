import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStationStore } from '@/stores/stationStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/theme-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Save, Loader2, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { activeStation } = useStationStore();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: theme || 'light',
    notifications: {
      email: true,
      sms: false,
      inApp: true,
    },
    dashboard: {
      refreshRate: 30,
      widgets: ['weather', 'forecast', 'alerts', 'impacts'],
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user?.preferences) {
      const prefs = typeof user.preferences === 'string' 
        ? JSON.parse(user.preferences) 
        : user.preferences;
      setPreferences({
        theme: prefs.theme || theme || 'light',
        notifications: prefs.notifications || { email: true, sms: false, inApp: true },
        dashboard: prefs.dashboard || { refreshRate: 30, widgets: ['weather', 'forecast', 'alerts', 'impacts'] },
      });
    }
  }, [user]);

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const prefsToSave = {
        ...preferences,
        theme: preferences.theme,
      };
      
      await api.updatePreferences(prefsToSave);
      
      // Update theme
      setTheme(preferences.theme as 'light' | 'dark');
      
      toast.success('Preferences saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and account settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Customize your dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={preferences.theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                      className="gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                      className="gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dashboard Refresh Rate</Label>
                  <Select
                    value={preferences.dashboard.refreshRate.toString()}
                    onValueChange={(value) => setPreferences({
                      ...preferences,
                      dashboard: { ...preferences.dashboard, refreshRate: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select refresh rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notification Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Email Notifications</span>
                      <Switch
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, email: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SMS Notifications</span>
                      <Switch
                        checked={preferences.notifications.sms}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, sms: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>In-App Notifications</span>
                      <Switch
                        checked={preferences.notifications.inApp}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, inApp: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSavePreferences} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Manage your active sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Active Session</p>
                  <p className="text-sm text-muted-foreground">
                    You are currently logged in as {user?.name}
                  </p>
                </div>
                <Button variant="destructive" className="ml-auto" onClick={() => window.location.href = '/login'}>
                  Logout All Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Information about the system and current environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between p-2 border-b">
                  <span className="text-muted-foreground">Application Name</span>
                  <span className="font-medium">Aviation Impact Dashboard</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="font-medium">
                    {import.meta.env.MODE}
                  </span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span className="text-muted-foreground">API URL</span>
                  <span className="font-medium font-mono text-sm">
                    {import.meta.env.VITE_API_URL}
                  </span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span className="text-muted-foreground">Active Station</span>
                  <span className="font-medium">
                    {activeStation ? `${activeStation.name} (${activeStation.code})` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-muted-foreground">User Role</span>
                  <span className="font-medium">{user?.role}</span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">System Information</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      This is a development environment. Some features may be limited.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};