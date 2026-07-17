import React, { useState, useEffect } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Loader2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { VoiceGuideButton } from '@/components/ui/VoiceGuideButton';

export const ImpactsPage: React.FC = () => {
  const { activeStation } = useStationStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || '');
  interface ImpactSummary {
  overallSeverity: string;
  summary: string;
  roleImpacts: Record<string, any>;
}

interface ImpactLog {
  id: string;
  timestamp: string;
  eventType: string;
  severity: string;
  description: string;
  isResolved: boolean;
  actionTaken?: string;
}

interface DecisionStep {
  step: number;
  parameter: string;
  severity: string;
  value: number | string;
  threshold: {
    min?: number;
    max?: number;
  };
  action: string;
}

interface ActionRecommendation {
  priority: string;
  action: string;
  role?: string;
}

interface ImpactStats {
  total: number;
  bySeverity: {
    severity: string;
    count: number;
    percentage: number;
  }[];
}

const [impacts, setImpacts] = useState<ImpactSummary | null>(null);

const [logs, setLogs] = useState<ImpactLog[]>([]);

const [ladder, setLadder] = useState<DecisionStep[]>([]);

const [actions, setActions] = useState<ActionRecommendation[]>([]);

const [stats, setStats] = useState<ImpactStats | null>(null);
  useEffect(() => {
  if (!activeStation?.id) return;

  fetchImpacts();

  const interval = setInterval(() => {
    fetchImpacts();
  }, 60000); // Refresh every 60 seconds

  return () => clearInterval(interval);
}, [activeStation?.id, selectedRole]);

  const fetchImpacts = async () => {
    if (!activeStation || isLoading) return;
    
    setIsLoading(true);
    try {
      const [
  impactData,
  logsData,
  ladderData,
  actionsData,
  statsData,
] = await Promise.allSettled([
  api.generateImpact(activeStation.id, selectedRole),
  api.getImpactLogs({
    stationId: activeStation.id,
    limit: 50,
  }),
  api.getDecisionLadder(activeStation.id, selectedRole),
  api.getActionRecommendations(activeStation.id, selectedRole),
  api.getImpactStats(activeStation.id, {
    days: 7,
  }),
]);

      setImpacts(
  impactData.status === 'fulfilled'
    ? impactData.value.data.data
    : null
);

setLogs(
  logsData.status === 'fulfilled'
    ? logsData.value.data.data
    : []
);

setLadder(
  ladderData.status === 'fulfilled'
    ? ladderData.value.data.data
    : []
);

setActions(
  actionsData.status === 'fulfilled'
    ? actionsData.value.data.data
    : []
);

setStats(
  statsData.status === 'fulfilled'
    ? statsData.value.data.data
    : null
);
    } catch (error: any) {
  toast.error(
    error.response?.data?.message ||
    'Failed to load impact data'
  );
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

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };
    return colors[priority] || 'bg-gray-500';
  };

  const buildImpactNarration = () => {
    const stationName = activeStation?.name || 'the selected station';
    const severity = impacts?.overallSeverity || 'unknown';
    const summary = impacts?.summary || 'No detailed impact summary is available yet.';
    const roleEntries = Object.entries(impacts?.roleImpacts || {});
    const topRole = roleEntries[0];
    const topAction = actions[0]?.action || 'No immediate action has been posted yet.';
    const severeCount = stats?.bySeverity?.filter((entry: any) => ['SEVERE', 'CRITICAL'].includes(entry.severity)).reduce((total: number, entry: any) => total + entry.count, 0) || 0;
    const recentLog = logs[0]?.description || 'No recent impact log is available.';
    const roleNote = topRole
      ? `The most relevant role impact is for ${topRole[0]}, which is currently ${topRole[1]?.severity || 'unclear'}.`
      : 'There is no role-specific impact detail available yet.';
    const decisionSupport = severeCount > 0
      ? `Because ${severeCount} severe or critical impact entries are present, the recommended decision support is to prioritize safety actions, review the decision ladder, and follow the top recommended response immediately.`
      : 'The current impact picture appears stable, so routine monitoring and continued review are appropriate.';

    return `For ${stationName}, the impact assessment reports an overall severity of ${severity}. ${summary} ${roleNote} The latest operational log says ${recentLog}. The recommended next step is ${topAction}. ${decisionSupport}`;
  };

  if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

  if (!activeStation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a station to view impact data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impact Assessment</h1>
          <p className="text-muted-foreground">
            {activeStation.name} ({activeStation.code})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <VoiceGuideButton
            label="Hear impact details"
            message={buildImpactNarration()}
          />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="METEOROLOGIST">Meteorologist</SelectItem>
              <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
              <SelectItem value="PILOT">Pilot</SelectItem>
              <SelectItem value="ATC">ATC</SelectItem>
              <SelectItem value="OPERATIONS">Operations</SelectItem>
              <SelectItem value="GROUND_HANDLER">Ground Handler</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchImpacts} disabled={isLoading}>
            {isLoading ? (
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
) : (
  <RefreshCw className="mr-2 h-4 w-4" />
)}
            Refresh
          </Button>
        </div>
      </div>

      {impacts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Impact Assessment</span>
              <Badge className={`${getSeverityColor(impacts.overallSeverity)} text-white px-4 py-2`}>
                {impacts.overallSeverity}
              </Badge>
            </CardTitle>
            <CardDescription>{impacts.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Role-Specific Impacts</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.keys(impacts.roleImpacts ?? {}).length > 0 ? (
  <div className="grid gap-4 md:grid-cols-2">
    {Object.entries(impacts.roleImpacts).map(([role, data]: [string, any]) => (
      <div key={role} className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{role}</span>

          <Badge className={getSeverityColor(data.severity)}>
            {data.severity}
          </Badge>
        </div>

        <div className="space-y-1 text-sm">
          {Object.entries(data.details ?? {}).map(([key, value]: [string, any]) => (
            <div
              key={key}
              className="flex justify-between"
            >
              <span className="text-muted-foreground">
                {key}:
              </span>

              <span
                className={
                  value.breached
                    ? "text-red-500 font-medium"
                    : ""
                }
              >
                {value.value}
                {value.breached && " ⚠️"}
              </span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="py-8 text-center text-muted-foreground">
    No role-specific impacts found.
  </div>
)}
                </div>
              </div>

              {actions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Action Recommendations</h4>
                  <div className="space-y-2">
                    {actions.map((action, index) => (
                      <div key={index} className="flex items-center gap-3 border rounded-lg p-3">
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <span className="flex-1">{action.action}</span>
                        <Badge variant="outline">{action.role || 'ALL'}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ladder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ladder">Decision Ladder</TabsTrigger>
          <TabsTrigger value="logs">Impact Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="ladder">
          <Card>
            <CardHeader>
              <CardTitle>Decision Support Ladder</CardTitle>
              <CardDescription>Step-by-step decision guide based on current conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {ladder.length > 0 ? (
                <div className="space-y-4">
                  {ladder.map((step) => (
                    <div key={step.step} className="flex items-start gap-4 border rounded-lg p-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full ${getSeverityColor(step.severity)} flex items-center justify-center text-white font-bold`}>
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{step.parameter}</span>
                          <Badge className={getSeverityColor(step.severity)}>{step.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Value: {step.value} | Threshold: {' '} {step.threshold.min ?? '-∞'} {' - '} {step.threshold.max ?? '∞'}
                        </p>
                        <p className="text-sm mt-1">{step.action}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No active decision steps. Conditions are normal.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Impact Logs</CardTitle>
              <CardDescription>Recent impact events and actions taken</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action Taken</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.timestamp), 'MMM dd HH:mm')}</TableCell>
                      <TableCell>{log.eventType}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>
                        {log.isResolved ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
  {log.actionTaken || "-"}
</TableCell>

<TableCell className="text-right">
  {!log.isResolved && (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await api.acknowledgeImpact(
            log.id,
            "Acknowledged from Impact Logs"
          );

          toast.success("Impact acknowledged");

          fetchImpacts();
        } catch (error: any) {
          toast.error(
            error.response?.data?.message ||
              "Failed to acknowledge impact"
          );
        }
      }}
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      Acknowledge
    </Button>
  )}
</TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No impact logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          {stats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Impacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total ?? 0}</div>
                </CardContent>
              </Card>
              {(stats.bySeverity ?? []).map((s) => (
                <Card key={s.severity}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{s.severity}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
  {Number(s.percentage ?? 0).toFixed(1)}%
</p>

<div className="mt-2 w-full bg-muted rounded-full h-2">
  <div
    className="h-2 rounded-full bg-primary"
    style={{
      width: `${Math.min(
        Number(s.percentage ?? 0),
        100
      )}%`,
    }}
  />
</div>
                    <p className="text-xs text-muted-foreground">{Number(s.percentage ?? 0).toFixed(1)}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No statistics available
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};