import React, { useState, useEffect } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';

export const DecisionLadderWidget: React.FC = () => {
  const { activeStation } = useStationStore();
  const { user } = useAuth();
  const [ladder, setLadder] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeStation) {
      fetchLadder();
    }
  }, [activeStation]);

  const fetchLadder = async () => {
    if (!activeStation) return;
    
    setIsLoading(true);
    try {
      const response = await api.getDecisionLadder(activeStation.id, user?.role);
      setLadder(response.data.data);
    } catch (error) {
      console.error('Failed to fetch decision ladder:', error);
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Decision Ladder</CardTitle>
          <CardDescription>Loading decision steps...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Decision Support Ladder</CardTitle>
        <CardDescription>
          {ladder.length === 0 ? 'All conditions normal' : `${ladder.length} decision steps`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ladder.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-green-500 font-medium">✅ All Systems Normal</p>
            <p className="text-xs text-muted-foreground mt-1">No decision steps required</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ladder.slice(0, 3).map((step) => (
              <div key={step.step} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-muted">
                <div className={`w-6 h-6 rounded-full ${getSeverityColor(step.severity)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{step.parameter}</span>
                    <Badge className={getSeverityColor(step.severity)}>
                      {step.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{step.action}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
            {ladder.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{ladder.length - 3} more steps
              </p>
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/impacts'}>
              View Full Ladder
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};