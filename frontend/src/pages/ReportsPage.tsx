import React, { useState } from 'react';
import { useStationStore } from '@/stores/stationStore';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Loader2, Calendar, FileSpreadsheet, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { VoiceGuideButton } from '@/components/ui/VoiceGuideButton';
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  createdAt?: string;
  updatedAt?: string;
}
export const ReportsPage: React.FC = () => {
  const { activeStation } = useStationStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('weather');
  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
const [templatesError, setTemplatesError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
  setTemplatesLoading(true);
  setTemplatesError('');

  try {
    const response = await api.getReportTemplates();

    setTemplates(response.data.data as ReportTemplate[]);
  } catch (error) {
    console.error('Failed to fetch templates:', error);

    setTemplatesError('Failed to load report templates.');

    toast.error('Failed to load report templates.');
  } finally {
    setTemplatesLoading(false);
  }
};
  const validateDates = () => {
  if (!startDate || !endDate) {
    toast.error("Please select both start and end dates.");
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    toast.error("Start date cannot be after end date.");
    return false;
  }

  return true;
};

const downloadBlob = (
  data: BlobPart,
  fileName: string,
  mimeType: string
) => {
  const blob = new Blob([data], { type: mimeType });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};  
const generateReport = async () => {
    if (!validateDates()) return;

    if (!activeStation) {
      toast.error('Please select a station first');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
  toast.error('Start date cannot be after end date.');
  return;
}

    setIsGenerating(true);
    try {
      const params = {
        stationId: activeStation.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        format,
      };

      let response;
      switch (reportType) {
        case 'weather':
          response = await api.generateWeatherReport(params);
          break;
        case 'impact':
          response = await api.generateImpactReport(params);
          break;
        case 'operational':
          response = await api.generateOperationalReport(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (format === 'pdf') {
        // Handle PDF download
       downloadBlob(
  response.data,
  `${reportType}-report-${Date.now()}.pdf`,
  "application/pdf"
);
        toast.success('Report downloaded successfully');
      } else {
        toast.success('Report generated successfully');
        // Handle JSON response
        console.log('Report data:', response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildReportsNarration = () => {
    const stationName = activeStation?.name || 'the selected station';
    const reportLabel = reportType === 'weather' ? 'weather' : reportType === 'impact' ? 'impact' : 'operational';
    const formatLabel = format === 'pdf' ? 'PDF' : format === 'csv' ? 'CSV' : 'Excel';
    const templateName = selectedTemplate
      ? templates.find((template) => template.id === selectedTemplate)?.name || 'the selected template'
      : 'no template selected';
    const templateCount = templates.length;

    return `For ${stationName}, the report builder is set to generate a ${reportLabel} report in ${formatLabel} format from ${startDate} to ${endDate}. There are ${templateCount} templates available, and the current selection is ${templateName}. The report is useful for reviewing recent station conditions, documenting decisions, and sharing clear operational evidence with the wider team.`;
  };

  const exportData = async (type: 'csv' | 'excel') => {
    if (!validateDates()) return;

    if (!activeStation) {
      toast.error('Please select a station first');
      return;
    }
    const start = new Date(startDate);
const end = new Date(endDate);

if (start > end) {
  toast.error('Start date cannot be after End date');
  return;
}
    if (new Date(startDate) > new Date(endDate)) {
  toast.error('Start date cannot be after end date.');
  return;
}

    setIsGenerating(true);
    try {
      const params = {
        stationId: activeStation.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        dataType: reportType,
      };

      let response;
      if (type === 'csv') {
        response = await api.exportCSV(params);
      } else {
        response = await api.exportExcel(params);
      }

      const extension = type === 'csv' ? 'csv' : 'xlsx';
      const mimeType = type === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      downloadBlob(
  response.data,
  `${reportType}-data-${Date.now()}.${extension}`,
  mimeType
);
      
      toast.success(`${type.toUpperCase()} exported successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to export ${type.toUpperCase()}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeStation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a station to generate reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            {activeStation.name} ({activeStation.code})
          </p>
        </div>
        <VoiceGuideButton
          label="Hear report details"
          message={buildReportsNarration()}
        />
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>
                Create a comprehensive report for the selected station and time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weather">Weather Report</SelectItem>
                        <SelectItem value="impact">Impact Assessment</SelectItem>
                        <SelectItem value="operational">Operational Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={generateReport} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
  {templatesLoading ? (

    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>

  ) : templatesError ? (

    <div className="text-center py-12">
      <p className="text-red-500 mb-4">
        {templatesError}
      </p>

      <Button
        variant="outline"
        onClick={fetchTemplates}
      >
        Retry
      </Button>
    </div>

  ) : templates.length === 0 ? (

    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

      <h3 className="text-lg font-semibold">
        No Report Templates
      </h3>

      <p className="text-muted-foreground mt-2">
        No report templates have been created yet.
      </p>
    </div>

  ) : (

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template: ReportTemplate) => (
        <Card
          key={template.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle className="text-lg">
              {template.name}
            </CardTitle>

            <CardDescription>
              {template.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">

              <div className="flex flex-wrap gap-1">
                {template.sections.map((section: string) => (
                  <Badge
                    key={section}
                    variant="outline"
                    className="text-xs"
                  >
                    {section}
                  </Badge>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setSelectedTemplate(template.id);
                  toast.success(`Template "${template.name}" selected`);
                }}
              >
                Use Template
              </Button>

            </div>
          </CardContent>
        </Card>
      ))}
    </div>

  )}
</TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export raw data for analysis in external tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exportType">Data Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weather">Weather Data</SelectItem>
                        <SelectItem value="impact">Impact Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exportStartDate">Start Date</Label>
                    <Input
                      id="exportStartDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exportEndDate">End Date</Label>
                    <Input
                      id="exportEndDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    onClick={() => exportData('csv')}
                    disabled={isGenerating}
                    variant="outline"
                    className="gap-2"
                  >
                    <File className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    onClick={() => exportData('excel')}
                    disabled={isGenerating}
                    variant="outline"
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};