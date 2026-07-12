import React, { useState, useEffect } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ImpactWidget: React.FC = () => {
  const { activeStation } = useStationStore();
  const { user } = useAuth();
  const [impacts, setImpacts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeStation) {
      fetchImpacts();
    }
  }, [activeStation]);

  const fetchImpacts = async () => {
    if (!activeStation) return;
    
    setIsLoading(true);
    try {
      const response = await api.generateImpact(activeStation.id, user?.role);
      setImpacts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch impacts:', error);
    } finally {
      setIsLoading(false);
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'NORMAL':
        return <CheckCircle className="h-4 w-4" />;
      case 'MONITOR':
      case 'CAUTION':
        return <AlertCircle className="h-4 w-4" />;
      case 'RESTRICTED':
      case 'SEVERE':
      case 'CRITICAL':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impact Assessment</CardTitle>
          <CardDescription>Analyzing current conditions...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!impacts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impact Assessment</CardTitle>
          <CardDescription>No impact data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No impact assessment available for this station
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Impact Assessment</CardTitle>
          <Badge className={`${getSeverityColor(impacts.overallSeverity)} text-white px-3 py-1`}>
            {getSeverityIcon(impacts.overallSeverity)}
            <span className="ml-1">{impacts.overallSeverity}</span>
          </Badge>
        </div>
        <CardDescription>
          {impacts.summary}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(impacts.roleImpacts).slice(0, 3).map(([role, data]: [string, any]) => (
            <div key={role} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">{role}</p>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(data.details).length} parameters affected
                </p>
              </div>
              <Badge className={getSeverityColor(data.severity)}>
                {data.severity}
              </Badge>
            </div>
          ))}
          {Object.keys(impacts.roleImpacts).length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{Object.keys(impacts.roleImpacts).length - 3} more roles
            </p>
          )}
          {impacts.recommendations && impacts.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Top Recommendation:</p>
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                <Badge className={`${impacts.recommendations[0].priority === 'critical' ? 'bg-red-600' : 
                  impacts.recommendations[0].priority === 'high' ? 'bg-orange-500' : 
                  impacts.recommendations[0].priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'} text-white`}>
                  {impacts.recommendations[0].priority}
                </Badge>
                <span className="text-sm flex-1">{impacts.recommendations[0].action}</span>
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => window.location.href = '/impacts'}>
            View Full Impact Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};