import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Save,
  Filter,
} from 'lucide-react';

import { api } from '@/services/api';
import { useStationStore } from '@/stores/stationStore';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';



/* ============================================================
   TYPES
============================================================ */

export type SeverityLevel =
  | 'NORMAL'
  | 'MONITOR'
  | 'CAUTION'
  | 'RESTRICTED'
  | 'SEVERE'
  | 'CRITICAL';

export type UserRole =
  | 'ADMIN'
  | 'METEOROLOGIST'
  | 'DISPATCHER'
  | 'PILOT'
  | 'ATC'
  | 'OPERATIONS'
  | 'GROUND_HANDLER';

export type ThresholdParameter =
  | 'VISIBILITY'
  | 'RVR'
  | 'CEILING'
  | 'CROSSWIND'
  | 'HEADWIND'
  | 'TAILWIND'
  | 'WIND_GUST'
  | 'TEMPERATURE'
  | 'DENSITY_ALTITUDE'
  | 'THUNDERSTORM_PROXIMITY'
  | 'PRECIPITATION'
  | 'FREEZING_LEVEL'
  | 'TURBULENCE'
  | 'ICING';

export interface Threshold {
  id: string;

  stationId: string;

  parameter: ThresholdParameter;

  minValue: number;

  maxValue: number;

  severityLevel: SeverityLevel;

  userRole: UserRole;

  actionRequired?: string;

  enabled?: boolean;

  createdAt?: string;

  updatedAt?: string;
}



/* ============================================================
   CONFIGURATION
============================================================ */

const PARAMETER_CONFIG: Record<
  ThresholdParameter,
  {
    label: string;
    unit: string;
    description: string;
  }
> = {
  VISIBILITY: {
    label: 'Visibility',
    unit: 'm',
    description: 'Horizontal visibility',
  },

  RVR: {
    label: 'Runway Visual Range',
    unit: 'm',
    description: 'Runway visual range',
  },

  CEILING: {
    label: 'Ceiling',
    unit: 'ft',
    description: 'Cloud ceiling',
  },

  CROSSWIND: {
    label: 'Crosswind',
    unit: 'kt',
    description: 'Crosswind component',
  },

  HEADWIND: {
    label: 'Headwind',
    unit: 'kt',
    description: 'Headwind component',
  },

  TAILWIND: {
    label: 'Tailwind',
    unit: 'kt',
    description: 'Tailwind component',
  },

  WIND_GUST: {
    label: 'Wind Gust',
    unit: 'kt',
    description: 'Wind gust',
  },

  TEMPERATURE: {
    label: 'Temperature',
    unit: '°C',
    description: 'Surface temperature',
  },

  DENSITY_ALTITUDE: {
    label: 'Density Altitude',
    unit: 'ft',
    description: 'Density altitude',
  },

  THUNDERSTORM_PROXIMITY: {
    label: 'Thunderstorm',
    unit: 'NM',
    description: 'Distance from storm',
  },

  PRECIPITATION: {
    label: 'Precipitation',
    unit: 'mm/hr',
    description: 'Rainfall intensity',
  },

  FREEZING_LEVEL: {
    label: 'Freezing Level',
    unit: 'ft',
    description: 'Freezing level',
  },

  TURBULENCE: {
    label: 'Turbulence',
    unit: 'Level',
    description: 'Turbulence intensity',
  },

  ICING: {
    label: 'Icing',
    unit: 'Level',
    description: 'Icing intensity',
  },
};

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  NORMAL: 'bg-green-500',
  MONITOR: 'bg-yellow-500',
  CAUTION: 'bg-orange-500',
  RESTRICTED: 'bg-red-500',
  SEVERE: 'bg-red-700',
  CRITICAL: 'bg-red-900',
};
const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  METEOROLOGIST: 'Meteorologist',
  DISPATCHER: 'Dispatcher',
  PILOT: 'Pilot',
  ATC: 'Air Traffic Controller',
  OPERATIONS: 'Operations',
  GROUND_HANDLER: 'Ground Handler',
};

/* ============================================================
   COMPONENT
============================================================ */

const ThresholdsPage: React.FC = () => {
  const { activeStation } = useStationStore();

  const [thresholds, setThresholds] = useState<Threshold[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingThreshold, setEditingThreshold] =
    useState<Threshold | null>(null);

  const [search, setSearch] = useState('');

  const [parameterFilter, setParameterFilter] =
    useState<string>('ALL');

  const [severityFilter, setSeverityFilter] =
    useState<string>('ALL');

  const [roleFilter, setRoleFilter] =
    useState<string>('ALL');

  const [formData, setFormData] = useState({
    parameter: 'VISIBILITY' as ThresholdParameter,

    minValue: 0,

    maxValue: 1000,

    severityLevel: 'NORMAL' as SeverityLevel,

    userRole: 'PILOT' as UserRole,

    actionRequired: '',
  });

  /* ============================================================
     LOAD THRESHOLDS
  ============================================================ */

  useEffect(() => {
    if (!activeStation?.id) return;

    loadThresholds();
  }, [activeStation?.id]);

  const loadThresholds = async () => {
    if (!activeStation) return;

    setLoading(true);

    try {
      const response = await api.getThresholds(activeStation.id);

      setThresholds(response.data.data || []);
    } catch (error) {
      console.error(error);

      toast.error('Failed to load thresholds');
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FILTERS
  ============================================================ */

  const filteredThresholds = useMemo(() => {
    return thresholds.filter((threshold) => {
      const searchMatch =
        threshold.parameter
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (threshold.actionRequired || '')
          .toLowerCase()
          .includes(search.toLowerCase());

      const parameterMatch =
        parameterFilter === 'ALL' ||
        threshold.parameter === parameterFilter;

      const severityMatch =
        severityFilter === 'ALL' ||
        threshold.severityLevel === severityFilter;

      const roleMatch =
        roleFilter === 'ALL' ||
        threshold.userRole === roleFilter;

      return (
        searchMatch &&
        parameterMatch &&
        severityMatch &&
        roleMatch
      );
    });
  }, [
    thresholds,
    search,
    parameterFilter,
    severityFilter,
    roleFilter,
  ]);

  /* ============================================================
     RESET FORM
  ============================================================ */

  const resetForm = () => {
    setEditingThreshold(null);

    setFormData({
      parameter: 'VISIBILITY',

      minValue: 0,

      maxValue: 1000,

      severityLevel: 'NORMAL',

      userRole: 'PILOT',

      actionRequired: '',
    });
  };
    /* ============================================================
     CREATE / UPDATE THRESHOLD
  ============================================================ */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeStation) {
      toast.error('Please select an active station.');
      return;
    }

    if (formData.minValue >= formData.maxValue) {
      toast.error('Minimum value must be less than maximum value.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        stationId: activeStation.id,
      };

      if (editingThreshold) {
        await api.updateThreshold(editingThreshold.id, payload);

        toast.success('Threshold updated successfully');
      } else {
        await api.createThreshold(payload);

        toast.success('Threshold created successfully');
      }

      setDialogOpen(false);

      resetForm();

      await loadThresholds();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Failed to save threshold.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     EDIT
  ============================================================ */

  const handleEdit = (threshold: Threshold) => {
    setEditingThreshold(threshold);

    setFormData({
      parameter: threshold.parameter,
      minValue: threshold.minValue,
      maxValue: threshold.maxValue,
      severityLevel: threshold.severityLevel,
      userRole: threshold.userRole,
      actionRequired: threshold.actionRequired || '',
    });

    setDialogOpen(true);
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this threshold?')) return;

    try {
      await api.deleteThreshold(id);

      toast.success('Threshold deleted.');

      await loadThresholds();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Failed to delete threshold.'
      );
    }
  };

  /* ============================================================
     ENABLE / DISABLE
  ============================================================ */

  const handleToggle = async (id: string) => {
    try {
      await api.toggleThreshold(id);

      toast.success('Threshold updated.');

      await loadThresholds();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Failed to update threshold.'
      );
    }
  };

  /* ============================================================
     APPLY DEFAULTS
  ============================================================ */

  const applyDefaultThresholds = async () => {
    if (!activeStation) return;

    try {
      await api.applyDefaultThresholds(activeStation.id);

      toast.success('Default thresholds applied.');

      await loadThresholds();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          'Failed to apply default thresholds.'
      );
    }
  };

  /* ============================================================
     BADGES
  ============================================================ */

  const getSeverityBadge = (severity: SeverityLevel) => (
    <Badge className={SEVERITY_COLORS[severity]}>
      {severity}
    </Badge>
  );

  /* ============================================================
     NO ACTIVE STATION
  ============================================================ */

  if (!activeStation) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />

          <h2 className="text-xl font-semibold">
            No Active Station
          </h2>

          <p className="text-muted-foreground mt-2">
            Select a station before managing thresholds.
          </p>
        </div>
      </div>
    );
  };

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Threshold Management
          </h1>

          <p className="text-muted-foreground">
            Configure operational weather thresholds for{' '}
            <strong>{activeStation.name}</strong>
          </p>

        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={applyDefaultThresholds}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Apply Defaults
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Threshold
          </Button>

        </div>

      </div>
            {/* Filters */}

      <Card>
        <CardHeader>
          <CardTitle>Filter Thresholds</CardTitle>
          <CardDescription>
            Search and filter configured operational thresholds.
          </CardDescription>
        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="relative">

              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />

            </div>

            <Select
              value={parameterFilter}
              onValueChange={setParameterFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Parameter" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="ALL">
                  All Parameters
                </SelectItem>

                {Object.entries(PARAMETER_CONFIG).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                  >
                    {value.label}
                  </SelectItem>
                ))}

              </SelectContent>

            </Select>

            <Select
              value={severityFilter}
              onValueChange={setSeverityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="ALL">
                  All Severities
                </SelectItem>

                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="MONITOR">Monitor</SelectItem>
                <SelectItem value="CAUTION">Caution</SelectItem>
                <SelectItem value="RESTRICTED">Restricted</SelectItem>
                <SelectItem value="SEVERE">Severe</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>

              </SelectContent>

            </Select>

            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="ALL">
                  All Roles
                </SelectItem>

                {Object.entries(USER_ROLE_LABELS).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                  >
                    {value}
                  </SelectItem>
                ))}

              </SelectContent>

            </Select>

          </div>

        </CardContent>
      </Card>





      {/* Threshold Table */}

      <Card>

        <CardHeader>

          <CardTitle>
            Thresholds
          </CardTitle>

          <CardDescription>
            {filteredThresholds.length} threshold(s) found
          </CardDescription>

        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Parameter</TableHead>

                <TableHead>Range</TableHead>

                <TableHead>Severity</TableHead>

                <TableHead>User Role</TableHead>

                <TableHead>Action Required</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {loading ? (

                <TableRow>

                  <TableCell
                    colSpan={7}
                    className="text-center py-10"
                  >

                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />

                  </TableCell>

                </TableRow>

              ) : filteredThresholds.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >

                    No thresholds available.

                  </TableCell>

                </TableRow>

              ) : (

                filteredThresholds.map((threshold) => (

                  <TableRow key={threshold.id}>

                    <TableCell>

                      <div>

                        <div className="font-medium">
                          {PARAMETER_CONFIG[threshold.parameter]?.label}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {PARAMETER_CONFIG[threshold.parameter]?.unit}
                        </div>

                      </div>

                    </TableCell>

                    <TableCell>

                      {threshold.minValue} - {threshold.maxValue}{' '}
                      {PARAMETER_CONFIG[threshold.parameter]?.unit}

                    </TableCell>

                    <TableCell>

                      {getSeverityBadge(threshold.severityLevel)}

                    </TableCell>

                    <TableCell>

                      {USER_ROLE_LABELS[threshold.userRole]}

                    </TableCell>

                    <TableCell className="max-w-sm">

                      {threshold.actionRequired || '-'}

                    </TableCell>

                    <TableCell>

                      <Badge
                        variant={
                          threshold.enabled === false
                            ? 'outline'
                            : 'default'
                        }
                      >
                        {threshold.enabled === false
                          ? 'Disabled'
                          : 'Enabled'}
                      </Badge>

                    </TableCell>

                    <TableCell className="text-right">

                      <div className="flex justify-end gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggle(threshold.id)
                          }
                        >
                          {threshold.enabled === false
                            ? 'Enable'
                            : 'Disable'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEdit(threshold)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDelete(threshold.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                      </div>

                    </TableCell>

                  </TableRow>

                ))

              )}

            </TableBody>

          </Table>

        </CardContent>

      </Card>





      {/* Create / Edit Dialog */}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >

        <DialogContent className="max-w-3xl">

          <DialogHeader>

            <DialogTitle>

              {editingThreshold
                ? 'Edit Threshold'
                : 'Create Threshold'}

            </DialogTitle>

            <DialogDescription>

              Configure operational weather thresholds.

            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
                        <div className="grid grid-cols-2 gap-4">

              <div>
                <Label>Parameter</Label>

                <Select
                  value={formData.parameter}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      parameter: value as ThresholdParameter,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.entries(PARAMETER_CONFIG).map(
                      ([key, value]) => (
                        <SelectItem
                          key={key}
                          value={key}
                        >
                          {value.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>User Role</Label>

                <Select
                  value={formData.userRole}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      userRole: value as UserRole,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.entries(USER_ROLE_LABELS).map(
                      ([key, value]) => (
                        <SelectItem
                          key={key}
                          value={key}
                        >
                          {value}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

            </div>





            <div className="grid grid-cols-2 gap-4">

              <div>

                <Label>Minimum Value</Label>

                <Input
                  type="number"
                  value={formData.minValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minValue: Number(e.target.value),
                    })
                  }
                />

              </div>

              <div>

                <Label>Maximum Value</Label>

                <Input
                  type="number"
                  value={formData.maxValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxValue: Number(e.target.value),
                    })
                  }
                />

              </div>

            </div>





            <div>

              <Label>Severity</Label>

              <Select
                value={formData.severityLevel}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    severityLevel:
                      value as SeverityLevel,
                  })
                }
              >

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="NORMAL">
                    Normal
                  </SelectItem>

                  <SelectItem value="MONITOR">
                    Monitor
                  </SelectItem>

                  <SelectItem value="CAUTION">
                    Caution
                  </SelectItem>

                  <SelectItem value="RESTRICTED">
                    Restricted
                  </SelectItem>

                  <SelectItem value="SEVERE">
                    Severe
                  </SelectItem>

                  <SelectItem value="CRITICAL">
                    Critical
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>





            <div>

              <Label>Action Required</Label>

              <Input
                value={formData.actionRequired}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    actionRequired: e.target.value,
                  })
                }
                placeholder="Describe the operational action..."
              />

            </div>





            <div>

              <Label>
                Threshold Range
              </Label>

              <div className="grid grid-cols-2 gap-4">
    <div>
        <label className="text-sm font-medium">
            Minimum Value
        </label>

        <input
            type="range"
            min="0"
            max="10000"
            step="1"
            value={formData.minValue || 0}
            onChange={(e) =>
                setFormData({
                    ...formData,
                    minValue: Number(e.target.value),
                })
            }
            className="w-full"
        />
    </div>

    <div>
        <label className="text-sm font-medium">
            Maximum Value
        </label>

        <input
            type="range"
            min="0"
            max="10000"
            step="1"
            value={formData.maxValue || 100}
            onChange={(e) =>
                setFormData({
                    ...formData,
                    maxValue: Number(e.target.value),
                })
            }
            className="w-full"
        />
    </div>
</div>

<div className="flex justify-between text-sm text-muted-foreground">
    <span>Min: {formData.minValue}</span>
    <span>Max: {formData.maxValue}</span>
</div>

              <div className="flex justify-between text-sm text-muted-foreground mt-2">

                <span>
                  Min: {formData.minValue}
                </span>

                <span>
                  Max: {formData.maxValue}
                </span>

              </div>

            </div>





            <DialogFooter>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingThreshold
                      ? 'Update Threshold'
                      : 'Create Threshold'}
                  </>
                )}
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

    </div>

  );

};

export default ThresholdsPage;