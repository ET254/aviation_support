import React, { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Filter,
} from 'lucide-react';

import { api } from '@/services/api';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

import toast from 'react-hot-toast';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  createdAt: string;
  role?: string;
}

export const NotificationsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);

    try {
      const response = await api.getAlerts();

      const data = response.data?.data || [];

      setAlerts(data);

    } catch (error) {
      console.error(error);

      toast.error('Failed to load notifications');

      // Demo data

      setAlerts([
        {
          id: '1',
          title: 'Low Visibility',
          message: 'Visibility below operational threshold.',
          severity: 'HIGH',
          isRead: false,
          createdAt: new Date().toISOString(),
          role: 'PILOT',
        },
        {
          id: '2',
          title: 'Strong Crosswind',
          message: 'Crosswind exceeds runway limits.',
          severity: 'CRITICAL',
          isRead: false,
          createdAt: new Date().toISOString(),
          role: 'ATC',
        },
        {
          id: '3',
          title: 'Heavy Rain',
          message: 'Heavy rainfall expected within one hour.',
          severity: 'MEDIUM',
          isRead: true,
          createdAt: new Date().toISOString(),
          role: 'OPERATIONS',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markAlertRead(id);

      setAlerts((previous) =>
        previous.map((alert) =>
          alert.id === id
            ? { ...alert, isRead: true }
            : alert
        )
      );

      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteAlert(id);

      setAlerts((previous) =>
        previous.filter((alert) => alert.id !== id)
      );

      toast.success('Notification deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllAlertsRead();

      setAlerts((previous) =>
        previous.map((alert) => ({
          ...alert,
          isRead: true,
        }))
      );

      toast.success('All notifications marked as read');
    } catch {
      toast.error('Operation failed');
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const severityMatch =
      severityFilter === 'ALL'
        ? true
        : alert.severity === severityFilter;

    const unreadMatch =
      showUnreadOnly
        ? !alert.isRead
        : true;

    return severityMatch && unreadMatch;
  });

  const unreadCount = alerts.filter(
    (a) => !a.isRead
  ).length;
    return (
    <div className="space-y-6 p-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">

        <div>

          <h1 className="text-3xl font-bold flex items-center gap-2">

            <Bell className="h-8 w-8 text-primary" />

            Notifications

          </h1>

          <p className="text-muted-foreground">

            Aviation alerts, warnings and operational notifications

          </p>

        </div>

        <div className="flex gap-3 flex-wrap">

          <Button
            variant="outline"
            onClick={loadAlerts}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}

            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={markAllRead}
          >
            <CheckCircle className="h-4 w-4 mr-2" />

            Mark All Read

          </Button>

        </div>

      </div>

      {/* Summary */}

      <div className="grid gap-4 md:grid-cols-3">

        <Card>

          <CardContent className="pt-6">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-muted-foreground text-sm">

                  Total Notifications

                </p>

                <h2 className="text-3xl font-bold">

                  {alerts.length}

                </h2>

              </div>

              <Bell className="h-10 w-10 text-blue-500" />

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardContent className="pt-6">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-muted-foreground text-sm">

                  Unread

                </p>

                <h2 className="text-3xl font-bold">

                  {unreadCount}

                </h2>

              </div>

              <AlertTriangle className="h-10 w-10 text-red-500" />

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardContent className="pt-6">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-muted-foreground text-sm">

                  Read

                </p>

                <h2 className="text-3xl font-bold">

                  {alerts.length - unreadCount}

                </h2>

              </div>

              <CheckCircle className="h-10 w-10 text-green-500" />

            </div>

          </CardContent>

        </Card>

      </div>

      {/* Filters */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Filter className="h-5 w-5" />

            Filters

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="flex flex-wrap gap-4">

            <div className="w-56">

              <Select
                value={severityFilter}
                onValueChange={setSeverityFilter}
              >

                <SelectTrigger>

                  <SelectValue />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="ALL">
                    All Severities
                  </SelectItem>

                  <SelectItem value="LOW">
                    Low
                  </SelectItem>

                  <SelectItem value="MEDIUM">
                    Medium
                  </SelectItem>

                  <SelectItem value="HIGH">
                    High
                  </SelectItem>

                  <SelectItem value="CRITICAL">
                    Critical
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              onClick={() =>
                setShowUnreadOnly(!showUnreadOnly)
              }
            >
              {showUnreadOnly ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Showing Unread
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Unread Only
                </>
              )}
            </Button>

          </div>

        </CardContent>

      </Card>

      {/* Notifications List */}

      <Card>

        <CardHeader>

          <CardTitle>

            Notification Center

          </CardTitle>

          <CardDescription>

            Latest aviation alerts and system messages

          </CardDescription>

        </CardHeader>

        <CardContent>

          {loading ? (

            <div className="flex justify-center py-16">

              <Loader2 className="h-10 w-10 animate-spin" />

            </div>

          ) : filteredAlerts.length === 0 ? (

            <div className="text-center py-12">

              <Bell className="mx-auto h-14 w-14 text-muted-foreground mb-4" />

              <h3 className="font-semibold text-lg">

                No notifications found

              </h3>

              <p className="text-muted-foreground">

                Try changing your filters.

              </p>

            </div>

          ) : (

            <div className="space-y-4">
                              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 transition-all ${
                    alert.isRead
                      ? 'bg-muted/30'
                      : 'bg-background border-primary/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2 mb-2">

                        <h3 className="font-semibold">
                          {alert.title}
                        </h3>

                        <Badge
                          variant={
                            alert.severity === 'CRITICAL'
                              ? 'destructive'
                              : alert.severity === 'HIGH'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {alert.severity}
                        </Badge>

                        {!alert.isRead && (
                          <Badge variant="outline">
                            NEW
                          </Badge>
                        )}

                        {alert.role && (
                          <Badge variant="outline">
                            {alert.role}
                          </Badge>
                        )}

                      </div>

                      <p className="text-muted-foreground">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">

                        <Clock className="h-4 w-4" />

                        {new Date(alert.createdAt).toLocaleString()}

                      </div>

                    </div>

                    <div className="flex flex-col gap-2">

                      {!alert.isRead && (

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Read
                        </Button>

                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteNotification(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>

                    </div>

                  </div>
                </div>
              ))}

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  );
};

export default NotificationsPage;