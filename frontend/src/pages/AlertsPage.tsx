import React, { useState, useEffect } from 'react';
import { useAlertStore } from '@/stores/alertStore';
import { useStationStore } from '@/stores/stationStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Loader2, Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { VoiceGuideButton } from '@/components/ui/VoiceGuideButton';

export const AlertsPage: React.FC = () => {
  const { alerts, unreadCount, setAlerts, setUnreadCount, markRead, markAllRead, isLoading, setIsLoading } = useAlertStore();
  const { activeStation } = useStationStore();
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);


  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const [alertsResponse, unreadResponse] = await Promise.all([
        api.getAlerts({ limit: 100 }),
        api.getUnreadCount(),
      ]);
      
      setAlerts(alertsResponse.data.data);
      setUnreadCount(unreadResponse.data.data.unread);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

 const handleMarkRead = async (id: string) => {
  setProcessingId(id);

  try {
    await api.markAlertRead(id);
    markRead(id);
    toast.success('Alert marked as read');
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || 'Failed to mark alert as read'
    );
  } finally {
    setProcessingId(null);
  }
};

  const handleMarkAllRead = async () => {
  setProcessingAll(true);

  try {
    await api.markAllAlertsRead();

    markAllRead();

    toast.success('All alerts marked as read');
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || 'Failed to mark all alerts as read'
    );
  } finally {
    setProcessingAll(false);
  }
};

  const handleAcknowledge = async (id: string) => {
  setProcessingId(id);

  try {
    await api.acknowledgeAlert(id);

    await fetchAlerts();

    toast.success('Alert acknowledged');
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || 'Failed to acknowledge alert'
    );
  } finally {
    setProcessingId(null);
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
      case 'SYSTEM':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'unread') return !alert.readStatus;
    if (activeTab === 'read') return alert.readStatus;
    return true;
  });

  const buildAlertsNarration = () => {
    const stationName = activeStation?.name || 'the selected station';
    const unread = unreadCount;
    const severityCounts = alerts.reduce((acc: Record<string, number>, alert: any) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});
    const topSeverity = Object.entries(severityCounts).sort((a, b) => b[1] - a[1])[0];
    const latestAlert = alerts[0];
    const latestMessage = latestAlert?.message || 'No alert message is currently available.';
    const decisionSupport = unread > 0
      ? `There are ${unread} unread alerts, so the recommended decision support is to review the unread items first and prioritize operational response for the most severe entries.`
      : 'There are no unread alerts at the moment, so routine monitoring is appropriate.';

    return `For ${stationName}, the alert view shows ${alerts.length} total alerts with ${unread} unread. The most common severity is ${topSeverity?.[0] || 'none'}. The latest alert says ${latestMessage}. ${decisionSupport}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'No unread alerts'}
          </p>
        </div>
        <div className="flex gap-2">
          <VoiceGuideButton
            label="Hear alerts details"
            message={buildAlertsNarration()}
          />
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead} disabled={processingAll}>
              {processingAll ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <CheckCircle className="mr-2 h-4 w-4" />
  )}
              Mark All Read
            </Button>
          )}
          <Button onClick={fetchAlerts} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                {filteredAlerts.length} alerts found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} className={!alert.readStatus ? 'bg-muted/50' : ''}>
                      <TableCell>
                        {format(new Date(alert.timestamp), 'MMM dd HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getAlertIcon(alert.type)}
                          <span>{alert.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="line-clamp-2">{alert.message}</span>
                      </TableCell>
                      <TableCell>
                        {alert.readStatus ? (
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Read
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                            <Clock className="mr-1 h-3 w-3" />
                            Unread
                          </Badge>
                        )}
                        {alert.acknowledgedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Acknowledged: {format(new Date(alert.acknowledgedAt), 'MMM dd HH:mm')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!alert.readStatus && (
                            <>
                              <Button
  variant="outline"
  size="sm"
  disabled={processingId === alert.id}
  onClick={() => handleMarkRead(alert.id)}
>
  {processingId === alert.id ? (
    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
  ) : (
    <CheckCircle className="mr-1 h-3 w-3" />
  )}

  Read
</Button>
                              <Button
  variant="outline"
  size="sm"
  disabled={processingId === alert.id}
  onClick={() => handleAcknowledge(alert.id)}
>
  {processingId === alert.id ? (
    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
  ) : (
    <CheckCircle className="mr-1 h-3 w-3" />
  )}

  Acknowledge
</Button>
                            </>
                          )}
                          {alert.actionUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = alert.actionUrl}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <BellOff className="mx-auto h-12 w-12 mb-2" />
                        No alerts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};