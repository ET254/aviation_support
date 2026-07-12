import React, { useEffect } from 'react';
import { useAlertStore } from '@/stores/alertStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AlertWidget: React.FC = () => {
  const { alerts, unreadCount, isLoading, setAlerts, setUnreadCount, markRead, setIsLoading } = useAlertStore();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const [alertsResponse, unreadResponse] = await Promise.all([
        api.getAlerts({ limit: 5 }),
        api.getUnreadCount(),
      ]);
      
      setAlerts(alertsResponse.data.data);
      setUnreadCount(unreadResponse.data.data.unread);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      markRead(id);
    } catch (error) {
      console.error('Failed to mark alert read:', error);
      toast.error('Failed to mark alert as read');
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      NORMAL: 'bg-green-500',
      MONITOR: 'bg-yellow-500',
      CAUTION: 'bg-orange-500',
      RESTRICTED: 'bg-red-500',
      SEVERE: 'bg-red-700',
      CRITICAL: 'bg-red-900',
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'WEATHER':
        return <AlertCircle className="h-4 w-4" />;
      case 'SAFETY':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const displayAlerts = alerts.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Alerts</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <CardDescription>
          {alerts.length === 0 ? 'No alerts' : `${alerts.length} total alerts`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayAlerts.length === 0 ? (
          <div className="text-center py-6">
            <BellOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No alerts to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  !alert.readStatus ? 'bg-muted/50 border-primary/20' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">
                          {alert.message}
                        </p>
                        <Badge className={`${getSeverityColor(alert.severity)} text-white text-[10px] px-1.5 py-0`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(alert.timestamp), 'MMM dd HH:mm')}
                      </p>
                    </div>
                  </div>
                  {!alert.readStatus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMarkRead(alert.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {alerts.length > 5 && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/alerts'}>
                View All Alerts
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};