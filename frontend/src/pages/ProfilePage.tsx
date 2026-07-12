import React, { useEffect, useState } from 'react';

import {
  User,
  Lock,
  Save,
  Loader2,
  Shield,
  Building2,
  Mail,
  Calendar,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Badge } from '@/components/ui/badge';

interface ProfileForm {
  name: string;
  email: string;
  role: string;
  station: string;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileForm>({
    name: '',
    email: '',
    role: '',
    station: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name,
      email: user.email,
      role: user.role,
      station: user.station?.name || '',
    });
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);

    try {
      await api.updateUser(user!.id, {
        name: profile.name,
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (
      passwords.newPassword !== passwords.confirmPassword
    ) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await api.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      toast.success('Password changed successfully');

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };
    return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold tracking-tight">
          My Profile
        </h1>

        <p className="text-muted-foreground">
          Manage your account information and security settings.
        </p>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Profile Summary */}

        <Card>

          <CardHeader className="items-center text-center">

            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">

              <User className="h-12 w-12 text-primary" />

            </div>

            <CardTitle className="mt-4">
              {profile.name}
            </CardTitle>

            <CardDescription>
              {profile.email}
            </CardDescription>

            <Badge className="mt-2">
              {profile.role}
            </Badge>

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              <div className="flex items-center gap-3">

                <Mail className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm">
                  {profile.email}
                </span>

              </div>

              <div className="flex items-center gap-3">

                <Building2 className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm">
                  {profile.station || 'No station assigned'}
                </span>

              </div>

              <div className="flex items-center gap-3">

                <Shield className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm">
                  {profile.role}
                </span>

              </div>

              <div className="flex items-center gap-3">

                <Calendar className="h-4 w-4 text-muted-foreground" />

                <span className="text-sm">
                  Aviation Dashboard User
                </span>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Edit Profile */}

        <Card className="lg:col-span-2">

          <CardHeader>

            <CardTitle>
              Profile Information
            </CardTitle>

            <CardDescription>
              Update your personal information.
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="grid gap-5 md:grid-cols-2">

              <div className="space-y-2">

                <Label>
                  Full Name
                </Label>

                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Email
                </Label>

                <Input
                  value={profile.email}
                  disabled
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Role
                </Label>

                <Input
                  value={profile.role}
                  disabled
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Assigned Station
                </Label>

                <Input
                  value={profile.station}
                  disabled
                />

              </div>

            </div>

            <Button
              className="mt-6"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>

          </CardContent>

        </Card>

      </div>
            <div className="grid gap-6 lg:grid-cols-2">

        {/* Change Password */}

        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2">

              <Lock className="h-5 w-5" />

              Change Password

            </CardTitle>

            <CardDescription>

              Update your account password.

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              <div className="space-y-2">

                <Label>
                  Current Password
                </Label>

                <Input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  New Password
                </Label>

                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      newPassword: e.target.value,
                    })
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Confirm New Password
                </Label>

                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                />

              </div>

              <Button
                onClick={changePassword}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>

            </div>

          </CardContent>

        </Card>

        {/* Account Information */}

        <Card>

          <CardHeader>

            <CardTitle>

              Account Information

            </CardTitle>

            <CardDescription>

              Overview of your aviation dashboard account.

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="space-y-5">

              <div className="flex justify-between items-center">

                <span className="text-muted-foreground">

                  User ID

                </span>

                <span className="font-medium">

                  {user?.id}

                </span>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-muted-foreground">

                  Email

                </span>

                <span className="font-medium">

                  {user?.email}

                </span>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-muted-foreground">

                  Role

                </span>

                <Badge>

                  {user?.role}

                </Badge>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-muted-foreground">

                  Assigned Station

                </span>

                <span className="font-medium">

                  {profile.station || 'Not Assigned'}

                </span>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-muted-foreground">

                  Account Status

                </span>

                <Badge className="bg-green-600">

                  Active

                </Badge>

              </div>

              <div className="flex justify-between items-center">

                <span className="text-muted-foreground">

                  Authentication

                </span>

                <Badge variant="outline">

                  JWT Enabled

                </Badge>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>
            <div className="grid gap-6 lg:grid-cols-2">

        {/* User Preferences */}

        <Card>

          <CardHeader>

            <CardTitle>

              User Preferences

            </CardTitle>

            <CardDescription>

              Dashboard settings and future personalization options.

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              <div className="flex justify-between items-center">

                <span>Theme</span>

                <Badge variant="outline">

                  System

                </Badge>

              </div>

              <div className="flex justify-between items-center">

                <span>Email Notifications</span>

                <Badge className="bg-green-600">

                  Enabled

                </Badge>

              </div>

              <div className="flex justify-between items-center">

                <span>SMS Alerts</span>

                <Badge variant="secondary">

                  Disabled

                </Badge>

              </div>

              <div className="flex justify-between items-center">

                <span>Weather Alerts</span>

                <Badge className="bg-green-600">

                  Enabled

                </Badge>

              </div>

              <div className="flex justify-between items-center">

                <span>Impact Notifications</span>

                <Badge className="bg-green-600">

                  Enabled

                </Badge>

              </div>

              <div className="flex justify-between items-center">

                <span>Language</span>

                <Badge variant="outline">

                  English

                </Badge>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Aviation Dashboard Information */}

        <Card>

          <CardHeader>

            <CardTitle>

              Dashboard Information

            </CardTitle>

            <CardDescription>

              Current capabilities of your Aviation Weather Impact Dashboard.

            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="space-y-4">

              <div className="border rounded-lg p-4">

                <h3 className="font-semibold mb-2">

                  Features Available

                </h3>

                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">

                  <li>Weather Monitoring</li>

                  <li>Forecast Management</li>

                  <li>Impact Assessment</li>

                  <li>Threshold Management</li>

                  <li>Alert Notifications</li>

                  <li>Reports & Analytics</li>

                  <li>Airport Maps</li>

                  <li>User Administration</li>

                </ul>

              </div>

              <div className="border rounded-lg p-4">

                <h3 className="font-semibold mb-2">

                  Planned Enhancements

                </h3>

                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">

                  <li>Two-Factor Authentication (2FA)</li>

                  <li>Profile Photo Upload</li>

                  <li>Dark / Light Theme Selection</li>

                  <li>Notification Preferences</li>

                  <li>API Access Tokens</li>

                  <li>Activity Log</li>

                  <li>Session Management</li>

                  <li>Audit History</li>

                </ul>

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
};

export default ProfilePage;